/* dashboard.js — Compliance dashboard with calendar view + document vault */

/* ── DOM ── */
const listEl        = document.getElementById('compliance-list');
const alertBarEl    = document.getElementById('alert-bar');
const progressBar   = document.getElementById('progress-bar');
const searchInput   = document.getElementById('search');
const filterSelect  = document.getElementById('filter');
const logoutBtn     = document.getElementById('logout-btn');
const userEmailEl   = document.getElementById('user-email');
const toastEl       = document.getElementById('toast');

const modal           = document.getElementById('compliance-modal');
const modalTitle      = document.getElementById('modal-title');
const modalDescription= document.getElementById('modal-description');
const modalDocs       = document.getElementById('modal-documents');
const modalHistory    = document.getElementById('modal-history');
const closeBtn        = document.getElementById('close-btn');
const doneBtn         = document.getElementById('done-btn');
const docVaultList    = document.getElementById('doc-vault-list');
const fileInput       = document.getElementById('file-input');
const docUploadBtn    = document.getElementById('doc-upload-btn');
const docUploadMeta   = document.getElementById('doc-upload-meta');
const docFileName     = document.getElementById('doc-file-name');
const docExpiryDate   = document.getElementById('doc-expiry-date');
const docConfirmUpload= document.getElementById('doc-confirm-upload');
const docCancelUpload = document.getElementById('doc-cancel-upload');

const viewCards    = document.getElementById('view-cards');
const viewCalendar = document.getElementById('view-calendar');
const cardView     = document.getElementById('card-view');
const calView      = document.getElementById('calendar-view');
const calPrev      = document.getElementById('cal-prev');
const calNext      = document.getElementById('cal-next');
const calMonthLbl  = document.getElementById('cal-month-label');
const calGrid      = document.getElementById('cal-grid');
const calDayDetail = document.getElementById('cal-day-detail');
const calDetailDate= document.getElementById('cal-detail-date');
const calDetailItems= document.getElementById('cal-detail-items');

/* ── State ── */
let selectedCompliance = null;
let compliances = [];
let db, uid, storage;
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();
let pendingFile = null;

/* ── Toast ── */
let toastTimer = null;
function toast(msg, ms = 2500) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
}

/* ── Helpers ── */
function daysUntil(dateStr) {
  const due   = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function statusColor(c) {
  if (c.status === 'Completed') return 'green';
  const d = daysUntil(c.dueDate);
  if (d < 0)   return 'red';
  if (d <= 30) return 'orange';
  return 'blue';
}

/* ── Firebase save ── */
function save() {
  if (uid) {
    db.collection('users').doc(uid).update({ compliances });
  }
}

/* ── Alert bar ── */
function updateAlertBar() {
  const overdue  = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0).length;
  const dueSoon  = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 7).length;
  if (overdue > 0 || dueSoon > 0) {
    alertBarEl.textContent = `${overdue > 0 ? overdue + ' overdue' : ''}${overdue && dueSoon ? ' · ' : ''}${dueSoon > 0 ? dueSoon + ' due within 7 days' : ''}`;
    alertBarEl.classList.remove('hidden');
    alertBarEl.className = 'alert-bar' + (overdue > 0 ? '' : ' warn');
  } else {
    alertBarEl.classList.add('hidden');
  }
}

