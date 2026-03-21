/* ── RESET-PASSWORD.JS ── */
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('resetPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var password = (document.getElementById('newPassword')?.value || '');
        var confirm = (document.getElementById('confirmNewPassword')?.value || '');
        var errorBox = document.getElementById('errorBox');
        var successBox = document.getElementById('successBox');
        var btn = document.getElementById('updateBtn');

        if (password !== confirm) {
            showMsg(errorBox, 'كلمتا المرور غير متطابقتين');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.textContent = 'جاري التحديث...';
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                showMsg(errorBox, error.message || 'حدث خطأ أثناء تحديث كلمة المرور');
                if (btn) { btn.disabled = false; btn.textContent = 'حفظ كلمة المرور الجديدة'; }
                return;
            }

            // Success
            form.style.display = 'none';
            document.querySelector('.auth-subtitle').style.display = 'none';
            showMsg(successBox, '✅ تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
            document.getElementById('loginLinkContainer').style.display = 'block';

        } catch (err) {
            showMsg(errorBox, 'حدث خطأ غير متوقع');
            if (btn) { btn.disabled = false; btn.textContent = 'حفظ كلمة المرور الجديدة'; }
        }
    });

    function showMsg(box, msg) {
        if (!box) return;
        box.textContent = msg;
        box.style.display = 'block';
        setTimeout(() => { if (box === errorBox) box.style.display = 'none'; }, 4500);
    }
});
