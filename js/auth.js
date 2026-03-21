/* ── AUTH.JS ── */

async function getCurrentUser() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            // Self-heal: ensure localStorage is accurate
            if (!localStorage.getItem('dental_current_user')) {
                const meta = session.user.user_metadata || {};
                const userData = {
                    id: session.user.id,
                    fullName: meta.full_name || meta.fullName || '',
                    phone: meta.phone || '',
                    email: session.user.email || ''
                };
                localStorage.setItem('dental_current_user', JSON.stringify(userData));
            }
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
