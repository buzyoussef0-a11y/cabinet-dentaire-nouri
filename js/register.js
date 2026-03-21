/* ── REGISTER.JS ── */
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        var fullName = (document.getElementById('regFullName')?.value || '').trim();
        var phone = (document.getElementById('regPhone')?.value || '').trim();
        var emailInput = (document.getElementById('regEmail')?.value || '').trim();
        var password = (document.getElementById('regPassword')?.value || '');
        var confirm = (document.getElementById('regConfirmPassword')?.value || '');
        var errorBox = document.getElementById('errorBox');
        var btn = form.querySelector('button[type="submit"]');

        var currentLang = localStorage.getItem('siteLang') || 'ar';
        var isAr = currentLang === 'ar';

        // Validate
        if (fullName.length < 3) { showError(errorBox, isAr ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Le nom doit comporter au moins 3 caractères'); return; }
        if (!/^[\+]?[\d\s\-]{7,}$/.test(phone)) { showError(errorBox, isAr ? 'يرجى إدخال رقم هاتف صحيح' : 'Veuillez entrer un numéro de téléphone valide'); return; }
        if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) { showError(errorBox, isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Veuillez entrer un e-mail valide'); return; }
        if (password.length < 6) { showError(errorBox, isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit comporter au moins 6 caractères'); return; }
        if (password !== confirm) { showError(errorBox, isAr ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas'); return; }

        if (btn) {
            btn.disabled = true;
            btn.textContent = isAr ? 'جاري إنشاء الحساب...' : 'Création du compte...';
        }

        // Use phone as part of email if email not provided (though form says required, good to be safe)
        var email = emailInput || (phone + '@dentist.local');

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    }
                }
            });

            if (error) {
                console.error('Supabase SignUp Error:', error);
                var msg = isAr ? 'حدث خطأ أثناء التسجيل' : 'Erreur lors de l\'inscription';
                if (error.status === 422 || error.message.toLowerCase().includes('already registered')) {
                    msg = isAr ? 'هذا البريد الإلكتروني مسجل مسبقاً. حاول تسجيل الدخول.' : 'Cet e-mail est déjà enregistré. Essayez de vous connecter.';
                } else if (error.message.toLowerCase().includes('weak') || error.message.toLowerCase().includes('password')) {
                    msg = isAr ? 'كلمة المرور لا تستوفي الشروط (يجب أن تكون 6 خانات على الأقل وتحتوي أرقاماً وحروفاً).' : 'Mot de passe trop faible (min 6 caractères).';
                } else if (error.status === 429) {
                    msg = isAr ? 'تم إرسال الكثير من الطلبات (Rate Limit). يرجى الانتظار 10 دقائق والمحاولة مجدداً.' : 'Trop de tentatives. Veuillez attendre 10 minutes.';
                } else {
                    msg = error.message;
                }
                showError(errorBox, msg);
                if (btn) { btn.disabled = false; btn.textContent = isAr ? 'إنشاء الحساب' : 'Créer le compte'; }
                return;
            }

            // Success
            showSuccessScreen(data.user.id.substring(0, 8), fullName);

        } catch (err) {
            showError(errorBox, isAr ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue');
            if (btn) { btn.disabled = false; btn.textContent = isAr ? 'إنشاء الحساب' : 'Créer le compte'; }
        }
    });

    function showError(box, msg) {
        if (!box) return;
        box.textContent = msg; box.style.display = 'block';
        setTimeout(function () { box.style.display = 'none'; }, 4500);
    }

    function showSuccessScreen(id, name) {
        var formContainer = document.getElementById('registerFormContainer');
        var successScreen = document.getElementById('successScreen');
        var idDisplay = document.getElementById('userIdDisplay');
        var nameDisplay = document.getElementById('successName');
        var countdown = document.getElementById('redirectCountdown');

        if (formContainer) formContainer.style.display = 'none';
        if (successScreen) successScreen.style.display = 'block';
        if (idDisplay) idDisplay.textContent = '#' + id;
        if (nameDisplay) nameDisplay.textContent = name;

        var secs = 4;
        var timer = setInterval(function () {
            secs--;
            if (countdown) countdown.textContent = secs;
            if (secs <= 0) {
                clearInterval(timer);
                window.location.href = 'login.html';
            }
        }, 1000);
    }
});
