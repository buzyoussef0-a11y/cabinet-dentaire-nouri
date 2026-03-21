/* ── FORGOT-PASSWORD.JS ── */
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('forgotPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var email = (document.getElementById('resetEmail')?.value || '').trim();
        var errorBox = document.getElementById('errorBox');
        var successBox = document.getElementById('successBox');
        var btn = document.getElementById('resetBtn');

        if (!email) return;

        if (btn) {
            btn.disabled = true;
            btn.textContent = 'جاري الإرسال...';
        }

        try {
            // Need to specify the redirect URL to resets-password.html
            // The URL must be allowed in Supabase dashboard settings -> Auth -> Redirect URLs
            var resetUrl = window.location.origin + window.location.pathname.replace('forgot-password.html', 'reset-password.html');

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: resetUrl,
            });

            if (error) {
                showMsg(errorBox, error.message || 'حدث خطأ أثناء إرسال الطلب');
                if (btn) { btn.disabled = false; btn.textContent = 'إرسال رابط الاستعادة'; }
                return;
            }

            // Success
            form.style.display = 'none';
            showMsg(successBox, '✅ تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى مراجعة بريدك (والبريد العشوائي/Spam).');

        } catch (err) {
            showMsg(errorBox, 'حدث خطأ غير متوقع');
            if (btn) { btn.disabled = false; btn.textContent = 'إرسال رابط الاستعادة'; }
        }
    });

    function showMsg(box, msg) {
        if (!box) return;
        box.textContent = msg;
        box.style.display = 'block';
    }
});
