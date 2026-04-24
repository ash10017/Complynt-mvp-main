/* people.js — People management: employees, shifts, labour compliance */

(() => {
  /* ── Constants ── */
  const ESIC_THRESHOLD = 21000;
  const ESIC_EMP_RATE  = 0.0075;
  const ESIC_ER_RATE   = 0.0325;
  const PF_RATE        = 0.12;
  const PT_THRESHOLD   = 15000;
  const PT_AMOUNT      = 200;
  const MIN_WAGE_KA    = 9518; // Karnataka unskilled, Apr 2024

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* ── State ── */
  let employees = [];    // cached from Firestore
  let shifts    = {};    // { "YYYY-MM-DD": [{ empId, start, end, note, id }] }
  let editingEmpId   = null;
  let editingShiftId = null;
  let weekOffset     = 0; // 0 = current week
  let pendingShiftDate = null;

  /* ── Firebase refs (populated after auth) ── */
  let db, uid;
  let empRef, shiftRef;

  /* ── DOM ── */
  const userNameEl   = document.getElementById('user-name');
  const logoutBtn    = document.getElementById('logout-btn');

  const statTotal    = document.getElementById('stat-total');
  const statActive   = document.getElementById('stat-active');
  const statEsic     = document.getElementById('stat-esic');
  const statPf       = document.getElementById('stat-pf');
  const statWage     = document.getElementById('stat-wage');

  const empGrid      = document.getElementById('employee-grid');
  const empEmpty     = document.getElementById('emp-empty');
  const empSearch    = document.getElementById('emp-search');
  const empDeptFilter= document.getElementById('emp-dept-filter');
  const addEmpBtn    = document.getElementById('add-emp-btn');

  const shiftGrid    = document.getElementById('shift-grid');
  const weekLabel    = document.getElementById('week-label');
  const shiftPrev    = document.getElementById('shift-prev');
  const shiftNext    = document.getElementById('shift-next');

  const toastEl      = document.getElementById('toast');

  /* ── Employee Modal ── */
  const empModal      = document.getElementById('emp-modal');
  const empModalTitle = document.getElementById('emp-modal-title');
  const empModalClose = document.getElementById('emp-modal-close');
  const empCancelBtn  = document.getElementById('emp-cancel-btn');
  const empSaveBtn    = document.getElementById('emp-save-btn');
  const deleteEmpBtn  = document.getElementById('delete-emp-btn');
  const fName    = document.getElementById('f-name');
  const fRole    = document.getElementById('f-role');
  const fDept    = document.getElementById('f-dept');
  const fStatus  = document.getElementById('f-status');
  const fSalary  = document.getElementById('f-salary');
  const fBasic   = document.getElementById('f-basic');
  const fPhone   = document.getElementById('f-phone');
  const fDoj     = document.getElementById('f-doj');
  const fUan     = document.getElementById('f-uan');
  const fEsic    = document.getElementById('f-esic');
  const fNotes   = document.getElementById('f-notes');
  const cpEsic     = document.getElementById('cp-esic');
  const cpEsicEmp  = document.getElementById('cp-esic-emp');
  const cpEsicEr   = document.getElementById('cp-esic-er');
  const cpPfEmp    = document.getElementById('cp-pf-emp');
  const cpPfEr     = document.getElementById('cp-pf-er');
  const cpPt       = document.getElementById('cp-pt');

  /* ── Shift Modal ── */
  const shiftModal      = document.getElementById('shift-modal');
  const shiftModalTitle = document.getElementById('shift-modal-title');
  const shiftModalClose = document.getElementById('shift-modal-close');
  const shiftCancelBtn  = document.getElementById('shift-cancel-btn');
  const shiftSaveBtn    = document.getElementById('shift-save-btn');
  const sfEmp   = document.getElementById('sf-emp');
  const sfStart = document.getElementById('sf-start');
  const sfEnd   = document.getElementById('sf-end');
  const sfNote  = document.getElementById('sf-note');

  /* ── Toast ── */
  let toastTimer = null;
  function toast(msg, ms = 2500) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
  }

  /* ── Calculations ── */
  function calcEsic(gross) {
    if (gross > ESIC_THRESHOLD) return null;
    return {
      emp: Math.round(gross * ESIC_EMP_RATE),
      er:  Math.round(gross * ESIC_ER_RATE),
    };
  }
  function calcPf(basic) {
    if (!basic || basic <= 0) return null;
    const capped = Math.min(basic, 15000); // PF wage cap
    return {
      emp: Math.round(capped * PF_RATE),
      er:  Math.round(capped * PF_RATE),
    };
  }
  function calcPt(gross) {
    return gross > PT_THRESHOLD ? PT_AMOUNT : 0;
  }

  function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  /* ── Salary preview inside modal ── */
  function updateCalcPreview() {
    const gross = Number(fSalary.value) || 0;
    const basic = Number(fBasic.value) || 0;
    const esic = calcEsic(gross);
    const pf   = calcPf(basic);
    const pt   = calcPt(gross);

    cpEsic.textContent    = gross > 0 ? (esic ? 'Yes' : 'No (salary > ₹21,000)') : '—';
    cpEsicEmp.textContent = esic ? fmt(esic.emp) : '—';
    cpEsicEr.textContent  = esic ? fmt(esic.er)  : '—';
    cpPfEmp.textContent   = pf   ? fmt(pf.emp)   : basic ? 'Exempt (no UAN?)' : '—';
    cpPfEr.textContent    = pf   ? fmt(pf.er)    : '—';
    cpPt.textContent      = pt   ? fmt(pt) : '₹0 (below ₹15,000)';
  }

  /* ── Stats ── */
  function renderStats() {
    const active = employees.filter(e => e.status === 'active');
    const esicApplicable = active.filter(e => e.salary <= ESIC_THRESHOLD);
    const pfEnrolled     = active.filter(e => e.uan && e.basic > 0);
    const totalWage      = active.reduce((s, e) => s + (e.salary || 0), 0);

    statTotal.textContent  = employees.length;
    statActive.textContent = active.length;
    statEsic.textContent   = esicApplicable.length;
    statPf.textContent     = pfEnrolled.length;
    statWage.textContent   = fmt(totalWage);
  }

  /* ── Labour Compliance ── */
  function renderLabour() {
    const active = employees.filter(e => e.status === 'active');

    // ESIC
    const esicEmps = active.filter(e => e.salary <= ESIC_THRESHOLD);
    let esicEmpTotal = 0, esicErTotal = 0;
    esicEmps.forEach(e => {
      const c = calcEsic(e.salary);
      if (c) { esicEmpTotal += c.emp; esicErTotal += c.er; }
    });
    document.getElementById('esic-count').textContent = esicEmps.length;
    document.getElementById('esic-emp').textContent   = fmt(esicEmpTotal);
    document.getElementById('esic-er').textContent    = fmt(esicErTotal);
    document.getElementById('esic-total').textContent = fmt(esicEmpTotal + esicErTotal);
    document.getElementById('esic-status').textContent = esicEmps.length ? 'Active' : 'N/A';
    document.getElementById('esic-status').className  = 'badge ' + (esicEmps.length ? 'badge-blue' : 'badge-gray');

    // PF
    const pfEmps = active.filter(e => e.uan && e.basic > 0);
    let pfEmpTotal = 0, pfErTotal = 0;
    pfEmps.forEach(e => {
      const c = calcPf(e.basic);
      if (c) { pfEmpTotal += c.emp; pfErTotal += c.er; }
    });
    document.getElementById('pf-count').textContent  = pfEmps.length;
    document.getElementById('pf-emp').textContent    = fmt(pfEmpTotal);
    document.getElementById('pf-er').textContent     = fmt(pfErTotal);
    document.getElementById('pf-total').textContent  = fmt(pfEmpTotal + pfErTotal);
    document.getElementById('pf-status').textContent = pfEmps.length ? 'Active' : 'N/A';
    document.getElementById('pf-status').className   = 'badge ' + (pfEmps.length ? 'badge-blue' : 'badge-gray');

    // Minimum wage
    const below = active.filter(e => e.salary < MIN_WAGE_KA);
    const ok    = active.filter(e => e.salary >= MIN_WAGE_KA);
    document.getElementById('mw-below').textContent = below.length;
    document.getElementById('mw-ok').textContent    = ok.length;
    document.getElementById('mw-status').textContent = below.length ? `${below.length} at risk` : 'All compliant';
    document.getElementById('mw-status').className   = 'badge ' + (below.length ? 'badge-red' : 'badge-green');

    // Professional Tax
    const ptEmps = active.filter(e => e.salary > PT_THRESHOLD);
    document.getElementById('pt-count').textContent = ptEmps.length;
    document.getElementById('pt-total').textContent = fmt(ptEmps.length * PT_AMOUNT);
    document.getElementById('pt-status').textContent = ptEmps.length ? 'Active' : 'N/A';
    document.getElementById('pt-status').className   = 'badge ' + (ptEmps.length ? 'badge-blue' : 'badge-gray');
  }

  /* ── Employee Grid ── */
  function renderEmployees() {
    const query = (empSearch.value || '').toLowerCase();
    const dept  = empDeptFilter.value;

    const filtered = employees.filter(e => {
      const matchQ = !query || e.name.toLowerCase().includes(query) || e.role.toLowerCase().includes(query);
      const matchD = !dept  || e.dept === dept;
      return matchQ && matchD;
    });

    empEmpty.style.display = filtered.length ? 'none' : '';
    // Remove old cards (keep empty state)
    Array.from(empGrid.children).forEach(c => {
      if (c !== empEmpty) c.remove();
    });

    filtered.forEach(emp => {
      const initials = emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const card = document.createElement('div');
      card.className = 'employee-card';
      card.dataset.id = emp.id;

      const esicApplicable = emp.salary <= ESIC_THRESHOLD;
      const pfEnrolled     = emp.uan && emp.basic > 0;
      const mwOk           = emp.salary >= MIN_WAGE_KA;

      card.innerHTML = `
        <div class="emp-top">
          <div class="emp-avatar">${initials}</div>
          <div class="emp-info">
            <div class="emp-name">${esc(emp.name)}</div>
            <div class="emp-role">${esc(emp.role)} &middot; ${esc(emp.dept)}</div>
          </div>
          <span class="badge ${emp.status === 'active' ? 'badge-green' : 'badge-gray'}">${emp.status === 'active' ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="emp-salary">${fmt(emp.salary)}<span class="emp-salary-label">/mo gross</span></div>
        <div class="emp-flags">
          <span class="badge ${esicApplicable ? 'badge-blue' : 'badge-gray'}">ESIC</span>
          <span class="badge ${pfEnrolled ? 'badge-blue' : 'badge-gray'}">PF</span>
          <span class="badge ${mwOk ? 'badge-green' : 'badge-orange'}">Min. Wage</span>
        </div>
        <div class="emp-actions">
          <button class="btn small edit-emp-btn" data-id="${emp.id}">Edit</button>
        </div>
      `;
      empGrid.appendChild(card);
    });

    empGrid.querySelectorAll('.edit-emp-btn').forEach(btn => {
      btn.addEventListener('click', e => openEditEmp(e.target.dataset.id));
    });
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Open Add/Edit Employee Modal ── */
  function openAddEmp() {
    editingEmpId = null;
    empModalTitle.textContent = 'Add Employee';
    fName.value = fRole.value = fPhone.value = fUan.value = fEsic.value = fNotes.value = '';
    fDept.value = fStatus.value = '';
    fSalary.value = fBasic.value = '';
    fDoj.value = '';
    deleteEmpBtn.classList.add('hidden');
    updateCalcPreview();
    empModal.classList.remove('hidden');
    fName.focus();
  }

  function openEditEmp(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    editingEmpId = id;
    empModalTitle.textContent = 'Edit Employee';
    fName.value   = emp.name   || '';
    fRole.value   = emp.role   || '';
    fDept.value   = emp.dept   || '';
    fStatus.value = emp.status || 'active';
    fSalary.value = emp.salary || '';
    fBasic.value  = emp.basic  || '';
    fPhone.value  = emp.phone  || '';
    fDoj.value    = emp.doj    || '';
    fUan.value    = emp.uan    || '';
    fEsic.value   = emp.esicNo || '';
    fNotes.value  = emp.notes  || '';
    deleteEmpBtn.classList.remove('hidden');
    updateCalcPreview();
    empModal.classList.remove('hidden');
    fName.focus();
  }

  function closeEmpModal() {
    empModal.classList.add('hidden');
    editingEmpId = null;
  }

  async function saveEmployee() {
    const name   = fName.value.trim();
    const role   = fRole.value.trim();
    const dept   = fDept.value;
    const salary = Number(fSalary.value) || 0;
    if (!name || !role || !dept || !salary) {
      toast('Please fill required fields (name, role, department, salary)');
      return;
    }

    const data = {
      name,
      role,
      dept,
      status: fStatus.value || 'active',
      salary,
      basic:  Number(fBasic.value) || 0,
      phone:  fPhone.value.trim(),
      doj:    fDoj.value,
      uan:    fUan.value.trim(),
      esicNo: fEsic.value.trim(),
      notes:  fNotes.value.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingEmpId) {
        await empRef.doc(editingEmpId).update(data);
        toast('Employee updated');
      } else {
        data.createdAt = new Date().toISOString();
        await empRef.add(data);
        toast('Employee added');
      }
      closeEmpModal();
    } catch (err) {
      toast('Error saving: ' + err.message);
    }
  }

  async function deleteEmployee() {
    if (!editingEmpId) return;
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    try {
      await empRef.doc(editingEmpId).delete();
      toast('Employee deleted');
      closeEmpModal();
    } catch (err) {
      toast('Error: ' + err.message);
    }
  }

  /* ── Shift Board ── */
  function getWeekDates(offset) {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  function isoDate(d) {
    return d.toISOString().split('T')[0];
  }

  function renderShiftBoard() {
    const dates = getWeekDates(weekOffset);
    weekLabel.textContent = `${dates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${dates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    shiftGrid.innerHTML = '';
    dates.forEach((date, i) => {
      const key = isoDate(date);
      const dayShifts = shifts[key] || [];

      const col = document.createElement('div');
      col.className = 'shift-col';

      const header = document.createElement('div');
      header.className = 'shift-day-header';
      header.innerHTML = `<span class="shift-day-name">${DAYS[i]}</span><span class="shift-day-num">${date.getDate()}</span>`;
      col.appendChild(header);

      const slots = document.createElement('div');
      slots.className = 'shift-slots';

      dayShifts.forEach(shift => {
        const emp = employees.find(e => e.id === shift.empId);
        const slot = document.createElement('div');
        slot.className = 'shift-slot';
        slot.dataset.shiftId = shift.id;
        slot.dataset.date    = key;
        slot.innerHTML = `
          <div class="shift-emp-name">${esc(emp ? emp.name : 'Unknown')}</div>
          <div class="shift-time">${shift.start} – ${shift.end}</div>
          ${shift.note ? `<div class="shift-note">${esc(shift.note)}</div>` : ''}
        `;
        slot.addEventListener('click', () => removeShift(shift.id, key));
        slots.appendChild(slot);
      });

      const addBtn = document.createElement('div');
      addBtn.className = 'add-shift-slot';
      addBtn.textContent = '+ Add';
      addBtn.addEventListener('click', () => openAddShift(key));
      slots.appendChild(addBtn);

      col.appendChild(slots);
      shiftGrid.appendChild(col);
    });
  }

  function openAddShift(dateStr) {
    pendingShiftDate = dateStr;
    editingShiftId   = null;
    shiftModalTitle.textContent = `Add Shift — ${dateStr}`;

    sfEmp.innerHTML = '';
    employees.filter(e => e.status === 'active').forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = emp.name + ' (' + emp.role + ')';
      sfEmp.appendChild(opt);
    });
    if (!sfEmp.options.length) {
      toast('Add at least one active employee first');
      return;
    }
    sfStart.value = '09:00';
    sfEnd.value   = '17:00';
    sfNote.value  = '';
    shiftModal.classList.remove('hidden');
  }

  async function saveShift() {
    const empId = sfEmp.value;
    const start = sfStart.value;
    const end   = sfEnd.value;
    if (!empId || !start || !end) { toast('Fill all required fields'); return; }
    if (start >= end) { toast('End time must be after start time'); return; }

    const dateKey = pendingShiftDate;
    const data = { empId, start, end, note: sfNote.value.trim(), date: dateKey };

    try {
      await shiftRef.add(data);
      toast('Shift added');
      shiftModal.classList.add('hidden');
    } catch (err) {
      toast('Error: ' + err.message);
    }
  }

  async function removeShift(shiftId, dateKey) {
    if (!confirm('Remove this shift?')) return;
    try {
      await shiftRef.doc(shiftId).delete();
      toast('Shift removed');
    } catch (err) {
      toast('Error: ' + err.message);
    }
  }

  /* ── Firestore listeners ── */
  function startListeners() {
    empRef.onSnapshot(snap => {
      employees = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderEmployees();
      renderStats();
      renderLabour();
      renderShiftBoard();
    });

    shiftRef.onSnapshot(snap => {
      shifts = {};
      snap.docs.forEach(d => {
        const s = d.data();
        if (!shifts[s.date]) shifts[s.date] = [];
        shifts[s.date].push({ id: d.id, ...s });
      });
      renderShiftBoard();
    });
  }

  /* ── Auth guard ── */
  function init() {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      uid = user.uid;
      userNameEl.textContent = user.displayName || user.email;
      db       = firebase.firestore();
      empRef   = db.collection('users').doc(uid).collection('employees');
      shiftRef = db.collection('users').doc(uid).collection('shifts');
      startListeners();
    });

    logoutBtn.addEventListener('click', () => {
      firebase.auth().signOut().then(() => { window.location.href = 'index.html'; });
    });

    /* Employee modal wiring */
    addEmpBtn.addEventListener('click', openAddEmp);
    empModalClose.addEventListener('click', closeEmpModal);
    empCancelBtn.addEventListener('click', closeEmpModal);
    empSaveBtn.addEventListener('click', saveEmployee);
    deleteEmpBtn.addEventListener('click', deleteEmployee);
    empModal.addEventListener('click', e => { if (e.target === empModal) closeEmpModal(); });

    fSalary.addEventListener('input', updateCalcPreview);
    fBasic.addEventListener('input',  updateCalcPreview);

    /* Shift board wiring */
    shiftPrev.addEventListener('click', () => { weekOffset--; renderShiftBoard(); });
    shiftNext.addEventListener('click', () => { weekOffset++; renderShiftBoard(); });
    shiftModalClose.addEventListener('click', () => shiftModal.classList.add('hidden'));
    shiftCancelBtn.addEventListener('click',  () => shiftModal.classList.add('hidden'));
    shiftSaveBtn.addEventListener('click', saveShift);
    shiftModal.addEventListener('click', e => { if (e.target === shiftModal) shiftModal.classList.add('hidden'); });

    /* Search/filter */
    empSearch.addEventListener('input', renderEmployees);
    empDeptFilter.addEventListener('change', renderEmployees);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
