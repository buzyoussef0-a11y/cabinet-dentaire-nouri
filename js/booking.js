/* ── BOOKING.JS ── */
window.submitBooking = submitBooking;
var WEBHOOK_URL = 'https://jijiyassine.app.n8n.cloud/webhook/ac1a0ab6-6ff3-4aac-af1d-fb794a2d4d6f';
var currentStep = 1;

document.addEventListener('DOMContentLoaded', async () => {
    // ✅ حماية صفحة الحجز وضمان تحميل الجلسة
    var user = null;
    var params = new URLSearchParams(window.location.search);
    var isGuest = params.get('guest') === 'true'
        || sessionStorage.getItem('guestBooking') === 'true';

    if (typeof getCurrentUser === 'function') {
        user = await getCurrentUser();
        if (!user && !isGuest) {
            localStorage.setItem('dental_redirect_after_login', window.location.href);
            window.location.href = (window._ROOT||'') + 'pages/login.html';
            return;
        }
    }

    // ✅ تهيئة البيانات الأولية والمستمعين بعد التأكد من وجود المستخدم
    await togglePersonalInfo(false);

    var checkbox = document.getElementById('bookForOthers');
    if (checkbox) {
        checkbox.addEventListener('change', async function () {
            await togglePersonalInfo(this.checked);
        });
    }

    if (typeof populateNavUser === 'function') populateNavUser();

    // Set min date
    var dateInput = document.getElementById('preferredDate');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    showStep(1);

    // Confirm checkbox
    var confirmChk = document.getElementById('confirmCheckbox');
    var submitBtn = document.getElementById('submitBtn');
    if (confirmChk && submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        confirmChk.addEventListener('change', function () {
            submitBtn.disabled = !this.checked;
            submitBtn.style.opacity = this.checked ? '1' : '0.5';
        });
    }
});

async function togglePersonalInfo(forOthers) {
    var fieldIds = ['fullName', 'phone', 'email'];
    var user = null;
    if (typeof getCurrentUser === 'function') {
        user = await getCurrentUser();
    }

    if (forOthers) {
        // Clear fields for others
        fieldIds.forEach(id => {
            var el = document.getElementById(id);
            if (el) {
                el.value = '';
                el.style.borderColor = '';
                el.style.background = '';
            }
        });
    } else if (user) {
        // Prefill with live Supabase metadata
        var meta = user.user_metadata || {};
        var dataMap = {
            'fullName': meta.full_name || meta.fullName || '',
            'phone': meta.phone || '',
            'email': user.email || ''
        };
        fieldIds.forEach(id => {
            var el = document.getElementById(id);
            var val = dataMap[id];
            if (el) {
                el.value = val;
                if (val) {
                    el.style.borderColor = 'rgba(34,197,94,0.5)';
                    el.style.background = 'rgba(34,197,94,0.04)';
                }
            }
        });
    }
}

function wire(id, fn) {
    // ... rest of the functions
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
}
function prevStep(current) {
    showStep(current - 1);
    updateProgress(current - 1);
}

function selectService(el) {
    var val = el.getAttribute('data-value');
    document.querySelectorAll('.service-option-card').forEach(function (card) {
        card.classList.remove('selected');
    });
    el.classList.add('selected');
    document.getElementById('service').value = val;

    var revService = document.getElementById('revService');
    if (revService) revService.textContent = val;
}

// ── STEP NAVIGATION ──
function nextStep(current) {
    if (current === 1) {
        if (!validateStep1()) return;
        showStep(2);
    } else if (current === 2) {
        if (!validateStep2()) return;
        populateReview();
        showStep(3);
    }
}

function setValue(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
}
function getValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function showStep(n) {
    [1, 2, 3].forEach(function (i) {
        var s = document.getElementById('step' + i);
        if (s) s.style.display = (i === n) ? 'block' : 'none';
    });
    currentStep = n;
    updateProgress(n);
    var container = document.querySelector('.booking-container') || document.querySelector('main');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgress(active) {
    document.querySelectorAll('.progress-step').forEach(function (el, i) {
        el.classList.remove('active', 'completed');
        var step = parseInt(el.dataset.step || (i + 1));
        if (step === active) el.classList.add('active');
        if (step < active) el.classList.add('completed');
    });
    document.querySelectorAll('.progress-line').forEach(function (line, i) {
        if (i + 1 < active) line.classList.add('completed');
        else line.classList.remove('completed');
    });
}

function showFieldError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('input-error');
    var existing = el.parentNode.querySelector('.field-error-msg');
    if (existing) existing.remove();
    var err = document.createElement('p');
    err.className = 'field-error-msg';
    err.textContent = msg;
    el.parentNode.insertBefore(err, el.nextSibling);
}
function clearErrors() {
    document.querySelectorAll('.field-error-msg').forEach(function (e) { e.remove(); });
    document.querySelectorAll('.input-error').forEach(function (f) { f.classList.remove('input-error'); });
}

