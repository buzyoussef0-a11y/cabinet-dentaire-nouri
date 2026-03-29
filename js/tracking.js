/* ── TRACKING.JS ── */

/* ══════════════════════════════════════════
   AUTO-CLEANUP — delete expired appointments
══════════════════════════════════════════ */

/**
 * Parse a time string into { hours, minutes }
 * Handles: "10:30", "10h30", "10h", "14:00", "2:30 PM", "10:30 AM"
 */
function parseTimeString(timeStr) {
  if (!timeStr) return { hours: 23, minutes: 59 }; // no time = treat as end of day
  var s = String(timeStr).trim().toUpperCase();
  var isPM = s.includes('PM');
  var isAM = s.includes('AM');
  s = s.replace(/[APM\s]/g, '');
  var parts = s.split(/[H:]/);
  var h = parseInt(parts[0], 10) || 0;
  var m = parseInt(parts[1], 10) || 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return { hours: h, minutes: m };
}

/**
 * Returns true if the appointment's date+time is in the past
 */
function isAppointmentExpired(apt) {
  var dateStr = apt.preferred_date || apt.appointment_date || apt.date;
  var timeStr = apt.preferred_time || apt.appointment_time || apt.time;
  if (!dateStr || dateStr === '-') return false;

  var t = parseTimeString(timeStr);
  var apptDate = new Date(dateStr);
  if (isNaN(apptDate.getTime())) return false;

  apptDate.setHours(t.hours, t.minutes, 0, 0);
  return apptDate.getTime() < Date.now();
}

/**
 * Delete all expired appointments for the current user from Supabase
 * Returns the list of non-expired appointments
 */
async function cleanupExpiredAppointments(userId, appointments) {
  var expired = appointments.filter(function (apt) {
    return apt.status !== 'cancelled' && isAppointmentExpired(apt);
  });

  if (!expired.length) return appointments;

  var expiredIds = expired.map(function (a) { return a.id; });

  try {
    await supabase
      .from('appointments')
      .delete()
      .in('id', expiredIds)
      .eq('user_id', userId);
  } catch (e) {
    console.warn('Cleanup error:', e);
  }

  // Return only non-expired
  return appointments.filter(function (apt) {
    return !expiredIds.includes(apt.id);
  });
}
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

  if (!list) return;

  var user = (typeof getCurrentUser === 'function') ? await getCurrentUser() : null;
  if (!user) return;

  var appointments = [];
  try {
    console.log('Fetching appointments for user:', user.id);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('Appointments data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  } catch (e) {
    console.error(e);
  }

  // Auto-delete expired appointments then re-render with clean list
  appointments = await cleanupExpiredAppointments(user.id, appointments);

  if (!appointments.length) {
    if (empty) empty.style.display = 'block';
    list.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  list.style.display = 'grid';

  var currentLang = localStorage.getItem('siteLang') || 'ar';
  var isAr = currentLang === 'ar';

  var statusAr = { pending: 'قيد المراجعة', confirmed: 'مؤكد', cancelled: 'ملغى' };
  var statusFr = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };
  var statusColor = { pending: '#F59E0B', confirmed: '#10B981', cancelled: '#EF4444' };

  var appointmentsHtml = '';

  appointments.forEach(function (apt, index) {
    try {
      var s = apt.status || 'pending';
      var sTxt = isAr ? (statusAr[s] || 'قيد المراجعة') : (statusFr[s] || 'En attente');
      var sCol = statusColor[s] || '#64748B';
      var service = apt.service || apt.service_type || apt.treatment || (isAr ? 'فحص عام' : 'Consultation');
      var date = apt.preferred_date || apt.appointment_date || apt.date || '-';
      var time = apt.preferred_time || apt.appointment_time || apt.time || '';
      var ref = apt.reference_id || '-';
      var name = apt.full_name || apt.patient_name || apt.name || '-';
      var isCancelled = s === 'cancelled';

      var lblDate = isAr ? 'التاريخ:' : 'Date :';
      var lblRef = isAr ? 'الرقم المرجعي:' : 'Réf :';
      var lblName = isAr ? 'باسم:' : 'Nom :';
      var btnCancel = isAr ? 'إلغاء 🗑️' : 'Annuler 🗑️';

      appointmentsHtml +=
        '<div class="appointment-item" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">' +
        '<div style="display: flex; align-items: center; gap: 20px; flex: 1; flex-direction: row-reverse;">' +
        '<div style="width: 60px; height: 60px; background: rgba(13,242,242,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🦷</div>' +
        '<div style="text-align: right;">' +
        '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-direction: row-reverse;">' +
        '<span style="font-weight: 700; font-size: 1.1rem; color: #ffffff;">' + service + '</span>' +
        '<span style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; color: white; background-color: ' + sCol + ';">' + sTxt + '</span>' +
        '</div>' +
        '<div style="font-size: 0.9rem; color: rgba(255,255,255,0.6); display: flex; gap: 15px; flex-direction: row-reverse;">' +
        '<span><strong style="color: rgba(255,255,255,0.9);">' + lblDate + '</strong> ' + date + ' ' + time + '</span>' +
        '<span><strong style="color: rgba(255,255,255,0.9);">' + lblRef + '</strong> ' + ref + '</span>' +
        '</div>' +
        '<div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 4px;">' +
        '<span><strong style="color: rgba(255,255,255,0.9);">' + lblName + '</strong> ' + name + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 10px; margin-right: 20px;">' +
        '<button class="btn-ghost" onclick="cancelAppointment(\'' + ref + '\')" ' +
        'style="padding: 8px 16px; font-size: 0.85rem; color: #EF4444; border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; cursor: pointer; background: transparent;' + (isCancelled ? ' opacity: 0.4;' : '') + '"' +
        (isCancelled ? ' disabled' : '') + '>' + btnCancel + '</button>' +
        '</div>' +
        '</div>';

      console.log('Built HTML for apt ' + (index + 1));
    } catch (e) {
      console.error('Error building HTML for apt:', e);
    }
  });

  // Single innerHTML assignment — renders all cards at once
  list.innerHTML = appointmentsHtml;
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
