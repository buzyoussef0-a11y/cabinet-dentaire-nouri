/* ── AUTH.JS ── */

async function getCurrentUser() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            // Always keep id/email fresh; preserve fullName if already set from profile sync
            const meta = session.user.user_metadata || {};
            let existing = {};
            try { existing = JSON.parse(localStorage.getItem('dental_current_user') || '{}'); } catch (e) {}
            const userData = {
                id: session.user.id,
                fullName: existing.fullName || meta.full_name || meta.fullName || '',
                phone: existing.phone || meta.phone || '',
                email: session.user.email || ''
            };
            localStorage.setItem('dental_current_user', JSON.stringify(userData));
            return session.user;
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function requireAuth() {
    var publicPages = ['index.html', 'login.html', 'register.html', 'faq.html', 'booking.html', ''];
    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';

    var user = await getCurrentUser();

    if (!user && !publicPages.includes(page)) {
        localStorage.setItem('dental_redirect_after_login', window.location.href);
        window.location.href = (window._ROOT||'') + 'pages/login.html';
        return null;
    }
    return user;
}

async function logoutUser() {
    await supabase.auth.signOut();
    localStorage.removeItem('dental_current_user');
    sessionStorage.clear();
    window.location.href = (window._ROOT||'') + 'index.html';
}
window.logoutUser = logoutUser;

function getFirstName(user) {
    // Try full_name or name from Supabase profile
    if (user.user_metadata && user.user_metadata.full_name) {
        return user.user_metadata.full_name.split(' ')[0];
    }
    if (user.user_metadata && user.user_metadata.name) {
        return user.user_metadata.name.split(' ')[0];
    }
    // Fallback: use email prefix before @
    if (user.email) {
        var prefix = user.email.split('@')[0];
        // Capitalize first letter
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'مستخدم';
}

/* ── Navbar: skeleton → profile name (no flash) ── */
/* auth.js loads before main.js, so this DOMContentLoaded runs first.
   1. Inject skeleton into #auth-links immediately (no wrong-name flash).
   2. Override window.populateNavUser so main.js skips auth-links pages.
   3. Fetch real name from profiles table, then render full dropdown. */
document.addEventListener('DOMContentLoaded', function () {
    var authLinks = document.getElementById('auth-links');
    if (!authLinks) return; // pages without auth-links slot: let main.js handle it

    /* Inject pulse-skeleton CSS once */
    if (!document.getElementById('navSkeletonStyle')) {
        var style = document.createElement('style');
        style.id = 'navSkeletonStyle';
        style.textContent = '@keyframes navPulse{0%,100%{opacity:0.4}50%{opacity:0.9}}';
        document.head.appendChild(style);
    }

    /* Show skeleton immediately — prevents any wrong name from appearing */
    authLinks.innerHTML = '<div style="width:140px;height:36px;background:rgba(255,255,255,0.08);border-radius:50px;animation:navPulse 1.5s ease-in-out infinite;"></div>';

    /* Override populateNavUser so main.js doesn't replace our skeleton with wrong name */
    window._authLinksHandled = true;
    var _origPopulate = window.populateNavUser;
    window.populateNavUser = async function () {
        if (window._authLinksHandled) return; // we own auth-links
        return _origPopulate && _origPopulate.apply(this, arguments);
    };

    /* Async: fetch real profile name and render correct dropdown */
    (async function () {
        try {
            var user = await getCurrentUser();
            /* Fallback: Supabase session may not be ready yet — use localStorage */
            if (!user) {
                try {
                    var stored = localStorage.getItem('dental_current_user');
                    if (stored) {
                        var sd = JSON.parse(stored);
                        if (sd && sd.id) user = { id: sd.id, email: sd.email || '', user_metadata: { full_name: sd.fullName || '' }, _fromStorage: true };
                    }
                } catch (e) {}
            }
            if (!user) { authLinks.innerHTML = ''; return; }

            var profile = null;
            /* Only fetch from DB when we have a real authenticated session */
            if (!user._fromStorage) {
                try {
                    var { data: pd } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();
                    profile = pd;
                    /* Sync the correct name back to localStorage so fallback pages get it too */
                    if (pd && pd.full_name) {
                        try {
                            var _ls = JSON.parse(localStorage.getItem('dental_current_user') || '{}');
                            _ls.fullName = pd.full_name;
                            localStorage.setItem('dental_current_user', JSON.stringify(_ls));
                        } catch (e) {}
                    }
                } catch (e) { /* ignore — fall back to metadata */ }
            }

            /* Use localStorage stored fullName when _fromStorage fallback */
            var storedFullName = '';
            try {
                var _s = localStorage.getItem('dental_current_user');
                if (_s) { var _sd = JSON.parse(_s); storedFullName = _sd.fullName || ''; }
            } catch (e) {}

            var fullName = (profile && profile.full_name) ||
                storedFullName ||
                (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
                (user.email ? user.email.split('@')[0] : 'مستخدم');

            var firstName = fullName.split(' ')[0];
            var initial = firstName.charAt(0).toUpperCase();
            var isAr = (localStorage.getItem('siteLang') || 'ar') === 'ar';
            var profileHref = (window._ROOT || '') + 'pages/profile.html';

            var dropdownHTML = [
                '<div class="user-dropdown-wrapper" style="position:relative;">',
                '<button class="user-dropdown-btn" onclick="toggleUserDropdown()" style="display:flex;align-items:center;gap:8px;background:#ffffff;border:1.5px solid rgba(0,106,103,0.3);border-radius:50px;padding:6px 14px 6px 6px;cursor:pointer;color:#001133;font-family:Cairo,sans-serif;font-size:0.9rem;box-shadow:0 2px 8px rgba(0,0,0,0.08);">',
                '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#006a67,#009e99);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:#ffffff;">' + initial + '</div>',
                '<span style="color:#001133;font-weight:700;">' + (isAr ? 'مرحباً ' : 'Bonjour ') + firstName + '</span>',
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="opacity:0.5"><path d="M6 9l6 6 6-6" stroke="#001133" stroke-width="2" stroke-linecap="round"/></svg>',
                '</button>',
                '<div id="userDropdownMenu" style="display:none;position:absolute;top:calc(100% + 8px);left:0;background:#ffffff;border:1px solid rgba(0,106,103,0.15);border-radius:12px;padding:8px;min-width:180px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.12);">',
                '<a href="' + profileHref + '" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:#001133;text-decoration:none;font-family:Cairo,sans-serif;font-size:0.9rem;" onmouseover="this.style.background=\'rgba(0,106,103,0.07)\'" onmouseout="this.style.background=\'transparent\'">',
                '👤 <span>' + (isAr ? 'ملفي الشخصي' : 'Mon profil') + '</span>',
                '</a>',
                '<div style="height:1px;background:rgba(0,106,103,0.1);margin:4px 0;"></div>',
                '<button onclick="logoutUser()" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:#EF4444;background:transparent;border:none;width:100%;font-family:Cairo,sans-serif;font-size:0.9rem;cursor:pointer;text-align:right;" onmouseover="this.style.background=\'rgba(239,68,68,0.1)\'" onmouseout="this.style.background=\'transparent\'">',
                '🚪 <span>' + (isAr ? 'تسجيل الخروج' : 'Se déconnecter') + '</span>',
                '</button>',
                '</div>',
                '</div>'
            ].join('');

            authLinks.innerHTML = dropdownHTML;
        } catch (e) { authLinks.innerHTML = ''; }
    })();
});
