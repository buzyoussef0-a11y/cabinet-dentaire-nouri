/* ═══════════════════════════════════════
   MAIN.JS — Complete JavaScript
═══════════════════════════════════════ */

// ── Ensure floating widgets are direct children of body (fixes position:fixed)
(function moveWidgetsToBody() {
    function doMove() {
        ['chatWidget', 'whatsappBtn', 'backToTop', 'toastContainer'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentElement !== document.body) {
                document.body.appendChild(el);
            }
        });
    }
    // Run immediately if DOM is ready, else wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', doMove);
    } else {
        doMove();
    }
})();



// ── Populate nav user info
async function populateNavUser() {
    var user = (typeof getCurrentUser === 'function') ? await getCurrentUser() : null;
    var stored = localStorage.getItem('dental_current_user');
    var localUser = stored ? JSON.parse(stored) : null;

    if (!user && !localUser) return;

    // Fetch display name from profiles table first, fallback to user_metadata
    var displayName = (user?.user_metadata?.full_name || localUser?.fullName || user?.email || 'مستخدم').split(' ')[0];
    if (user && typeof supabase !== 'undefined') {
        try {
            var profileRes = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            if (!profileRes.error && profileRes.data?.full_name) {
                displayName = profileRes.data.full_name.split(' ')[0];
            }
        } catch(e) {}
    }
    var initial = displayName.charAt(0).toUpperCase();
    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';
    var profileHref = (window._ROOT || '') + 'pages/profile.html';

    var dropdownHTML = [
        '<div class="user-dropdown-wrapper" style="position:relative;">',
        '<button class="user-dropdown-btn" onclick="toggleUserDropdown()" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(13,242,242,0.3);border-radius:50px;padding:6px 14px 6px 6px;cursor:pointer;color:white;font-family:Cairo,sans-serif;font-size:0.9rem;">',
        '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0df2f2,#0D9488);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:#0a1628;">' + initial + '</div>',
        '<span>' + (isAr ? 'مرحباً ' : 'Bonjour ') + displayName + '</span>',
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="opacity:0.6"><path d="M6 9l6 6 6-6" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
        '</button>',
        '<div id="userDropdownMenu" style="display:none;position:absolute;top:calc(100% + 8px);left:0;background:#0F1E35;border:1px solid rgba(13,242,242,0.2);border-radius:12px;padding:8px;min-width:180px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.4);">',
        '<a href="' + profileHref + '" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:white;text-decoration:none;font-family:Cairo,sans-serif;font-size:0.9rem;" onmouseover="this.style.background=\'rgba(13,242,242,0.1)\'" onmouseout="this.style.background=\'transparent\'">',
        '👤 <span>' + (isAr ? 'ملفي الشخصي' : 'Mon profil') + '</span>',
        '</a>',
        '<div style="height:1px;background:rgba(255,255,255,0.08);margin:4px 0;"></div>',
        '<button onclick="logoutUser()" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:#EF4444;background:transparent;border:none;width:100%;font-family:Cairo,sans-serif;font-size:0.9rem;cursor:pointer;text-align:right;" onmouseover="this.style.background=\'rgba(239,68,68,0.1)\'" onmouseout="this.style.background=\'transparent\'">',
        '🚪 <span>' + (isAr ? 'تسجيل الخروج' : 'Se déconnecter') + '</span>',
        '</button>',
        '</div>',
        '</div>'
    ].join('');

    var authLinks = document.getElementById('auth-links');
    if (authLinks) {
        authLinks.innerHTML = dropdownHTML;
        return;
    }

    // Fallback for pages without auth-links slot
    var navActions = document.querySelector('.nav-actions');
    if (navActions) {
        var existing = navActions.querySelector('.nav-user-info');
        if (!existing) {
            var div = document.createElement('div');
            div.className = 'nav-user-info';
            div.innerHTML = dropdownHTML;
            navActions.insertBefore(div, navActions.firstElementChild);
        }
    }
}

function toggleUserDropdown() {
    var menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.user-dropdown-wrapper')) {
        var menu = document.getElementById('userDropdownMenu');
        if (menu) menu.style.display = 'none';
    }
});

// ── goToBooking (all pages)
async function goToBooking() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            window.location.href = (window._ROOT || '') + 'booking.html';
        } else {
            showBookingModal();
        }
    } catch (e) {
        showBookingModal();
    }
}

function showBookingModal() {
    var modal = document.getElementById('bookingChoiceModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        window.location.href = (window._ROOT || '') + 'booking.html';
    }
}

