/* ── LOGIN.JS ── */
document.addEventListener('DOMContentLoaded', async function () {
    // Check if already logged in - fix sync/async loop
    if (typeof getCurrentUser === 'function') {
        var user = await getCurrentUser();
        if (user) { window.location.href = (window._ROOT||'') + 'index.html'; return; }
    }

    var form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var phone = (document.getElementById('loginPhone')?.value || '').trim();
        var password = (document.getElementById('loginPassword')?.value || '');
        var errorBox = document.getElementById('errorBox');
        var btn = document.getElementById('loginBtn');

        if (!phone || !password) {
            showError(errorBox, 'يرجى ملء جميع الحقول');
            return;
        }

        // Add loading state
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'جاري تسجيل الدخول...';
        }

        // Since phone isn't a native unique ID in Supabase Auth by default without custom setup,
        // often dental apps use phone@dentist.local as a mock email for easy login if not using social auth.
        // For now, let's assume standard email/password or use a lookup.

        // BETTER: If the app expects phone login, we usually use email-like format for Supabase.
        var email = phone.includes('@') ? phone : phone + '@dentist.local';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Supabase Login Error:', error);
                showError(errorBox, 'رقم الهاتف أو البريد الإلكتروني أو كلمة المرور غير صحيحة');
                if (btn) { btn.disabled = false; btn.textContent = 'دخول'; }
                return;
            }

            // Success - Extract metadata and save to localStorage
            const user = data.user;
            const meta = user.user_metadata || {};
            const userData = {
                id: user.id,
                fullName: meta.full_name || meta.fullName || '',
                phone: meta.phone || '',
                email: user.email || ''
            };
            localStorage.setItem('dental_current_user', JSON.stringify(userData));

            var redirect = localStorage.getItem('dental_redirect_after_login') || 'index.html';
            localStorage.removeItem('dental_redirect_after_login');
            window.location.href = redirect;

        } catch (err) {
            showError(errorBox, 'حدث خطأ غير متوقع');
            if (btn) { btn.disabled = false; btn.textContent = 'دخول'; }
        }
    });

    function showError(box, msg) {
        if (!box) return;
        box.textContent = msg;
        box.style.display = 'block';
        setTimeout(function () { box.style.display = 'none'; }, 4000);
    }
});
