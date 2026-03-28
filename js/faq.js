/* ── FAQ.JS ── */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof populateNavUser === 'function') populateNavUser();

    var faqs = [
        {
            qAr: 'كيف أحجز موعداً عبر الموقع؟',
            qFr: 'Comment prendre rendez-vous via le site ?',
            aAr: 'اضغط على زر "احجز الآن"، أدخل بياناتك واختر الخدمة والتاريخ والوقت المناسب لك. سنتواصل معك لتأكيد الموعد.',
            aFr: 'Cliquez sur "Réserver", entrez vos infos, choisissez le service, la date et l\'heure. Nous vous contacterons pour confirmer.'
        },
        {
            qAr: 'ما هي ساعات عمل العيادة؟',
            qFr: 'Quels sont les horaires d\'ouverture ?',
            aAr: 'العيادة مفتوحة من الاثنين إلى السبت، من الساعة 9 صباحاً حتى 7 مساءً. يوم الأحد مغلق.',
            aFr: 'Le cabinet est ouvert du lundi au samedi, de 9h à 19h. Fermé le dimanche.'
        },
        {
            qAr: 'أين تقع عيادة الدكتور نوري بالضبط؟',
            qFr: 'Où se trouve exactement le cabinet ?',
            aAr: 'العيادة في الطابق الثاني، شقة رقم 1، رقم 209، شارع محمد الخامس، مكناس. الرقم الهاتفي: 0535 40 22 11.',
            aFr: 'Le cabinet est au 2ème étage, Apt 1, n° 209, Av Mohammed V, Meknès. Tél : 0535 40 22 11.'
        },
        {
            qAr: 'هل يمكن حجز موعد للأطفال؟',
            qFr: 'Peut-on prendre rendez-vous pour les enfants ?',
            aAr: 'نعم، الدكتور نوري يتعامل مع الأطفال بصبر ولطف كبير. يمكنك حجز موعد للأطفال بكل سهولة عبر الموقع.',
            aFr: 'Oui, le Dr Nouri traite les enfants avec patience. Réservez facilement via le site.'
        },
        {
            qAr: 'هل الحجز عبر الإنترنت مجاني؟',
            qFr: 'La réservation en ligne est-elle gratuite ?',
            aAr: 'نعم، الحجز عبر الموقع مجاني تماماً. تكلفة العلاج تُحدد فقط بعد الفحص الأولي مع الدكتور.',
            aFr: 'Oui, c\'est gratuit. Le coût du traitement est déterminé après l\'examen initial.'
        },
        {
            qAr: 'كيف يمكنني إلغاء أو تغيير موعدي؟',
            qFr: 'Comment annuler ou modifier mon RDV ?',
            aAr: 'يمكنك الإلغاء عبر صفحة "تتبع مواعيدك" في الموقع، أو الاتصال مباشرة على 0535 40 22 11.',
            aFr: 'Annulez via "Suivi RDV" ou appelez le 0535 40 22 11.'
        },
        {
            qAr: 'ما هي خدمات العيادة؟',
            qFr: 'Quels services sont disponibles ?',
            aAr: 'العيادة تقدم: فحص وتشخيص، تنظيف وتلميع، تبييض الأسنان، تقويم، حشو، وطب أسنان الأطفال.',
            aFr: 'Services : Détartrage, blanchiment, orthodontie, obturation et dentisterie pédiatrique.'
        },
        {
            qAr: 'هل يمكن التواصل عبر واتساب؟',
            qFr: 'Peut-on vous contacter via WhatsApp ?',
            aAr: 'نعم، يمكنك التواصل مباشرة عبر واتساب على الرقم 0535402211 أو الضغط على زر واتساب في الموقع.',
            aFr: 'Oui, via WhatsApp au 0535402211 ou via le bouton sur le site.'
        }
    ];

    var container = document.getElementById('faq-list');
    if (!container) return;

    container.innerHTML = faqs.map(function (item, i) {
        return '<div class="faq-item">' +
            '<div class="faq-question" onclick="toggleFaq(this)">' +
            '<span data-ar="' + item.qAr + '" data-fr="' + item.qFr + '">' + item.qAr + '</span>' +
            '<span class="faq-toggle">+</span>' +
            '</div>' +
            '<div class="faq-answer"><p data-ar="' + item.aAr + '" data-fr="' + item.aFr + '">' + item.aAr + '</p></div>' +
            '</div>';
    }).join('');
});

function toggleFaq(el) {
    var item = el.parentElement;
    var wasOpen = item.classList.contains('open');
    var all = document.querySelectorAll('.faq-item');
    all.forEach(function (i) { if (i !== item) i.classList.remove('open'); });
    item.classList.toggle('open');

    if (!wasOpen) {
        var questionSpan = el.querySelector('span[data-ar]');
        if (questionSpan) {
            sendFaqToChat(questionSpan.textContent.trim());
        }
    }
}

function sendFaqToChat(question) {
    if (typeof toggleChat !== 'function' || typeof sendWithText !== 'function') return;
    if (!chatOpen) {
        toggleChat();
        setTimeout(function () { sendWithText(question); }, 600);
    } else {
        sendWithText(question);
    }
}

function filterFaq(query) {
    if (!query) query = '';
    query = query.toLowerCase();
    var all = document.querySelectorAll('.faq-item');
    var hasResults = false;
    all.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = 'block';
            hasResults = true;
        } else {
            item.style.display = 'none';
        }
    });

    var noResults = document.getElementById('faqNoResults');
    if (noResults) {
        noResults.style.display = hasResults ? 'none' : 'block';
    }
}