function validateStep1() {
    clearErrors(); var ok = true;
    var name = getValue('fullName');
    var phone = getValue('phone');
    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';

    if (name.length < 2) {
        showFieldError('fullName', isAr ? 'يرجى إدخال الاسم الكامل' : 'Veuillez entrer le nom complet');
        ok = false;
    }
    if (!/[\d]{7,}/.test(phone.replace(/\s/g, ''))) {
        showFieldError('phone', isAr ? 'يرجى إدخال رقم هاتف صحيح' : 'Entrez un numéro valide');
        ok = false;
    }
    return ok;
}
function validateStep2() {
    clearErrors(); var ok = true;
    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';

    if (!getValue('service')) {
        showFieldError('service', isAr ? 'يرجى اختيار الخدمة' : 'Choisissez un service');
        ok = false;
    }
    if (!getValue('preferredDate')) {
        showFieldError('preferredDate', isAr ? 'يرجى اختيار التاريخ' : 'Choisissez une date');
        ok = false;
    }
    else {
        var selectedDay = new Date(getValue('preferredDate')).getUTCDay();
        if (selectedDay === 0) {
            showFieldError('preferredDate', isAr ? 'العيادة مغلقة يوم الأحد. يرجى اختيار يوم من الاثنين إلى السبت.' : 'Fermé le dimanche. Choisissez un jour de Lun à Sam.');
            ok = false;
        }
    }
    if (!getValue('preferredTime')) {
        showFieldError('preferredTime', isAr ? 'يرجى اختيار الوقت' : "Choisissez l'heure");
        ok = false;
    }
    return ok;
}

function populateReview() {
    var svcEl = document.getElementById('service');
    var svcText = svcEl ? (svcEl.options ? svcEl.options[svcEl.selectedIndex]?.text : getValue('service')) : getValue('service');
    if (!svcText) svcText = '-';
    set('revName', getValue('fullName') || '-');
    set('revPhone', getValue('phone') || '-');
    set('revService', svcText);
    set('revDate', getValue('preferredDate') || '-');
    set('revTime', getValue('preferredTime') || '-');
    var otherRow = document.getElementById('revOtherRow');
    if (otherRow) otherRow.style.display = document.getElementById('bookForOthers')?.checked ? 'flex' : 'none';
}
function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

function showNotification(type, title, message) {
    var icon = type === 'success' ? '✅' : '⚠️';
    var color = type === 'success' ? '#22C55E' : '#EF4444';
    if (typeof showToast === 'function') {
        showToast(icon, title, message, color);
    } else {
        alert(title + ": " + message);
    }
}

