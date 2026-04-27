/* app.js — Complynt marketing site interactions */

(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ── Nav: frosted glass on scroll ── */
  function setupNavScroll() {
    const nav = $('#nav');
    if (!nav || nav.classList.contains('solid')) return;
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Hamburger → drawer ── */
  function setupHamburger() {
    const btn    = $('#hamburger');
    const drawer = $('#nav-drawer');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      drawer.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Scroll reveal ── */
  function setupReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('show'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
  }

  /* ── Toast ── */
  let toastTimer;
  function showToast(msg, ms = 2600) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), ms);
  }

  /* ── Modal ── */
  function setupModal() {
    const modal       = $('#modal');
    const modalClose  = $('#modal-close');
    const modalSubmit = $('#modal-submit');
    if (!modal) return;

    const openers = $$('[data-modal],[id="coverage-contact"],[id="cta-contact-sales"],[id="pricing-cta-scale"]');
    openers.forEach(el => el && el.addEventListener('click', () => modal.classList.remove('hidden')));

    modalClose && modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    modalSubmit && modalSubmit.addEventListener('click', () => {
      const email = $('#demo-email') ? $('#demo-email').value.trim() : '';
      if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
      const d = {
        email,
        name:     ($('#demo-name')     || {}).value || '',
        industry: ($('#demo-industry') || {}).value || 'Unspecified',
        at: new Date().toISOString()
      };
      const arr = JSON.parse(localStorage.getItem('complynt_requests') || '[]');
      arr.push(d);
      localStorage.setItem('complynt_requests', JSON.stringify(arr));
      showToast('Request received — we will reach out shortly!');
      modal.classList.add('hidden');
    });
  }

  /* ── Signup (CTA email form) ── */
  function setupSignup() {
    const btn   = $('#signup-btn');
    const email = $('#signup-email');
    if (!btn || !email) return;
    btn.addEventListener('click', () => {
      const val = email.value.trim();
      if (!val || !val.includes('@')) { showToast('Please enter a valid email'); return; }
      localStorage.setItem('complynt_signup', val);
      showToast('Thanks — we will reach out shortly!');
      email.value = '';
    });
  }

  /* ── Newsletter ── */
  function setupNewsletter() {
    const btn = $('#news-btn');
    const inp = $('#news-email');
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
      const val = inp.value.trim();
      if (!val || !val.includes('@')) { showToast('Please enter a valid email'); return; }
      showToast('Subscribed — thank you!');
      inp.value = '';
    });
  }

  /* ── FAQ accordion ── */
  function setupFAQ() {
    $$('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-q');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        $$('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── AI Chat ── */
  const canned = {
    "what do i need to renew in june": "For a typical Bangalore restaurant: check your FSSAI license — file renewal 30 days before expiry. BBMP Trade License is annual; if you registered in June, renew this month. Karnataka Excise applications take 45–60 days to process, so apply early. Connect your account for your exact deadlines.",
    "how risky is my liquor license": "Karnataka Excise licenses are among the highest-risk compliance areas. Even a 1-day lapse can trigger a ₹50,000 fine and a 7-day suspension. File renewal at least 60 days before expiry — the Excise Department queue in Bangalore is notoriously slow.",
    "what documents do i need for fssai renewal": "For FSSAI renewal in Karnataka: (1) Form B, (2) Current license copy, (3) ID & address proof of proprietor, (4) Kitchen layout plan, (5) Food products list, (6) Fee challan. Processing time: 30–45 days.",
    "default": "I can help with FSSAI, BBMP, Karnataka Excise, Labour law, GST, Fire NOC, and more. For personalised answers tied to your specific deadlines, connect your business account."
  };
  function setupChat() {
    const chatWindow = $('#chat-window');
    const chatInput  = $('#chat-input');
    const chatSend   = $('#chat-send');
    const tags       = $$('.chat-controls .tag');
    if (!chatWindow) return;

    function appendMsg(text, who = 'ai') {
      const wrap   = document.createElement('div');
      wrap.className = 'chat-message ' + who;
      const avatar = document.createElement('div');
      avatar.className = 'chat-avatar';
      avatar.textContent = who === 'user' ? 'Me' : 'AI';
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.textContent = text;
      wrap.appendChild(avatar);
      wrap.appendChild(bubble);
      chatWindow.appendChild(wrap);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function send(q) {
      if (!q) return;
      appendMsg(q, 'user');
      setTimeout(() => {
        appendMsg('…', 'ai');
        const lastBubble = chatWindow.lastChild.querySelector('.chat-bubble');
        setTimeout(() => {
          if (lastBubble) lastBubble.textContent = canned[q.trim().toLowerCase()] || canned['default'];
        }, 700);
      }, 300);
    }

    tags.forEach(btn => btn.addEventListener('click', () => send(btn.dataset.query)));
    chatSend && chatSend.addEventListener('click', () => {
      const q = chatInput.value.trim();
      chatInput.value = '';
      send(q);
    });
    chatInput && chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); const q = chatInput.value.trim(); chatInput.value = ''; send(q); }
    });
  }

  /* ── Health score radial ── */
  function setupHealth() {
    const radialFg     = $('.radial-fg');
    const radialText   = $('.radial-text');
    const healthScore  = $('#health-score');
    const healthAction = $('#health-action');
    if (!radialFg) return;

    function setScore(score) {
      const pct    = Math.max(0, Math.min(100, score));
      const offset = Math.round(314 * (1 - pct / 100));
      radialFg.style.strokeDashoffset = offset;
      if (radialText)   radialText.textContent  = pct + '%';
      if (healthScore)  healthScore.textContent  = pct;
      if (healthAction) {
        if (pct > 85)      healthAction.textContent = 'All licenses in good standing. Schedule next renewals.';
        else if (pct > 60) healthAction.textContent = 'Upload missing documents. Check BBMP Trade License status.';
        else               healthAction.textContent = 'Urgent: licenses at risk of lapse. File renewals immediately.';
      }
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => setScore(72), 300); obs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    obs.observe(radialFg.closest('section') || radialFg);
  }

  /* ── Fine Risk Simulator ── */
  function setupSimulator() {
    const delayRange    = $('#delay-range');
    const delayValue    = $('#delay-value');
    const monthlyRev    = $('#monthly-revenue');
    const simImpact     = $('#sim-impact');
    const simulateBtn   = $('#simulate-btn');
    if (!delayRange) return;

    delayRange.addEventListener('input', () => { delayValue.textContent = delayRange.value; });

    function calculate() {
      const days   = Number(delayRange.value);
      const rev    = Number((monthlyRev || {}).value || 0);
      const impact = Math.round(rev * Math.min(1, 0.002 * days));
      if (simImpact) simImpact.textContent = '₹' + impact.toLocaleString('en-IN');
      showToast('Simulation complete (demo estimate)');
    }
    simulateBtn && simulateBtn.addEventListener('click', calculate);
  }

  /* ── Init ── */
  function init() {
    setupNavScroll();
    setupHamburger();
    setupReveal();
    setupModal();
    setupSignup();
    setupNewsletter();
    setupFAQ();
    setupChat();
    setupHealth();
    setupSimulator();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
