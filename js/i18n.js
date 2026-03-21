(function() {
  var currentLang = localStorage.getItem('siteLang') || 'ar';

  function applyLang(lang) {
    var isAr = lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'fr';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-ar][data-fr]').forEach(function(el) {
      var text = isAr
        ? el.getAttribute('data-ar')
        : el.getAttribute('data-fr');
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

    var label = document.getElementById('langLabel');
    if (label) label.textContent = isAr ? 'FR' : 'عر';

    localStorage.setItem('siteLang', lang);
    currentLang = lang;
  }

  window.toggleLanguage = function() {
    applyLang(currentLang === 'ar' ? 'fr' : 'ar');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (currentLang === 'fr') applyLang('fr');
    });
  } else {
    if (currentLang === 'fr') applyLang('fr');
  }
})();
