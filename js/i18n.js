(function() {
  var currentLang = localStorage.getItem('siteLang') || 'ar';

  function updateNavDirection(lang) {
    var navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.style.direction = lang === 'fr' ? 'ltr' : 'rtl';
    }
  }

  function applyLang(lang) {
    var isAr = lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'fr';
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

    // Update all elements with data-ar / data-fr
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

    // ── Update lang dropdown button ──
    // Main button label: shows CURRENT language name
    var label = document.getElementById('langLabel');
    if (label) label.textContent = isAr ? 'عربي' : 'Français';

    // Dropdown item: shows the OTHER language to switch to
    var dropdownLabel = document.getElementById('langDropdownLabel');
    if (dropdownLabel) dropdownLabel.textContent = isAr ? 'Français' : 'عربي';

    // Rotate chevron when dropdown is open
    updateChevronState();

    localStorage.setItem('siteLang', lang);
    currentLang = lang;
    updateNavDirection(lang);
  }

  function updateChevronState() {
    var menu    = document.getElementById('langDropdownMenu');
    var chevron = document.querySelector('.lang-chevron');
    var btn     = document.getElementById('langToggle');
    var isOpen  = menu && menu.style.display !== 'none';
    if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    if (btn)     btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  // ── Toggle dropdown open/close ──
  window.toggleLangDropdown = function() {
    var menu = document.getElementById('langDropdownMenu');
    if (!menu) {
      // Fallback: just toggle language directly
      applyLang(currentLang === 'ar' ? 'fr' : 'ar');
      return;
    }
    var isOpen = menu.style.display !== 'none';
    if (isOpen) {
      closeLangDropdown();
    } else {
      menu.style.display = 'block';
      updateChevronState();
    }
  };

  window.closeLangDropdown = function() {
    var menu = document.getElementById('langDropdownMenu');
    if (menu) menu.style.display = 'none';
    updateChevronState();
  };

  // ── Switch to the other language from dropdown ──
  window.switchLangFromDropdown = function() {
    applyLang(currentLang === 'ar' ? 'fr' : 'ar');
    closeLangDropdown();
  };

  // ── Legacy support: pages still calling toggleLanguage() directly ──
  window.toggleLanguage = function() {
    applyLang(currentLang === 'ar' ? 'fr' : 'ar');
  };

  // Expose for external use
  window.applyLanguage = applyLang;

  // ── Close dropdown when clicking outside ──
  document.addEventListener('click', function(e) {
    var wrap = document.getElementById('langDropdownWrap');
    if (wrap && !wrap.contains(e.target)) {
      closeLangDropdown();
    }
  });

  // ── Close dropdown on Escape ──
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLangDropdown();
  });

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { applyLang(currentLang); });
  } else {
    applyLang(currentLang);
  }
})();
