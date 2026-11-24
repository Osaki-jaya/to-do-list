import React, { useState } from 'react'
import { History, Search, Filter, Clock, User, Sparkles } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'

export default function ActivityLogView({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('Semua')

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase()
    const matchText =
      (log.keterangan || '').toLowerCase().includes(q) ||
      (log.user_name || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q)

    const matchAction =
      filterAction === 'Semua' ||
      (filterAction === 'EVENT' && log.action.includes('EVENT')) ||
      (filterAction === 'ITEM' && log.action.includes('ITEM')) ||
      (filterAction === 'KATEGORI' && log.action.includes('KATEGORI'))

    return matchText && matchAction
  })

  // Format badge warna berdasarkan jenis aksi
  const getActionBadge = (action) => {
    if (action.includes('TAMBAH')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    } else if (action.includes('HAPUS')) {
      return 'bg-rose-100 text-rose-800 border-rose-200'
    } else if (action.includes('CENTANG') || action.includes('SELESAI')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    } else {
      return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <History className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Audit Trail
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Riwayat Aktivitas Kepanitiaan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mencatat setiap penambahan, perubahan, dan penyelesaian kebutuhan event secara transparan.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari aktivitas..."
              className="pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-hidden"
          >
            <option value="Semua">Semua Aksi</option>
            <option value="EVENT">Event Saja</option>
            <option value="ITEM">Kebutuhan Saja</option>
            <option value="KATEGORI">Kategori Saja</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Belum ada catatan aktivitas yang tercatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 shrink-0 ring-4 ring-indigo-50" />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{log.user_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{log.keterangan}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
