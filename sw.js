/* ── SERVICE WORKER — Cabinet Zouhri ── */
var CACHE = 'zouhri-v4';
var ASSETS = [
    '/', '/index.html', '/booking.html',
    '/faq.html', '/appointment-tracking.html',
    '/css/main.css', '/css/components.css',
    '/js/main.js', '/js/auth.js', '/js/booking.js',
    '/js/tracking.js', '/js/faq.js', '/js/chat.js',
    '/js/toasts.js', '/js/confetti.js', '/js/modal.js'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (cached) {
            return cached || fetch(e.request).catch(function () { return caches.match('/index.html'); });
        })
    );
});
