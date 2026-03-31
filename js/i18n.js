(function() {
  var currentLang = localStorage.getItem('siteLang') || 'ar';

  function updateNavDirection(lang) {
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    var items = Array.from(navLinks.querySelectorAll(':scope > li'));
    var n = items.length;

    if (lang === 'fr') {
      // LTR: page links go left→right (Accueil first)
      // Buttons (last 3 items: booking, auth, lang) get negative order to stay on the left
      navLinks.style.flexDirection = 'row';
      navLinks.style.direction = 'ltr';
      if (n >= 3) {
        items[n - 1].style.order = '-3'; // lang → far left
        items[n - 2].style.order = '-2'; // auth
        items[n - 3].style.order = '-1'; // booking
      }
    } else {
      // RTL: items flow right→left naturally (الرئيسية on far right)
      navLinks.style.flexDirection = 'row';
      navLinks.style.direction = 'rtl';
      items.forEach(function(li) { li.style.order = ''; });
    }
  }

  function applyLang(lang) {
    var isAr = lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'fr';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    // Update ALL elements with data-ar (and optionally data-fr)
    document.querySelectorAll('[data-ar]').forEach(function(el) {
      var text = isAr
        ? el.getAttribute('data-ar')
        : (el.getAttribute('data-fr') || el.getAttribute('data-ar'));
      if (!text) return;
      if (el.children.length > 0) {
        Array.from(el.childNodes).forEach(function(node) {
          if (node.nodeType === 3 && node.textContent.trim()) {
            node.textContent = text;
          }
        });
      } else {
        el.textContent = text;
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-placeholder-ar]').forEach(function(el) {
      var ph = isAr
        ? el.getAttribute('data-placeholder-ar')
        : (el.getAttribute('data-placeholder-fr') || el.getAttribute('data-placeholder-ar'));
      if (ph) el.placeholder = ph;
    });

    // Update lang toggle button
    var label = document.getElementById('langLabel');
    if (label) label.textContent = isAr ? 'FR' : 'عر';

    localStorage.setItem('siteLang', lang);
    currentLang = lang;

    // Update nav direction
    updateNavDirection(lang);
  }

  window.toggleLanguage = function() {
    applyLang(currentLang === 'ar' ? 'fr' : 'ar');
  };

  // Expose for external use
  window.applyLanguage = applyLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyLang(currentLang);
    });
  } else {
    applyLang(currentLang);
  }
})();
