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

    function getDisplayId(uid) {
        var hash = 0;
        for (var i = 0; i < uid.length; i++) {
            hash = ((hash << 5) - hash) + uid.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % 9000 + 1000;
    }

    var displayName = (user?.user_metadata?.full_name || localUser?.fullName || user?.email || 'مستخدم').split(' ')[0];
    var userId = user?.id || localUser?.id || '00000';
    var userNumber = getDisplayId(userId);

    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';

    // index.html has auth-links slot
    var authLinks = document.getElementById('auth-links');
    if (authLinks) {
        authLinks.innerHTML =
            '<span class="user-welcome-pill">' +
            '  <span class="user-welcome-text" data-ar="مرحباً" data-fr="Bonjour">مرحباً</span>' +
            '  <span class="user-first-name">' +
            getFirstName(user || localUser || {}) +
            '  </span>' +
            '</span>' +
            '<a href="' + (window._ROOT||'') + 'pages/profile.html" class="nav-user-avatar" title="' + (isAr ? 'حسابي' : 'Mon compte') + '">' +
            '  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">' +
            '  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" ' +
            '  stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
            '</a>' +
            '<a href="#" onclick="logoutUser()" class="nav-signout-btn" data-ar="خروج" data-fr="Quitter">' +
            '  خروج' +
            '</a>';
    }

    // other pages — inject before last nav-link item
    var navLinks = document.querySelector('.nav-links');
    if (navLinks && !authLinks) {
        var existing = navLinks.querySelector('.nav-user-info');
        if (!existing) {
            var li = document.createElement('li');
            li.className = 'nav-user-info';
            li.innerHTML =
                '<div class="nav-user" style="display:flex; align-items:center; gap:10px; padding: 0 15px;">' +
                '<div class="nav-user-avatar" style="width:32px;height:32px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">' + displayName.charAt(0).toUpperCase() + '</div>' +
                '<div style="display:flex;flex-direction:column;line-height:1.2;">' +
                '<span style="color:#F1F5F9;font-size:.85rem;font-weight:600;">' + displayName + '</span>' +
                '<button onclick="logoutUser()" style="background:none;border:none;color:var(--accent);font-size:.7rem;padding:0;cursor:pointer;text-align:right;">خروج</button>' +
                '</div>' +
                '</div>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
    }
}

// ── goToBooking (all pages)
function goToBooking() {
    if (window._supabase) {
        window._supabase.auth.getSession()
            .then(function (res) {
                if (res.data && res.data.session) {
                    window.location.href = (window._ROOT || '') + 'booking.html';
                } else {
                    showBookingModal();
                }
            })
            .catch(function () { showBookingModal(); });
    } else {
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
    const burger = document.querySelector('.mobile-burger');
    if (navLinks) navLinks.classList.toggle('active');
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

// ── Stats Counter Animation
(function () {
    const statEls = document.querySelectorAll('.stat-number');
    if (!statEls.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const duration = 2000;
            const stepTime = 20;
            const increment = target / (duration / stepTime);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target.toLocaleString('ar');
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current).toLocaleString('ar');
                }
            }, stepTime);
            obs.unobserve(el);
        });
    }, { threshold: 1 });
    statEls.forEach(el => obs.observe(el));
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
