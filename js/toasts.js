/* ── TOASTS.JS — Live Activity Notifications ── */

var TOAST_NAMES = [
    'يوسف', 'محمد', 'سارة', 'أمين', 'فاطمة', 'خالد',
    'نور', 'عمر', 'رنا', 'أيوب', 'سلمى', 'هشام'
];
var TOAST_CITIES = ['مكناس', 'إفران', 'مكناس', 'بني ملال', 'خنيفرة', 'تيزنيت'];
var TOAST_SERVICES = [
    'تبييض الأسنان', 'تنظيف الأسنان',
    'فحص شامل', 'تقويم الأسنان', 'حشو الأسنان'
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function showToast(icon, title, sub, dotColor) {
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
        '<span class="toast-icon">' + icon + '</span>' +
        '<div class="toast-body">' +
        '<span class="toast-title">' + title + '</span>' +
        '<span class="toast-sub">' + sub + '</span>' +
        '</div>' +
        '<span class="toast-live-dot" style="background:' + (dotColor || '#22C55E') + ';box-shadow:0 0 6px ' + (dotColor || '#22C55E') + '"></span>';

    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add('out');
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 400);
    }, 4500);
}

function showBookingToast() {
    var name = randomItem(TOAST_NAMES);
    var city = randomItem(TOAST_CITIES);
    var service = randomItem(TOAST_SERVICES);
    showToast('✅', name + ' من ' + city + ' حجز للتو', service + ' · منذ ثوانٍ', '#22C55E');
}

function showViewToast() {
    var name = randomItem(TOAST_NAMES);
    var city = randomItem(TOAST_CITIES);
    showToast('👁️', name + ' من ' + city + ' يتصفح الموقع', 'الآن · زائر نشط', '#06B6D4');
}

function showRatingToast() {
    var name = randomItem(TOAST_NAMES);
    showToast('⭐', name + ' أعطى تقييم 5 نجوم', 'تقييم ممتاز للعيادة', '#F59E0B');
}

// ── Toast cycle disabled as per user request to remove random messages
/*
document.addEventListener('DOMContentLoaded', function () {
    var toasts = [showBookingToast, showViewToast, showRatingToast, showBookingToast, showBookingToast];
    var idx = 0;
    var intervals = [4500, 11000, 17000, 24000, 32000];

    intervals.forEach(function (delay, i) {
        setTimeout(function () {
            if (toasts[i % toasts.length]) toasts[i % toasts.length]();
        }, delay);
    });

    // repeat every 40s
    setInterval(function () {
        toasts[idx % toasts.length]();
        idx++;
    }, 40000);
});
*/
