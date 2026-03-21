/* ── MODAL.JS — بديل احترافي عن confirm() ── */
function showConfirmModal(options) {
  var modal    = document.getElementById('confirmModal');
  var icon     = document.getElementById('confirmModalIcon');
  var title    = document.getElementById('confirmModalTitle');
  var msg      = document.getElementById('confirmModalMsg');
  var yesBtn   = document.getElementById('confirmModalYes');
  var noBtn    = document.getElementById('confirmModalNo');
  var overlay  = document.getElementById('confirmModalOverlay');

  if (!modal) return;

  if (icon)  icon.textContent  = options.icon  || '⚠️';
  if (title) title.textContent = options.title || 'تأكيد الإجراء';
  if (msg)   msg.textContent   = options.msg   || 'هل أنت متأكد؟';
  if (yesBtn) yesBtn.textContent = options.yesText || 'نعم، تأكيد';

  modal.style.display = 'flex';

  function close() { modal.style.display = 'none'; }

  yesBtn.onclick = function() { close(); if (options.onConfirm) options.onConfirm(); };
  noBtn.onclick  = function() { close(); if (options.onCancel)  options.onCancel();  };
  if (overlay) overlay.onclick = function() { close(); };
}
