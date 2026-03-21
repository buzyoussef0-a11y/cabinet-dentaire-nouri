/* ── CONFETTI.JS — Celebration on booking confirmation ── */

function launchConfetti() {
    var colors = ['#0D9488', '#06B6D4', '#22C55E', '#F59E0B', '#ffffff', '#a5f3fc'];
    var container = document.body;
    var count = 120;

    for (var i = 0; i < count; i++) {
        (function (i) {
            var piece = document.createElement('div');
            var size = Math.random() * 10 + 6;
            var color = colors[Math.floor(Math.random() * colors.length)];
            var isRect = Math.random() > 0.5;

            piece.style.cssText = [
                'position:fixed',
                'top:-20px',
                'left:' + (Math.random() * 100) + 'vw',
                'width:' + size + 'px',
                'height:' + (isRect ? size * 0.4 : size) + 'px',
                'background:' + color,
                'border-radius:' + (isRect ? '2px' : '50%'),
                'z-index:99999',
                'pointer-events:none',
                'opacity:1',
                'transform:rotate(' + (Math.random() * 360) + 'deg)',
                'animation:confettiFall ' + (Math.random() * 2 + 1.5) + 's ease-in ' + (Math.random() * 0.8) + 's forwards'
            ].join(';');

            container.appendChild(piece);
            setTimeout(function () {
                if (piece.parentNode) piece.parentNode.removeChild(piece);
            }, 4000);
        })(i);
    }

    // Inject keyframes once
    if (!document.getElementById('confettiStyle')) {
        var style = document.createElement('style');
        style.id = 'confettiStyle';
        style.textContent =
            '@keyframes confettiFall {' +
            '0%   { transform: translateY(0)   rotateZ(0deg)   rotateX(0deg);   opacity: 1; }' +
            '80%  { opacity: 1; }' +
            '100% { transform: translateY(105vh) rotateZ(' + (Math.random() * 720 + 360) + 'deg) rotateX(360deg); opacity: 0; }' +
            '}';
        document.head.appendChild(style);
    }
}

// Auto-trigger on confirmation.html
document.addEventListener('DOMContentLoaded', function () {
    var isConfirmPage = window.location.pathname.includes('confirmation');
    if (isConfirmPage) {
        setTimeout(launchConfetti, 600);
        setTimeout(launchConfetti, 1800);
    }
});