/* ── Render compliance cards ── */
function renderCompliances() {
  const query  = (searchInput.value || '').toLowerCase();
  const filter = filterSelect.value;

  listEl.innerHTML = '';
  let completed = 0;

  const filtered = compliances.filter(c => {
    const matchQ = !query  || c.name.toLowerCase().includes(query) || (c.authority || '').toLowerCase().includes(query);
    const matchF = !filter || c.category === filter;
    return matchQ && matchF;
  });

  if (!filtered.length) {
    listEl.innerHTML = '<div class="empty-state">No compliance items match your search.</div>';
  }

  filtered.forEach(c => {
    if (c.status === 'Completed') completed++;
    const days  = daysUntil(c.dueDate);
    const color = statusColor(c);
    const label = c.status === 'Completed' ? 'Done'
      : days < 0  ? `${Math.abs(days)}d overdue`
      : days === 0 ? 'Due today'
      : `${days}d left`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <h3>${c.name}</h3>
        <p style="font-size:13px;color:var(--muted);margin-top:3px">${c.authority || ''} · Due ${c.dueDate}</p>
      </div>
      <span class="badge badge-${color}">${label}</span>
    `;
    card.addEventListener('click', () => openModal(c));
    listEl.appendChild(card);
  });

  const total = compliances.filter(c => c.status !== 'Completed').length + completed;
  progressBar.style.width = total > 0 ? `${(completed / total) * 100}%` : '0%';
  updateAlertBar();
}

/* ── Compliance Modal ── */
function openModal(c) {
  selectedCompliance = c;
  modalTitle.textContent = c.name;
  modalDescription.textContent = c.description || '';
  modalDocs.innerHTML = (c.documents || []).map(d => `<li>${d}</li>`).join('');
  modalHistory.innerHTML = (c.history || []).map(h => `<li>${h}</li>`).join('');
  renderDocVault(c);
  // Reset upload area
  docUploadMeta.classList.add('hidden');
  pendingFile = null;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  selectedCompliance = null;
  pendingFile = null;
  docUploadMeta.classList.add('hidden');
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

doneBtn.addEventListener('click', () => {
  if (!selectedCompliance) return;
  selectedCompliance.status = 'Completed';
  selectedCompliance.history = selectedCompliance.history || [];
  selectedCompliance.history.push('Marked completed on ' + new Date().toLocaleDateString('en-IN'));
  save();
  renderCompliances();
  renderCalendar();
  closeModal();
  toast('Marked as done');
});

/* ── Document Vault ── */
function renderDocVault(c) {
  const docs = c.vaultDocs || [];
  if (!docs.length) {
    docVaultList.innerHTML = '<p class="doc-vault-empty">No documents uploaded yet.</p>';
    return;
  }
  docVaultList.innerHTML = docs.map((d, i) => {
    const days = d.expiry ? daysUntil(d.expiry) : null;
    const badgeCls = days === null ? 'badge-gray'
      : days < 0  ? 'badge-red'
      : days <= 30 ? 'badge-orange'
      : 'badge-green';
    const expiryLabel = d.expiry
      ? (days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Expires today' : `Expires in ${days}d`)
      : 'No expiry set';
    return `
      <div class="doc-vault-item">
        <div class="doc-vault-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
        </div>
        <div class="doc-vault-info">
          <div class="doc-vault-name">${d.name}</div>
          <div class="doc-vault-meta">${new Date(d.uploadedAt).toLocaleDateString('en-IN')}</div>
        </div>
        <span class="badge ${badgeCls}">${expiryLabel}</span>
        ${d.url ? `<a href="${d.url}" target="_blank" class="btn small ghost doc-view-btn">View</a>` : ''}
        <button class="btn small ghost doc-del-btn" data-idx="${i}">Delete</button>
      </div>
    `;
  }).join('');

  docVaultList.querySelectorAll('.doc-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      selectedCompliance.vaultDocs.splice(idx, 1);
      save();
      renderDocVault(selectedCompliance);
      toast('Document removed');
    });
  });
}

docUploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (!fileInput.files.length) return;
  pendingFile = fileInput.files[0];
  docFileName.textContent = pendingFile.name;
  docUploadMeta.classList.remove('hidden');
  fileInput.value = '';
});

docCancelUpload.addEventListener('click', () => {
  pendingFile = null;
  docUploadMeta.classList.add('hidden');
});

docConfirmUpload.addEventListener('click', async () => {
  if (!pendingFile || !selectedCompliance) return;

  docConfirmUpload.textContent = 'Saving…';
  docConfirmUpload.disabled = true;

  const expiry = docExpiryDate.value || '';
  let url = '';

  // Try Firebase Storage upload; fall back to name-only if credentials not set
  try {
    const ref = storage.ref(`users/${uid}/docs/${selectedCompliance.id}/${pendingFile.name}`);
    await ref.put(pendingFile);
    url = await ref.getDownloadURL();
  } catch (err) {
    // Storage not configured yet — store metadata only
    console.warn('Storage upload skipped (placeholder creds):', err.message);
  }

  selectedCompliance.vaultDocs = selectedCompliance.vaultDocs || [];
  selectedCompliance.vaultDocs.push({
    name:       pendingFile.name,
    url,
    expiry,
    uploadedAt: new Date().toISOString(),
  });

  selectedCompliance.history = selectedCompliance.history || [];
  selectedCompliance.history.push(`Uploaded "${pendingFile.name}" on ${new Date().toLocaleDateString('en-IN')}`);

  save();
  renderDocVault(selectedCompliance);
  modalHistory.innerHTML = selectedCompliance.history.map(h => `<li>${h}</li>`).join('');

  pendingFile = null;
  docExpiryDate.value = '';
  docUploadMeta.classList.add('hidden');
  docConfirmUpload.textContent = 'Save';
  docConfirmUpload.disabled = false;
  toast('Document saved');
});

/* ── Calendar View ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function renderCalendar() {
  calMonthLbl.textContent = `${MONTHS[calMonth]} ${calYear}`;

  // Build date→items map
  const itemsByDate = {};
  compliances.forEach(c => {
    if (!c.dueDate) return;
    itemsByDate[c.dueDate] = itemsByDate[c.dueDate] || [];
    itemsByDate[c.dueDate].push(c);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  calGrid.innerHTML = '';

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    calGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const items   = itemsByDate[dateStr] || [];
    const isToday = today.getDate() === d && today.getMonth() === calMonth && today.getFullYear() === calYear;

    const cell = document.createElement('div');
    cell.className = 'cal-cell' + (isToday ? ' today' : '') + (items.length ? ' has-items' : '');
    cell.innerHTML = `<span class="cal-day-num">${d}</span>`;

    if (items.length) {
      const dots = document.createElement('div');
      dots.className = 'cal-dots';
      items.slice(0, 3).forEach(item => {
        const dot = document.createElement('span');
        const color = statusColor(item);
        dot.className = `cal-dot cal-dot-${color}`;
        dots.appendChild(dot);
      });
      if (items.length > 3) {
        const more = document.createElement('span');
        more.className = 'cal-dot-more';
        more.textContent = `+${items.length - 3}`;
        dots.appendChild(more);
      }
      cell.appendChild(dots);

      cell.addEventListener('click', () => showDayDetail(dateStr, items));
    }

    calGrid.appendChild(cell);
  }
}

function showDayDetail(dateStr, items) {
  const d = new Date(dateStr + 'T00:00:00');
  calDetailDate.textContent = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  calDetailItems.innerHTML = items.map(c => {
    const days  = daysUntil(c.dueDate);
    const color = statusColor(c);
    const label = c.status === 'Completed' ? 'Done' : days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`;
    return `
      <div class="cal-detail-item" data-id="${c.id}">
        <span class="cal-detail-dot cal-dot-${color}"></span>
        <div class="cal-detail-info">
          <span class="cal-detail-name">${c.name}</span>
          <span class="cal-detail-auth">${c.authority || ''}</span>
        </div>
        <span class="badge badge-${color}">${label}</span>
      </div>
    `;
  }).join('');

  calDetailItems.querySelectorAll('.cal-detail-item').forEach(el => {
    el.addEventListener('click', () => {
      const c = compliances.find(x => String(x.id) === String(el.dataset.id));
      if (c) openModal(c);
    });
  });

  calDayDetail.classList.remove('hidden');
}

