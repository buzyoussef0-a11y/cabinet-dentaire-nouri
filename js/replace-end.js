const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newLangScript = `  <script>
// ═══════════════════════════════════
// FULL PAGE TRANSLATION ENGINE
// ═══════════════════════════════════
(function() {
  var currentLang = localStorage.getItem('siteLang') || 'ar';

  function applyLang(lang) {
    var isAr = lang === 'ar';
    var isRtl = isAr;

    // 1. Set document direction and language
    document.documentElement.lang = isAr ? 'ar' : 'fr';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    // 2. Update all data-ar / data-fr elements
    document.querySelectorAll('[data-ar][data-fr]')
      .forEach(function(el) {
        var text = isAr
          ? el.getAttribute('data-ar')
          : el.getAttribute('data-fr');
        if (text) {
          // If element has children (like buttons with SVG),
          // only update the text node, not innerHTML
          var hasImportantChildren = el.querySelector(
            'svg, img, button, a, input'
          );
          if (hasImportantChildren) {
            // Find and update only text nodes
            Array.from(el.childNodes).forEach(function(node) {
              if (node.nodeType === 3 &&
                  node.textContent.trim()) {
                node.textContent = ' ' + text + ' ';
              }
            });
          } else {
            el.innerHTML = text;
          }
        }
      });

    // 3. Update page title
    document.title = isAr
      ? 'Cabinet Dentaire Zouhri | ابتسامتك أولويتنا'
      : 'Cabinet Dentaire Zouhri | Votre sourire, notre priorité';

    // 4. Update lang button label
    var label = document.getElementById('langLabel');
    if (label) label.textContent = isAr ? 'FR' : 'عر';

    // 5. Update all placeholders in inputs
    document.querySelectorAll('[data-placeholder-ar]')
      .forEach(function(inp) {
        inp.placeholder = isAr
          ? inp.getAttribute('data-placeholder-ar')
          : inp.getAttribute('data-placeholder-fr');
      });

    // 6. Save preference
    localStorage.setItem('siteLang', lang);
    currentLang = lang;
  }

  // Expose toggle function
  window.toggleLanguage = function() {
    applyLang(currentLang === 'ar' ? 'fr' : 'ar');
  };

  // Apply on page load
  document.addEventListener('DOMContentLoaded', function() {
    if (currentLang === 'fr') applyLang('fr');
  });

  // Also apply immediately if DOM ready
  if (document.readyState !== 'loading') {
    if (currentLang === 'fr') applyLang('fr');
  }
})();
  </script>`;

// Replace old language script (from var translations to its closing script tag)
const langStartIdx = html.indexOf('<script>\n      var translations = {');
if (langStartIdx !== -1) {
    const langEndIdx = html.indexOf('})();\n  </script>', langStartIdx);
    if (langEndIdx !== -1) {
        html = html.substring(0, langStartIdx) + newLangScript + html.substring(langEndIdx + 17);
    }
}

// Remove old bcm declarations
// Replace existing bookingChoiceModal HTML snippet with correct modal
// Wait, the previously inserted bcm code starts at <div id="bookingChoiceModal"
const bcmStartIdx = html.indexOf('<div id="bookingChoiceModal"');
if (bcmStartIdx !== -1) {
    const nextBodyTag = html.indexOf('</body>', bcmStartIdx);
    if (nextBodyTag !== -1) {
        html = html.substring(0, bcmStartIdx) + `
<div id="bookingChoiceModal" class="bcm-overlay" style="display:none;" aria-modal="true" role="dialog">
  <div class="bcm-card">

    <button class="bcm-close" onclick="closeBookingChoiceModal()" aria-label="إغلاق">
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <div class="bcm-logo">
      <div class="bcm-logo-ring"></div>
      <svg viewBox="0 0 36 36" fill="none" width="32" height="32">
        <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" fill="url(#bcmHex)" opacity="0.2"/>
        <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke="url(#bcmHex)" stroke-width="1" fill="none"/>
        <rect x="16" y="9" width="4" height="18" rx="2" fill="url(#bcmCross)"/>
        <rect x="9" y="16" width="18" height="4" rx="2" fill="url(#bcmCross)"/>
        <circle cx="18" cy="18" r="2.5" fill="white" opacity="0.9"/>
        <defs>
          <linearGradient id="bcmHex" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#0df2f2"/>
            <stop offset="100%" stop-color="#0D9488"/>
          </linearGradient>
          <linearGradient id="bcmCross" x1="9" y1="9" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#0df2f2"/>
            <stop offset="100%" stop-color="white"/>
          </linearGradient>
        </defs>
      </svg>
    </div>

    <h2 class="bcm-title">احجز موعدك</h2>
    <p class="bcm-subtitle" data-ar="اختر طريقة الحجز التي تناسبك" data-fr="Choisissez votre méthode de réservation">اختر طريقة الحجز التي تناسبك</p>

    <div class="bcm-options">

      <a href="register.html" class="bcm-opt bcm-opt-primary">
        <div class="bcm-opt-icon">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="bcm-opt-body">
          <strong data-ar="إنشاء حساب مجاني" data-fr="Créer un compte gratuit">إنشاء حساب مجاني</strong>
          <small data-ar="تتبع مواعيدك وسجلك الطبي بسهولة" data-fr="Suivez vos RDV et votre dossier médical">تتبع مواعيدك وسجلك الطبي بسهولة</small>
        </div>
        <span class="bcm-opt-badge" data-ar="مُوصى به ✓" data-fr="Recommandé ✓">مُوصى به ✓</span>
      </a>

      <div class="bcm-sep"><span data-ar="أو المتابعة بدون حساب" data-fr="Ou continuer sans compte">أو المتابعة بدون حساب</span></div>

      <button class="bcm-opt bcm-opt-ghost" onclick="bookAsGuest()">
        <div class="bcm-opt-icon">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14 a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="bcm-opt-body">
          <strong data-ar="حجز كزيارة" data-fr="Rendez-vous simple">حجز كزيارة</strong>
          <small data-ar="بدون تسجيل — سريع وبسيط" data-fr="Sans inscription — Rapide et simple">بدون تسجيل — سريع وبسيط</small>
        </div>
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16" class="bcm-arrow">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

    </div>

    <p class="bcm-login-line">
      <span data-ar="لديك حساب؟" data-fr="Vous avez un compte?">لديك حساب؟</span>
      <a href="login.html" class="bcm-login-a" data-ar="تسجيل الدخول" data-fr="Se connecter">تسجيل الدخول</a>
    </p>

  </div>
</div>

<script>
document.getElementById('bookingChoiceModal')
  .addEventListener('click', function(e) {
    if (e.target === this) closeBookingChoiceModal();
  });
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeBookingChoiceModal();
});
</script>
` + html.substring(nextBodyTag);
    }
}

fs.writeFileSync('index.html', html);
console.log('Scripts replaced reliably.');
