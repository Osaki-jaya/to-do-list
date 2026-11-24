import React from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Banknote,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
} from 'lucide-react'
import { formatRupiah, formatDate, getDeadlineStatus } from '../../utils/formatters'

export default function DashboardView({
  events,
  categories,
  items,
  onSelectEvent,
  onAddEvent,
  onToggleItemStatus,
}) {
  // Hitung total-total global
  const totalEvents = events.length
  const totalItems = items.length
  const completedItems = items.filter((i) => i.status === 'Selesai').length
  const inProgressItems = items.filter((i) => i.status === 'Proses').length
  const pendingItems = items.filter((i) => i.status === 'Belum').length
  const totalBudget = items.reduce((sum, item) => sum + (Number(item.estimasi_biaya) || 0), 0)
  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Cari item-item yang mendekati atau melewati deadline
  const urgentItems = items
    .filter((item) => item.status !== 'Selesai' && item.deadline)
    .map((item) => {
      const deadlineInfo = getDeadlineStatus(item.deadline, item.status)
      const ev = events.find((e) => e.id === item.event_id)
      return {
        ...item,
        deadlineInfo,
        eventName: ev?.nama || 'Event OSIS',
      }
    })
    .filter((item) => item.deadlineInfo.status === 'overdue' || item.deadlineInfo.status === 'today' || item.deadlineInfo.status === 'urgent')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Portal Kerja Pengurus OSIS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Pantau Kebutuhan & Logistik Setiap Acara Sekolah
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            Pastikan perlengkapan, konsumsi, perizinan, dan anggaran siap sebelum hari-H.
            Semua perubahan tersinkronisasi otomatis dengan seluruh panitia.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onAddEvent}
              className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 font-bold text-sm rounded-xl shadow-md transition"
            >
              + Buat Event Baru
            </button>
          </div>
        </div>
      </div>

      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Event */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Event
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalEvents}</span>
            <span className="text-xs text-slate-500 font-medium">acara aktif</span>
          </div>
        </div>

        {/* Total Kebutuhan (Items) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Kebutuhan
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalItems}</span>
            <span className="text-xs text-slate-500 font-medium">item to-do</span>
          </div>
        </div>

        {/* Progress Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Item Selesai
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900">{completedItems}</span>
              <span className="text-xs text-slate-400 font-medium">/{totalItems} item</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              {overallPercent}%
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Total Estimasi Anggaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimasi Anggaran
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
              {formatRupiah(totalBudget)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">total seluruh event</span>
          </div>
        </div>
      </div>

      {/* Bagian Alert: Mendekati / Melewati Deadline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Perhatian: Kebutuhan Mendesak</h2>
              <p className="text-xs text-slate-500">
                Item to-do yang mendekati (&le; 3 hari) atau telah melewati deadline
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
            {urgentItems.length} Perlu Tindakan
          </span>
        </div>

        {urgentItems.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Semua deadline terkendali!</p>
            <p className="text-xs text-slate-500">Tidak ada item yang terlewat atau mendesak saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.deadlineInfo.badgeColor}`}
                    >
                      {item.deadlineInfo.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.prioritas === 'Tinggi'
                          ? 'bg-red-50 text-red-700'
                          : item.prioritas === 'Sedang'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.prioritas}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {item.nama_kebutuhan}
                  </h3>
                  <div className="text-xs text-indigo-600 font-semibold mt-1">
                    {item.eventName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    PJ: <span className="font-medium text-slate-700">{item.penanggung_jawab}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {formatRupiah(item.estimasi_biaya)}
                  </span>
                  <button
                    onClick={() => onToggleItemStatus(item)}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                  >
                    Tandai Selesai
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ringkasan Acara yang Sedang Berjalan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Progres Event OSIS</h2>
          <span className="text-xs text-slate-500 font-medium">Klik untuk melihat detail kebutuhan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const evItems = items.filter((i) => i.event_id === event.id)
            const evCompleted = evItems.filter((i) => i.status === 'Selesai').length
            const evTotal = evItems.length
            const evPercent = evTotal > 0 ? Math.round((evCompleted / evTotal) * 100) : 0
            const evCost = evItems.reduce((acc, curr) => acc + (Number(curr.estimasi_biaya) || 0), 0)

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${
                        event.status === 'Berjalan'
                          ? 'bg-blue-100 text-blue-700'
                          : event.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {event.status}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {event.nama}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(event.tanggal)} &bull; {event.lokasi}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">
                      {evCompleted} dari {evTotal} kebutuhan siap
                    </span>
                    <span className="text-indigo-600 font-bold">{evPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${evPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>PJ: {event.penanggung_jawab}</span>
                  <span className="font-bold text-slate-800">{formatRupiah(evCost)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
