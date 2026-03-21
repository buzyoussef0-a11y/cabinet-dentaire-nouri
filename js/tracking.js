/* ── TRACKING.JS ── */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof requireAuth === 'function') requireAuth();
  if (typeof populateNavUser === 'function') populateNavUser();

  // ✅ حماية صفحة التتبع
  // ✅ حماية صفحة التتبع - Fix async loop
  (async function protectPage() {
    if (typeof getCurrentUser !== 'function') return;
    var user = await getCurrentUser();
    if (!user) {
      localStorage.setItem('dental_redirect_after_login', 'appointment-tracking.html');
      window.location.href = 'login.html';
    }
  })();

  // إخفاء skeleton بعد تحميل البيانات
  var skeleton = document.getElementById('skeletonLoader');
  setTimeout(function () { if (skeleton) skeleton.style.display = 'none'; }, 800);

  renderAppointments();
});

async function renderAppointments() {
  var list = document.getElementById('appointmentsList');
  var empty = document.getElementById('noAppointments');
  var template = document.getElementById('appointmentTemplate');

  if (!list) return;

  var user = (typeof getCurrentUser === 'function') ? await getCurrentUser() : null;
  if (!user) return; // Should be handled by auth protection, but just in case.

  var appointments = [];
  try {
    console.log('Fetching appointments for user:', user.id);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('Supabase Fetch Result:', { data, error });

    if (error) {
      console.error('Error fetching appointments:', error);
      if (typeof showToast === 'function') {
        showToast('❌', 'خطأ في تحميل البيانات', error.message, '#EF4444');
      }
    } else {
      appointments = data || [];
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback to local storage if no user logic or just merging (for legacy local storage ones, optional)

  if (!appointments.length) {
    if (empty) empty.style.display = 'block';
    list.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  list.style.display = 'grid';

  // Create a persistent diagnostic status message
  list.innerHTML = '<div id="tracking-status" style="border: 1px dashed var(--accent); padding: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 0.9rem; background: rgba(13, 242, 242, 0.05); color: var(--accent); text-align: center;">' +
    '🔍 جاري التحقق من المواعيد... (User: ' + user.id.substring(0, 8) + '...)' +
    '</div>';

  console.log('Rendering appointments...', appointments);

  var statusEl = document.getElementById('tracking-status');

  if (appointments.length === 0) {
    if (statusEl) statusEl.innerHTML = '⚠️ لم يتم العثور على أي مواعيد مرتبطة بهذا الحساب (' + user.id.substring(0, 8) + ') في قاعدة البيانات.';
    if (empty) empty.style.display = 'block';
    return;
  }

  // Update status with count
  if (statusEl) statusEl.innerHTML = '✅ تم العثور على ' + appointments.length + ' موعد. جاري العرض المباشر...';

  var appointmentsHtml = '';
  var currentLang = localStorage.getItem('siteLang') || 'ar';
  var isAr = currentLang === 'ar';

  var statusAr = { pending: 'قيد المراجعة', confirmed: 'مؤكد', cancelled: 'ملغى' };
  var statusFr = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };
  var statusColor = { pending: '#F59E0B', confirmed: '#10B981', cancelled: '#EF4444' };

  appointments.forEach(function (apt, index) {
    try {
      var s = apt.status || 'pending';
      var sTxt = isAr ? (statusAr[s] || 'قيد المراجعة') : (statusFr[s] || 'En attente');
      var sCol = statusColor[s] || '#64748B';
      var service = apt.service || (isAr ? 'فحص عام' : 'Consultation');
      var date = apt.preferred_date || '-';
      var time = apt.preferred_time || '';
      var ref = apt.reference_id || '-';
      var name = apt.full_name || '-';

      var lblDate = isAr ? 'التاريخ:' : 'Date :';
      var lblRef = isAr ? 'الرقم المرجعي:' : 'Réf :';
      var lblName = isAr ? 'باسم:' : 'Nom :';

      var btnEdit = isAr ? 'تعديل ✏️' : 'Modifier ✏️';
      var btnCancel = isAr ? 'إلغاء 🗑️' : 'Annuler 🗑️';

      // Build the card HTML directly for maximum reliability
      appointmentsHtml +=
        '<div class="appointment-item" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; align-items: center; justify-content: space-between; margin-bottom:15px;">' +
        '<div style="display: flex; align-items: center; gap: 20px; flex: 1; flex-direction: row-reverse;">' +
        '<div style="width: 60px; height: 60px; background: var(--accent-subtle); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--accent);">🦷</div>' +
        '<div style="text-align: right;">' +
        '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-direction: row-reverse;">' +
        '<span style="font-weight: 700; font-size: 1.1rem; color: var(--text);">' + service + '</span>' +
        '<span style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; color: white; background-color: ' + sCol + ';">' + sTxt + '</span>' +
        '</div>' +
        '<div style="font-size: 0.9rem; color: var(--text-muted); display: flex; gap: 15px; flex-direction: row-reverse;">' +
        '<span><strong style="color: var(--text);">' + lblDate + '</strong> <span>' + date + ' ' + time + '</span></span>' +
        '<span><strong style="color: var(--text);">' + lblRef + '</strong> <span>' + ref + '</span></span>' +
        '</div>' +
        '<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">' +
        '<span><strong style="color: var(--text);">' + lblName + '</strong> <span>' + name + '</span></span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 10px; margin-right: 20px;">' +
        '<button class="btn-ghost" onclick="showToast(\'ℹ️\', \'' + (isAr ? 'تعديل الموعد' : 'Modifier RDV') + '\', \'' + (isAr ? 'يرجى التواصل معنا لتعديل الموعد' : 'Veuillez nous contacter pour modifier') + '\', \'#06B6D4\')" style="padding: 8px 16px; font-size: 0.85rem; border-color: rgba(13, 148, 136, 0.3); color: white; cursor: pointer;">' + btnEdit + '</button>' +
        '<button class="btn-ghost" onclick="cancelAppointment(\'' + ref + '\')" style="padding: 8px 16px; font-size: 0.85rem; color: var(--error); border-color: rgba(244, 63, 94, 0.3); cursor: pointer;" ' + (s === 'cancelled' ? 'disabled style="opacity:0.4;"' : '') + '>' + btnCancel + '</button>' +
        '</div>' +
        '</div>';

      console.log('Built HTML for apt ' + (index + 1));
    } catch (e) {
      console.error('Error building HTML for apt:', e);
    }
  });

  // Inject final HTML
  var finalStatus = statusEl ? statusEl.outerHTML : '';
  list.innerHTML = finalStatus + appointmentsHtml;
}
function cancelAppointment(refId) {
  if (typeof showConfirmModal !== 'function') {
    if (!confirm('هل أنت متأكد من إلغاء الموعد؟')) return;
    performCancel(refId);
    return;
  }

  showConfirmModal({
    icon: '🗑️',
    title: 'إلغاء الموعد',
    msg: 'هل أنت متأكد من إلغاء هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.',
    yesText: 'نعم، إلغاء الموعد',
    onConfirm: function () {
      performCancel(refId);
    }
  });
}


async function performCancel(refId) {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('reference_id', refId);

    if (error) {
      console.error('Cancel Error:', error);
      showToast('حدث خطأ أثناء إلغاء الموعد', 'error');
      return;
    }

    showToast('تم إلغاء الموعد بنجاح', 'success');
    renderAppointments();
  } catch (e) {
    console.error(e);
    showToast('حدث خطأ أثناء إلغاء الموعد', 'error');
  }
}