async function submitBooking() {
    var user = null;
    try { if (typeof getCurrentUser === 'function') user = await getCurrentUser(); } catch (e) { }

    var btn = document.getElementById('submitBtn');
    var chk = document.getElementById('confirmCheckbox');

    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';

    if (!chk || !chk.checked) {
        showNotification('error', isAr ? 'تنبيه' : 'Attention', isAr ? 'يرجى تأكيد موافقتك على سياسة العيادة' : 'Veuillez accepter la politique');
        return;
    }

    var name = getValue('fullName');
    var phone = getValue('phone');
    var email = getValue('email');
    var service = getValue('service');
    var date = getValue('preferredDate');
    var time = getValue('preferredTime');
    var notes = getValue('notes');
    var forOthers = document.getElementById('bookForOthers')?.checked || false;

    if (!name || !phone || !service || !date || !time) {
        showNotification('error', isAr ? 'بيانات ناقصة' : 'Infos manquantes', isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs');
        return;
    }

    var refId = 'DENT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    sessionStorage.setItem('referenceId', refId);
    sessionStorage.setItem('service', service);
    sessionStorage.setItem('preferredDate', date);
    sessionStorage.setItem('preferredTime', time);
    sessionStorage.setItem('patientName', name);

    if (btn) {
        btn.disabled = true;
        var originalText = btn.innerHTML;
        btn.innerHTML = '<span class="btn-spinner"></span> ' + (isAr ? 'جاري الإرسال...' : 'Envoi...');
    }

    var user = (typeof getCurrentUser === 'function') ? await getCurrentUser() : null;

    var payload = {
        referenceId: refId,
        fullName: name,
        phone: phone,
        email: email,
        service: service,
        preferredDate: date,
        preferredTime: time,
        notes: notes,
        bookForOthers: forOthers,
        userId: user ? user.id : null,
        submittedAt: new Date().toISOString(),
        source: 'website-booking'
    };

    try {
        try {
            if (window.supabase) {
                console.log('Inserting appointment for:', user ? user.id : 'GUEST');
                const { data: dbData, error: dbErr } = await supabase.from('appointments').insert([{
                    reference_id: refId,
                    full_name: name,
                    phone: phone,
                    email: email,
                    service: service,
                    preferred_date: date,
                    preferred_time: time,
                    notes: notes,
                    user_id: user ? user.id : null,
                    status: 'pending'
                }]);

                if (dbErr) {
                    console.error('Supabase Insertion Error:', dbErr);
                    throw new Error('فشل تسجيل الموعد في قاعدة البيانات: ' + dbErr.message);
                }
                console.log('Supabase Insertion Success:', dbData);
            }
        } catch (sbErr) {
            showNotification('error', isAr ? 'خطأ في قاعدة البيانات' : 'Erreur DB', isAr ? ('فشل حفظ الموعد: ' + sbErr.message) : ('Échec : ' + sbErr.message));
            if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
            return; // STOP HERE if DB fails
        }

        const webResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!webResponse.ok) throw new Error('Webhook error');

        sessionStorage.removeItem('guestBooking');
        showNotification('success', isAr ? 'تم الحجز' : 'Réservé', isAr ? 'تم استلام طلبك بنجاح!' : 'Demande reçue avec succès !');
        setTimeout(function () { window.location.href = (window._ROOT||'') + 'pages/confirmation.html'; }, 1500);

    } catch (err) {
        console.error('Submit error:', err);
        showNotification('error', isAr ? 'خطأ في الإرسال' : 'Erreur envoi', isAr ? 'حدث خطأ. يرجى المحاولة لاحقاً' : 'Erreur. Veuillez réessayer plus tard');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

function initWeekPicker() {
    var picker = document.getElementById('weekDatePicker');
    if (!picker) return;
    var days = [];
    var now = new Date();
    // Generate 7 days (upcoming week)
    for (var i = 0; i < 7; i++) {
        var d = new Date();
        d.setDate(now.getDate() + i);
        days.push(d);
    }
    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';

    var daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    var daysFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    var monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    var monthsFr = ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    var html = '';
    days.forEach(function (day) {
        var isSunday = day.getDay() === 0;
        var dateIso = day.toISOString().split('T')[0];
        var classes = 'date-card' + (isSunday ? ' disabled' : '');
        var dayName = isAr ? daysAr[day.getDay()] : daysFr[day.getDay()];
        var monthName = isAr ? monthsAr[day.getMonth()] : monthsFr[day.getMonth()];

        html += '<div class="' + classes + '" ' + (isSunday ? '' : 'onclick="selectDate(this, \'' + dateIso + '\')"') + '>';
        html += '  <div class="date-day-name">' + dayName + '</div>';
        html += '  <div class="date-day-num">' + day.getDate() + '</div>';
        html += '  <div class="date-month">' + monthName + '</div>';
        html += '</div>';
    });
    picker.innerHTML = html;
}

function selectDate(el, date) {
    document.querySelectorAll('.date-card').forEach(function (c) { c.classList.remove('selected'); });
    el.classList.add('selected');
    document.getElementById('preferredDate').value = date;
    var revDate = document.getElementById('revDate');
    if (revDate) revDate.textContent = date;
    var slotBtn = document.getElementById('loadSlotsBtn');
    if (slotBtn) {
        slotBtn.style.display = 'flex';
        document.getElementById('timeSlotsContainer').innerHTML = '';
    }
}

async function loadAvailableSlots() {
    var dateVal = document.getElementById('preferredDate').value;
    if (!dateVal) return;

    var btn = document.getElementById('loadSlotsBtn');
    var currentLang = localStorage.getItem('siteLang') || 'ar';
    var isAr = currentLang === 'ar';

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> ' + (isAr ? 'جاري التحميل...' : 'Chargement...');

    var allSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

    var bookedSlots = [];
    try {
        if (window.supabase) {
            // Fetch appointments for the selected date that are not cancelled
            const { data, error } = await supabase
                .from('appointments')
                .select('preferred_time')
                .eq('preferred_date', dateVal)
                .neq('status', 'cancelled');

            if (error) throw error;
            if (data) {
                // Time from DB might be "HH:MM:SS", we need "HH:MM"
                bookedSlots = data.map(app => {
                    if (typeof app.preferred_time === 'string' && app.preferred_time.length >= 5) {
                        return app.preferred_time.slice(0, 5);
                    }
                    return app.preferred_time;
                });
                console.log('Processed booked slots:', bookedSlots);
            }
        }
    } catch (err) {
        console.error('Error fetching booked slots:', err);
    }

    var html = '<div class="slots-grid">';
    allSlots.forEach(function (slot) {
        // Compare "HH:MM" against mapped "HH:MM"
        var isBooked = bookedSlots.includes(slot);
        if (!isBooked) {
            html += '<button type="button" class="slot-btn available" onclick="selectSlot(this,\'' + slot + '\')">' + slot + '</button>';
        } else {
            html += '<button type="button" class="slot-btn unavailable" disabled><s>' + slot + '</s></button>';
        }
    });
    html += '</div>';

    document.getElementById('timeSlotsContainer').innerHTML = html;
    btn.innerHTML = isAr ? '🔄 تحديث المواعيد' : '🔄 Actualiser les créneaux';
    btn.disabled = false;
}

function selectSlot(el, time) {
    document.querySelectorAll('.slot-btn.available').forEach(function (b) { b.classList.remove('selected'); });
    el.classList.add('selected');
    document.getElementById('preferredTime').value = time;
    var revTime = document.getElementById('revTime');
    if (revTime) revTime.textContent = time;
}
