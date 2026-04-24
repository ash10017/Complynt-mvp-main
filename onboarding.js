/* onboarding.js — 4-step setup wizard */

(() => {
  /* ── License catalogue by business type ── */
  const ALL_LICENSES = [
    { id: 'fssai',     name: 'FSSAI Food License',         authority: 'FSSAI',                  category: 'Food Safety',     types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'bbmp',      name: 'BBMP Trade License',          authority: 'BBMP',                   category: 'Local Authority', types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'excise',    name: 'Karnataka Excise License',    authority: 'Karnataka Excise Dept',  category: 'Liquor',          types: ['restaurant','hotel','cafe'] },
    { id: 'firenoc',   name: 'Fire NOC',                    authority: 'Karnataka Fire Dept',    category: 'Fire',            types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'health_tl', name: 'Health Trade License',        authority: 'BBMP',                   category: 'Local Authority', types: ['restaurant','hotel','cafe','cloud_kitchen'] },
    { id: 'eating',    name: 'Eating House License',        authority: 'BBMP / Police',          category: 'Local Authority', types: ['restaurant','cafe'] },
    { id: 'gst',       name: 'GST Registration',            authority: 'GST Council',            category: 'Tax',             types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'shops',     name: 'Shops & Establishments Act',  authority: 'Dept of Labour',         category: 'Labour',          types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'esic',      name: 'ESIC Registration',           authority: 'ESIC',                   category: 'Labour',          types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'pf',        name: 'EPFO / PF Registration',      authority: 'EPFO',                   category: 'Labour',          types: ['restaurant','hotel','cafe','cloud_kitchen','retail','other'] },
    { id: 'lift',      name: 'Lift License',                authority: 'Dept of Factories',      category: 'Safety',          types: ['hotel'] },
    { id: 'pcb',       name: 'PCB Consent to Operate',      authority: 'Karnataka PCB',          category: 'Environment',     types: ['restaurant','hotel','cloud_kitchen','other'] },
  ];

  /* ── State ── */
  let step = 1;
  let bizType = null;
  let selectedLicenses = [];
  let expiryDates = {};
  let uid = null;
  let db  = null;

  /* ── DOM ── */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function toast(msg, ms = 2500) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
  }

  /* ── Progress dots ── */
  function updateProgress() {
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById('dot-' + i);
      if (!dot) continue;
      dot.className = 'ob-step-dot' + (i + 1 < step ? ' done' : i + 1 === step ? ' active' : '');
    }
  }

  /* ── Step visibility ── */
  function goTo(n) {
    document.querySelectorAll('.ob-step').forEach(el => el.classList.add('hidden'));
    document.getElementById('step-' + n).classList.remove('hidden');
    step = n;
    updateProgress();
  }

  /* ── Step 1: Business type ── */
  function initStep1() {
    document.querySelectorAll('.biz-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.biz-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bizType = card.dataset.type;
        document.getElementById('step1-next').disabled = false;
      });
    });
    document.getElementById('step1-next').addEventListener('click', () => {
      if (!bizType) return;
      buildLicenseList();
      goTo(2);
    });
  }

  /* ── Step 2: License checkboxes ── */
  function buildLicenseList() {
    const relevant = ALL_LICENSES.filter(l => l.types.includes(bizType));
    const list = document.getElementById('lic-list');
    list.innerHTML = '';
    relevant.forEach(lic => {
      const item = document.createElement('div');
      item.className = 'lic-item';
      item.dataset.id = lic.id;
      item.innerHTML = `
        <div class="lic-checkbox">
          <svg class="lic-check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20,6 9,17 4,12"/></svg>
        </div>
        <div class="lic-text">
          <div class="lic-name">${lic.name}</div>
          <div class="lic-authority">${lic.authority} &middot; ${lic.category}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
        const id = lic.id;
        if (item.classList.contains('checked')) {
          if (!selectedLicenses.find(l => l.id === id)) selectedLicenses.push(lic);
        } else {
          selectedLicenses = selectedLicenses.filter(l => l.id !== id);
        }
      });
      list.appendChild(item);
    });
  }

  function initStep2() {
    document.getElementById('step2-next').addEventListener('click', () => {
      buildExpiryList();
      goTo(3);
    });
    document.getElementById('step2-back').addEventListener('click', () => goTo(1));
  }

  /* ── Step 3: Expiry dates ── */
  function buildExpiryList() {
    const list = document.getElementById('expiry-list');
    list.innerHTML = '';
    const toShow = selectedLicenses.length > 0 ? selectedLicenses : [];
    if (!toShow.length) {
      list.innerHTML = '<p style="color:var(--muted);font-size:14px">No licenses selected — you can add them from the dashboard later.</p>';
      return;
    }
    toShow.forEach(lic => {
      const row = document.createElement('div');
      row.className = 'expiry-row';
      row.innerHTML = `
        <span class="expiry-name">${lic.name}</span>
        <input class="expiry-date-input" type="date" id="exp-${lic.id}" data-id="${lic.id}" />
      `;
      list.appendChild(row);
    });

    list.querySelectorAll('input[type="date"]').forEach(input => {
      input.addEventListener('change', () => {
        expiryDates[input.dataset.id] = input.value;
      });
    });
  }

  function initStep3() {
    document.getElementById('step3-next').addEventListener('click', () => {
      // Collect any dates not yet captured
      document.querySelectorAll('#expiry-list input[type="date"]').forEach(input => {
        if (input.value) expiryDates[input.dataset.id] = input.value;
      });
      goTo(4);
    });
    document.getElementById('step3-back').addEventListener('click', () => goTo(2));
  }

  /* ── Step 4: Alert preferences + save ── */
  function initStep4() {
    // Pre-fill email from Firebase Auth
    firebase.auth().onAuthStateChanged(user => {
      if (user && user.email) {
        document.getElementById('ob-email').value = user.email;
      }
    });

    document.getElementById('step4-back').addEventListener('click', () => goTo(3));
    document.getElementById('step4-save').addEventListener('click', saveAndFinish);
  }

  /* ── Generate compliance array for dashboard ── */
  function generateCompliances() {
    const today = new Date();

    return selectedLicenses.map((lic, i) => {
      let dueDate = expiryDates[lic.id] || '';
      // If no date given, set a placeholder 1 year from now
      if (!dueDate) {
        const d = new Date(today);
        d.setFullYear(d.getFullYear() + 1);
        dueDate = d.toISOString().split('T')[0];
      }

      const DOCS = {
        fssai:     ['Form B', 'ID Proof', 'Kitchen Layout', 'Food Category List', 'Fee Challan'],
        bbmp:      ['Application Form', 'Previous Trade License', 'Property Tax Receipt', 'Rental Agreement'],
        excise:    ['Old License', 'Rental Agreement', 'Tax Receipts', 'Police NOC'],
        firenoc:   ['Building Plan', 'Electrical Certificate', 'Site Inspection Report'],
        health_tl: ['Application', 'Kitchen Inspection Report', 'Water Test Certificate'],
        eating:    ['Application to BBMP/Police', 'Floor Plan', 'Indemnity Bond'],
        gst:       ['PAN Card', 'Aadhaar', 'Bank Statement', 'Rental Agreement'],
        shops:     ['Application Form', 'ID Proof', 'Address Proof'],
        esic:      ['Employee Register', 'Wage Register', 'Form 1'],
        pf:        ['Employee Details', 'Salary Register', 'Bank Details'],
        lift:      ['Lift Plan', 'Installation Certificate', 'AMC Contract'],
        pcb:       ['Application', 'Site Layout', 'ETP Design'],
      };

      return {
        id: i + 1,
        name: lic.name,
        authority: lic.authority,
        category: lic.category,
        frequency: 'Annual',
        description: `${lic.name} issued by ${lic.authority}.`,
        documents: DOCS[lic.id] || ['Application Form', 'ID Proof', 'Fee Receipt'],
        dueDate,
        status: new Date(dueDate) < today ? 'Overdue' : 'Pending',
        history: [],
      };
    });
  }

  async function saveAndFinish() {
    const email  = document.getElementById('ob-email').value.trim();
    const phone  = document.getElementById('ob-phone').value.trim();
    const method = document.getElementById('ob-alert-method').value;

    if (!email || !email.includes('@')) {
      toast('Please enter a valid email address');
      return;
    }

    const btn = document.getElementById('step4-save');
    btn.textContent = 'Saving…';
    btn.disabled = true;

    const compliances = generateCompliances();

    try {
      await db.collection('users').doc(uid).set({
        bizType,
        compliances,
        alertPrefs: { email, phone, method },
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      });
      window.location.href = 'dashboard.html';
    } catch (err) {
      toast('Error saving: ' + err.message);
      btn.textContent = 'Set Up Dashboard';
      btn.disabled = false;
    }
  }

  /* ── Auth guard ── */
  function init() {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      uid = user.uid;
      db  = firebase.firestore();

      // If already completed onboarding, skip straight to dashboard
      db.collection('users').doc(uid).get().then(doc => {
        if (doc.exists && doc.data().onboardingComplete) {
          window.location.href = 'dashboard.html';
        }
      });
    });

    initStep1();
    initStep2();
    initStep3();
    initStep4();
    updateProgress();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
