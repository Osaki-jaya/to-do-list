/**
 * Format angka ke format mata uang Rupiah (IDR)
 * Contoh: 3500000 -> "Rp 3.500.000"
 */
export function formatRupiah(amount) {
  const numeric = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric)
}

/**
 * Format tanggal ke format bahasa Indonesia
 * Contoh: "2026-11-28" -> "28 November 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Format tanggal dan jam ke bahasa Indonesia
 * Contoh: "28 Nov 2026, 14:30 WIB"
 */
export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '-'
  try {
    const date = new Date(dateTimeString)
    if (isNaN(date.getTime())) return dateTimeString
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date) + ' WIB'
  } catch {
    return dateTimeString
  }
}

/**
 * Cek status deadline (lewat, hari ini, mendekati <= 3 hari, atau aman)
 */
export function getDeadlineStatus(deadlineString, itemStatus) {
  if (!deadlineString || itemStatus === 'Selesai') {
    return { status: 'safe', label: 'Selesai / Tanpa Deadline', days: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadline = new Date(deadlineString)
  deadline.setHours(0, 0, 0, 0)

  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      status: 'overdue',
      label: `Terlewat ${Math.abs(diffDays)} hari`,
      days: diffDays,
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    }
  } else if (diffDays === 0) {
    return {
      status: 'today',
      label: 'Hari ini!',
      days: 0,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    }
  } else if (diffDays <= 3) {
    return {
      status: 'urgent',
      label: `${diffDays} hari lagi`,
      days: diffDays,
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
    }
  } else {
    return {
      status: 'upcoming',
      label: `${diffDays} hari lagi`,
      days: diffDays,
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
    }
  }
}
