/* app.js — interactions for the polished landing page (full) */

(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const typeEl = $('#typewriter');
  const revealEls = $$('.reveal');
  const hamburger = $('#hamburger');
  const navCenter = document.querySelector('.nav-center');
  const themeToggle = $('#theme-toggle');
  const ctaStart = $('#cta-start');
  const ctaDemo = $('#cta-demo');
  const loginBtn = $('#login-btn');
  const modal = $('#modal');
  const modalClose = $('#modal-close');
  const modalSubmit = $('#modal-submit');
  const toastEl = $('#toast');
  const metrics = $$('.metric');
  const radialText = document.querySelector('.radial-text');
  const radialFg = document.querySelector('.radial-fg');
  const healthScoreEl = $('#health-score');
  const healthAction = $('#health-action');
  const delayRange = $('#delay-range');
  const delayValue = $('#delay-value');
  const monthlyRevenue = $('#monthly-revenue');
  const simImpact = $('#sim-impact');
  const simulateBtn = $('#simulate-btn');
  const chatWindow = $('#chat-window');
  const chatInput = $('#chat-input');
  const chatSend = $('#chat-send');
  const chatTags = $$('.chat-controls .tag');
  const signupBtn = $('#signup-btn');
  const signupEmail = $('#signup-email');

  // carousel elements
  const carouselViewport = $('#carousel-viewport');
  const testTrack = $('#test-track');
  const btnPrev = $('#carousel-prev');
  const btnNext = $('#carousel-next');

  // Typewriter
  const headline = "Know your compliance status.\nBefore the inspector does.";
  const displayHeadline = headline.replace('\n', ' ');
  let idx = 0;
  function typewriter() {
    if (!typeEl) return;
    if (idx < displayHeadline.length) {
      typeEl.textContent += displayHeadline[idx++];
      setTimeout(typewriter, 36);
    } else {
      const cursor = document.querySelector('.cursor');
      if (cursor) cursor.classList.add('done');
    }
  }

  // Reveal on scroll
  function setupReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(el => obs.observe(el));
  }

  // Hamburger
  function setupHamburger() {
    if (!hamburger) return;
    hamburger.addEventListener('click', () => {
      navCenter.classList.toggle('open');
      navCenter.style.display = navCenter.classList.contains('open') ? 'flex' : '';
    });
  }

  // Toast
  let toastTimer = null;
  function showToast(msg, ms=2500) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.add('hidden'), ms);
  }

  // Metrics
  function animateMetrics() {
    metrics.forEach(el => {
      const target = Number(el.dataset.target) || 0;
      let cur = 0;
      const step = Math.max(1, Math.round(target / 60));
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) {
          el.textContent = target + (el.dataset.suffix || '');
          clearInterval(t);
        } else {
          el.textContent = cur;
        }
      }, 16);
    });
  }

  // Health score
  function setHealth(score=72) {
    const max = 100;
    const pct = Math.max(0, Math.min(100, score));
    const circleLength = 2 * Math.PI * 50;
    const offset = Math.round(circleLength * (1 - pct / max));
    if (radialFg) radialFg.style.strokeDashoffset = offset;
    if (radialText) radialText.textContent = pct + '%';
    if (healthScoreEl) healthScoreEl.textContent = pct;
    if (healthAction) {
      if (pct > 85) healthAction.textContent = 'All licenses in good standing. Schedule next renewals.';
      else if (pct > 60) healthAction.textContent = 'Upload missing documents. Check BBMP Trade License status.';
      else healthAction.textContent = 'Urgent: licenses at risk of lapse. File renewals immediately.';
    }
  }

  // Simulator
  function runSimulation(delayDays, monthlyRev) {
    const lossFactor = 0.002;
    const impact = Math.round(monthlyRev * Math.min(1, lossFactor * delayDays));
    return impact;
  }
  function setupSimulator() {
    if (!delayRange || !monthlyRevenue || !simImpact || !simulateBtn || !delayValue) return;
    delayRange.addEventListener('input', () => {
      delayValue.textContent = delayRange.value;
    });
    simulateBtn.addEventListener('click', () => {
      const days = Number(delayRange.value);
      const rev = Number(monthlyRevenue.value || 0);
      const impact = runSimulation(days, rev);
      simImpact.textContent = `₹${impact.toLocaleString()}`;
      showToast('Simulation complete (demo estimate)');
    });
  }

  // Chat
  const canned = {
    "what do i need to renew in june": "For a typical Bangalore restaurant: your FSSAI license renewal should be filed 30 days before expiry — check if yours falls in June. BBMP Trade License is annual; if you registered in June you'll need to renew this month. Karnataka Excise applications take 45–60 days to process, so apply early. Connect your account for your exact deadlines.",
    "how risky is my liquor license": "Karnataka Excise licenses are among the highest-risk compliance areas. Inspections peak before elections and during festival seasons. Even a 1-day lapse can trigger a fine of ₹50,000 and a 7-day suspension. We recommend filing for renewal at least 60 days before expiry — the Excise Department queue in Bangalore is notoriously slow.",
    "what documents do i need for fssai renewal": "For FSSAI renewal in Karnataka: (1) Filled Form B, (2) Current license copy, (3) ID & address proof of proprietor, (4) Kitchen layout plan, (5) List of food products handled, (6) Fee challan. If you've had any menu changes, updated product categories need to be declared. Processing time is typically 30–45 days.",
    "show my compliance health": "To see your live compliance health score, connect your business to Complynt. We'll pull your license dates, check document completeness, and flag any risks. Your score reflects renewals due, missing documents, and inspection risk factors — updated in real time.",
    "default": "I can help with any Indian compliance question — FSSAI, BBMP, Karnataka Excise, Labour law, GST, Fire NOC, and more. For personalised answers tied to your specific deadlines and licenses, connect your business account."
  };
  function aiReply(query) {
    const k = query.trim().toLowerCase();
    return canned[k] || canned['default'];
  }
  function setupChat() {
    if (!chatWindow) return;
    function appendMsg(text, who='ai') {
      const wrap = document.createElement('div');
      wrap.className = 'chat-message ' + (who === 'user' ? 'user' : 'ai');
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
    chatTags.forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.query;
        appendMsg(q, 'user');
        setTimeout(()=> {
          appendMsg('...', 'ai');
          setTimeout(()=> { chatWindow.lastChild.textContent = aiReply(q); }, 700);
        }, 300);
      });
    });
    chatSend.addEventListener('click', () => {
      const q = chatInput.value.trim();
      if (!q) return;
      appendMsg(q, 'user');
      chatInput.value = '';
      setTimeout(()=> {
        appendMsg('...', 'ai');
        setTimeout(()=> { chatWindow.lastChild.textContent = aiReply(q); }, 700);
      }, 300);
    });
  }

  /* ===============================
     Testimonials carousel (infinite)
     =============================== */
     function setupTestimonialsCarousel() {
      if (!testTrack || !carouselViewport) return;
    
      const originals = Array.from(testTrack.children).map(n => n.cloneNode(true));
    
      let perView = 3;
      let index = 0;
      let itemWidth = 320;
      let gap = parseFloat(getComputedStyle(testTrack).gap) || 16;
      let autoplay = null;
    
      function computePerView() {
        const w = window.innerWidth;
        if (w < 760) return 1; // always 1 on phone
        if (w < 1100) return 2;
        return 3;
      }
    
      function build() {
        perView = computePerView();
        gap = parseFloat(getComputedStyle(testTrack).gap) || 16;
        testTrack.innerHTML = '';
        const frag = document.createDocumentFragment();
        originals.forEach(node => frag.appendChild(node.cloneNode(true)));
        testTrack.appendChild(frag);
    
        const items = Array.from(testTrack.children);
        const viewportWidth = carouselViewport.clientWidth || Math.floor(window.innerWidth * 0.9);
        itemWidth = Math.floor((viewportWidth - gap * (perView - 1)) / perView);
    
        items.forEach(it => {
          it.style.flex = `0 0 ${itemWidth}px`;
        });
    
        index = 0;
        testTrack.style.transform = `translateX(0)`;
      }
    
      function next() {
        const items = Array.from(testTrack.children);
        if (!items.length) return;
        index = (index + 1) % items.length;
        const offset = index * (itemWidth + gap);
        testTrack.style.transform = `translateX(-${offset}px)`;
      }
    
      function prev() {
        const items = Array.from(testTrack.children);
        if (!items.length) return;
        index = (index - 1 + items.length) % items.length;
        const offset = index * (itemWidth + gap);
        testTrack.style.transform = `translateX(-${offset}px)`;
      }
    
      function startAutoplay() {
        stopAutoplay();
        autoplay = setInterval(next, 4000);
      }
      function stopAutoplay() {
        if (autoplay) { clearInterval(autoplay); autoplay = null; }
      }
    
      if (btnNext) btnNext.addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });
      if (btnPrev) btnPrev.addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });
    
      carouselViewport.addEventListener('mouseenter', stopAutoplay);
      carouselViewport.addEventListener('mouseleave', startAutoplay);
    
      window.addEventListener('resize', build);
    
      build();
      startAutoplay();
    }
    
  // Signup
  function setupSignup() {
    if (!signupBtn) return;
    signupBtn.addEventListener('click', () => {
      const email = signupEmail.value.trim();
      if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
      localStorage.setItem('complynt_signup', email);
      showToast('Thanks — we will reach out shortly');
      signupEmail.value = '';
    });
  }

  // Modal
  function setupModal() {
    const coverageContact = $('#coverage-contact');
    const openers = [loginBtn, ctaStart, ctaDemo, coverageContact, $('#theme-toggle')];
    openers.forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    });
    modalClose && modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    modalSubmit && modalSubmit.addEventListener('click', () => {
      const email = $('#demo-email').value.trim();
      if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
      const d = { email, name: $('#demo-name').value.trim(), industry: $('#demo-industry').value || 'Unspecified', at: new Date().toISOString() };
      const arr = JSON.parse(localStorage.getItem('complynt_requests') || '[]');
      arr.push(d);
      localStorage.setItem('complynt_requests', JSON.stringify(arr));
      showToast('Request received — thank you!');
      modal.classList.add('hidden');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // Theme toggle
  function setupTheme() {
    const saved = localStorage.getItem('complynt_theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    themeToggle && themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('complynt_theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dark mode' : 'Light mode', 900);
    });
  }

  // Navbar scroll effect
  function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('.navbar');
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // Init
  function init() {
    typewriter();
    setupReveal();
    setupHamburger();
    setupTheme();
    setupModal();
    animateMetrics();
    setTimeout(()=> { setHealth(72); }, 600);
    setupSimulator();
    setupChat();
    setupTestimonialsCarousel();
    setupSignup();
    setupNavbarScroll();

  }

  document.addEventListener('DOMContentLoaded', init);
})();