function closeBookingChoiceModal() {
    var modal = document.getElementById('bookingChoiceModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function bookAsGuest() {
    sessionStorage.setItem('guestBooking', 'true');
    var modal = document.getElementById('bookingChoiceModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    window.location.href = (window._ROOT || '') + 'booking.html?guest=true';
}

// Removed logoutUser from main.js as it is defined in auth.js

// ── Scroll Reveal
(function () {
    // data-reveal system
    var revEls = document.querySelectorAll('[data-reveal]');
    if (revEls.length) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var delay = parseInt(e.target.dataset.delay) || 0;
                setTimeout(function () { e.target.classList.add('revealed'); }, delay);
                obs.unobserve(e.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        revEls.forEach(function (el) { obs.observe(el); });
    }

    // .reveal class system (legacy + advanced)
    var allReveal = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    if (allReveal.length) {
        var obs2 = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('revealed');
                obs2.unobserve(e.target);
            });
        }, { threshold: 0.12 });
        allReveal.forEach(function (el) { obs2.observe(el); });
    }
})();

// ── Intersection Observer for Scroll Animations
(function () {
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger').forEach(el => {
        observer.observe(el);
    });
})();

// ── Toggle Password Visibility
function togglePasswordVisibility(inputId, toggleIcon) {
    var input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        input.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// ── Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const burger = document.querySelector('.mobile-burger');
    if (navLinks) navLinks.classList.toggle('nav-open');
    if (navActions) navActions.classList.toggle('nav-open');
    if (burger) burger.classList.toggle('active');
}

// ── Copy Phone Number
function copyPhone() {
    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';
    const phone = "0535402211";
    navigator.clipboard.writeText(phone).then(() => {
        if (typeof showToast === 'function') {
            showToast(isAr ? 'تم نسخ رقم الهاتف! 📱' : 'Numéro copié ! 📱', 'success');
        } else {
            alert((isAr ? 'تم نسخ الرقم: ' : 'Copie : ') + phone);
        }
    });
}

// ── Stats Counter Animation (universal: .stat-number, .ph-stat-num, .about-stat-num)
(function () {
    var selectors = '.stat-number, .ph-stat-num, .about-stat-num';
    var statEls = document.querySelectorAll(selectors);
    if (!statEls.length) return;

    function parseEl(el) {
        // Already parsed?
        if (el.dataset.counterReady) return;
        el.dataset.counterReady = '1';
        var text = el.textContent.trim();
        // Match optional prefix + number (int or decimal) + optional suffix
        // e.g. "+12", "450+", "4.8★", "12+"
        var m = text.match(/^([^0-9]*)(\d+\.?\d*)([^0-9]*)$/);
        if (m) {
            el.dataset.prefix = m[1];
            el.dataset.numval  = m[2];
            el.dataset.suffix  = m[3];
        } else {
            el.dataset.prefix = '';
            el.dataset.numval  = parseFloat(text) || 0;
            el.dataset.suffix  = '';
        }
    }

    function animateCounter(el) {
        parseEl(el);
        var target   = parseFloat(el.dataset.numval) || 0;
        var prefix   = el.dataset.prefix || '';
        var suffix   = el.dataset.suffix || '';
        var isFloat  = target % 1 !== 0;
        var duration = 1800;
        var startTs  = null;
        function step(ts) {
            if (!startTs) startTs = ts;
            var progress = Math.min((ts - startTs) / duration, 1);
            var ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current  = target * ease;
            var display  = isFloat ? current.toFixed(1) : Math.floor(current);
            el.textContent = prefix + display + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = prefix + (isFloat ? target.toFixed(1) : target) + suffix;
            }
        }
        requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            animateCounter(e.target);
            obs.unobserve(e.target);
        });
    }, { threshold: 0.5 });

    statEls.forEach(function (el) { obs.observe(el); });
})();

// ── Chat Toggle
function toggleChat() {
    var win = document.getElementById('chatWindow');
    if (!win) return;
    win.classList.toggle('chat-hidden');
    if (!win.classList.contains('chat-hidden')) {
        if (typeof initChat === 'function') initChat();
    }
}
function handleChatKey(e) {
    if (e.key === 'Enter') sendChatMessage();
}

// ── FAQ accordion (if faq.html uses static HTML fallback)
(function () {
    document.querySelectorAll('.faq-question').forEach(function (q) {
        q.addEventListener('click', function () {
            var item = this.parentElement;
            var allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(function (i) { if (i !== item) i.classList.remove('open'); });
            item.classList.toggle('open');
        });
    });
})();

// ── DOMContentLoaded — run populateNavUser on every page
document.addEventListener('DOMContentLoaded', function () {
    if (typeof populateNavUser === 'function') populateNavUser();
});

// ── SCROLL PROGRESS BAR
(function () {
    var fill = document.getElementById('scrollFill');
    if (!fill) return;
    window.addEventListener('scroll', function () {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        fill.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
})();

// ── NAVBAR SCROLL (يعمل مع كل أنواع الـ nav)
(function () {
    var nav = document.getElementById('mainNav')
        || document.querySelector('#header nav')
        || document.querySelector('nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
        var btn = document.getElementById('backToTop');
        if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
})();

// ── PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () { });
    });
}