calPrev.addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
  calDayDetail.classList.add('hidden');
});
calNext.addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
  calDayDetail.classList.add('hidden');
});

/* ── View toggle ── */
viewCards.addEventListener('click', () => {
  viewCards.classList.add('active');
  viewCalendar.classList.remove('active');
  cardView.classList.remove('hidden');
  calView.classList.add('hidden');
});
viewCalendar.addEventListener('click', () => {
  viewCalendar.classList.add('active');
  viewCards.classList.remove('active');
  calView.classList.remove('hidden');
  cardView.classList.add('hidden');
  renderCalendar();
});

/* ── Filters ── */
searchInput.addEventListener('input', renderCompliances);
filterSelect.addEventListener('change', renderCompliances);

/* ── Logout ── */
logoutBtn.addEventListener('click', () => {
  firebase.auth().signOut().then(() => { window.location.href = 'index.html'; });
});

/* ── Auth + Init ── */
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  uid     = user.uid;
  db      = firebase.firestore();
  storage = firebase.storage();
  userEmailEl.textContent = user.displayName || user.email;

  db.collection('users').doc(uid).get().then(doc => {
    if (!doc.exists) {
      // New user — send to onboarding
      window.location.href = 'onboarding.html';
      return;
    }

    const data = doc.data();

    if (!data.onboardingComplete) {
      window.location.href = 'onboarding.html';
      return;
    }

    compliances = Array.isArray(data.compliances) ? data.compliances : window.compliances;
    renderCompliances();
  }).catch(() => {
    // Firestore unavailable (placeholder creds) — use demo data
    compliances = window.compliances;
    renderCompliances();
  });
});
