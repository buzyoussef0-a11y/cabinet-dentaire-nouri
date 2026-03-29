/* ══════════════════════════════════════════════════════
   ANIMATIONS.JS — Premium scroll animations for all pages
   Uses data-anim attribute + IntersectionObserver
══════════════════════════════════════════════════════ */
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      el.classList.add('a-in');
    });
    return;
  }

  /* ── Core observer ── */
  var triggered = new Set();
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || triggered.has(entry.target)) return;
      triggered.add(entry.target);
      entry.target.classList.add('a-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  /* ── Helper: mark element with animation data ── */
  function mark(el, type, delay) {
    if (!el) return;
    el.setAttribute('data-anim', type);
    if (delay) el.style.animationDelay = delay + 's';
    observer.observe(el);
  }

  /* ── Helper: mark all matching elements with stagger ── */
  function markAll(selector, type, baseDelay, stagger, root) {
    (root || document).querySelectorAll(selector).forEach(function (el, i) {
      mark(el, type, (baseDelay || 0) + i * (stagger || 0));
    });
  }

  /* ── Add decorative underline after headings ── */
  function addLine(selector) {
    document.querySelectorAll(selector).forEach(function (h) {
      if (h.querySelector('.section-deco-line')) return;
      var line = document.createElement('span');
      line.className = 'section-deco-line';
      h.appendChild(line);
      setTimeout(function () { observer.observe(line); }, 100);
    });
  }

  /* ══════════════════════════════════════════
     PAGE DETECTION & SPECIFIC ANIMATIONS
  ══════════════════════════════════════════ */
  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';

  /* ── Universal: page hero banner ── */
  markAll('.page-hero-banner h1, .page-hero-banner .breadcrumb-title', 'up', 0);
  markAll('.page-hero-banner p, .page-hero-banner .page-hero-sub', 'up', 0.12);
  markAll('.page-hero-stats .ph-stat', 'num', 0.15, 0.1);
  markAll('.page-cta-section h2', 'up', 0);
  markAll('.page-cta-section p', 'up', 0.1);
  markAll('.page-cta-btns', 'up', 0.22);

  /* ════════════════════════
     SERVICES PAGE
  ════════════════════════ */
  if (page === 'services.html') {
    addLine('.section-title-new');

    markAll('.section-title-new', 'up', 0);
    markAll('.section-desc-new', 'up', 0.1);
    markAll('.svc-page-card', 'flip', 0.05, 0.08);

    /* 3D tilt on service cards */
    if (window.innerWidth >= 768) {
      document.querySelectorAll('.svc-page-card').forEach(function (card) {
        card.style.transition = 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease';
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
          var y = ((e.clientY - r.top)  / r.height - 0.5) * -16;
          card.style.transform = 'perspective(700px) rotateX('+y+'deg) rotateY('+x+'deg) translateY(-6px) scale(1.02)';
          card.style.boxShadow = '0 20px 60px rgba(13,242,242,0.18)';
        });
        card.addEventListener('mouseleave', function () {
          card.style.transform = '';
          card.style.boxShadow = '';
        });
      });
    }
  }

  /* ════════════════════════
     GALLERY PAGE
  ════════════════════════ */
  if (page === 'gallery.html') {
    markAll('.gallery-filters', 'down', 0.05);
    markAll('.filter-btn', 'scale', 0.15, 0.06);

    /* Gallery items with masonry stagger */
    var galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(function (el, i) {
      var col = i % 3;
      mark(el, 'scale', 0.05 + col * 0.08 + Math.floor(i / 3) * 0.04);
    });
  }

  /* ════════════════════════
     ABOUT PAGE
  ════════════════════════ */
  if (page === 'about.html') {
    addLine('.about-section-title, .section-title-new');

    /* Doctor profile */
    mark(document.querySelector('.about-dr-img-wrap'), 'glow', 0.05);
    mark(document.querySelector('.about-dr-badge'), 'down', 0.4);
    markAll('.about-dr-content .about-dr-label', 'right', 0.1);
    markAll('.about-dr-content h2, .about-dr-content .about-dr-name', 'right', 0.18);
    markAll('.about-dr-content blockquote, .about-dr-content .about-dr-quote', 'right', 0.28);
    markAll('.about-dr-chip', 'scale', 0.35, 0.07);

    /* Timeline — alternating sides */
    document.querySelectorAll('.timeline-item').forEach(function (item, i) {
      var card = item.querySelector('.tl-card');
      var dot  = item.querySelector('.tl-dot');
      if (card) mark(card, i % 2 === 0 ? 'left' : 'right', 0.05 + i * 0.1);
      if (dot)  mark(dot,  'scale', 0.1 + i * 0.1);
    });

    /* Values cards */
    markAll('.about-value-card', 'flip', 0.05, 0.12);

    /* Team cards */
    markAll('.about-team-card', 'up', 0.05, 0.12);

    /* Certifications */
    markAll('[class*="cert"], .about-cert', 'scale', 0.1, 0.1);

    /* Section headings */
    markAll('.about-section-title, .section-title-new', 'up', 0);
    markAll('.about-section-sub, .section-desc-new', 'up', 0.1);
  }

  /* ════════════════════════
     FAQ PAGE
  ════════════════════════ */
  if (page === 'faq.html') {
    mark(document.querySelector('.glass-card'), 'up', 0.1);
    mark(document.querySelector('.faq-assistant-card'), 'scale', 0.15);

    /* FAQ items are dynamically generated — use MutationObserver */
    var faqList = document.getElementById('faq-list');
    if (faqList) {
      var faqObserver = new MutationObserver(function () {
        faqObserver.disconnect();
        faqList.querySelectorAll('.faq-item').forEach(function (item, i) {
          mark(item, 'flip', 0.05 + i * 0.06);
        });
      });
      faqObserver.observe(faqList, { childList: true });
    }
  }

  /* ════════════════════════
     SPOTLIGHT on all cards
  ════════════════════════ */
  var spotlightTargets = document.querySelectorAll(
    '.svc-page-card, .about-value-card, .about-team-card, .tl-card, .glass-card'
  );
  spotlightTargets.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      card.style.background =
        'radial-gradient(240px circle at ' + x + 'px ' + y + 'px,' +
        'rgba(13,242,242,0.08),rgba(13,242,242,0.03) 55%,transparent)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.background = '';
    });
  });

  /* ════════════════════════
     GALLERY ITEM hover glow
  ════════════════════════ */
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.style.transition = 'transform 0.35s ease, box-shadow 0.35s ease';
    item.addEventListener('mouseenter', function () {
      item.style.transform = 'scale(1.03)';
      item.style.boxShadow = '0 16px 48px rgba(13,242,242,0.25)';
      item.style.zIndex = '2';
    });
    item.addEventListener('mouseleave', function () {
      item.style.transform = '';
      item.style.boxShadow = '';
      item.style.zIndex = '';
    });
  });

})();
