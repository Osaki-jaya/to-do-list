import React, { useState } from 'react'
import {
  Calendar,
  MapPin,
  User,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { formatRupiah, formatDate } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'

export default function EventList({
  events,
  items,
  onSelectEvent,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.penanggung_jawab.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'Semua' || ev.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls: Search, Filter, Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari event, lokasi, atau penanggung jawab..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="Semua">Semua Status</option>
              <option value="Perencanaan">Perencanaan</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Add Event Button */}
        <button
          onClick={onAddEvent}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Event Baru
        </button>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada event ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'Semua'
              ? 'Coba sesuaikan kata kunci pencarian atau ubah filter status.'
              : 'Belum ada agenda kegiatan yang ditambahkan. Mulai dengan membuat event baru!'}
          </p>
          <button
            onClick={onAddEvent}
            className="mt-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Buat Event Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const evItems = items.filter((i) => i.event_id === event.id)
            const completedCount = evItems.filter((i) => i.status === 'Selesai').length
            const totalCount = evItems.length
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
            const totalCost = evItems.reduce((acc, cur) => acc + (Number(cur.estimasi_biaya) || 0), 0)

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        event.status === 'Berjalan'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : event.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {event.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditEvent(event)
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Tombol Hapus HANYA untuk Admin */}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteEvent(event)
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Event (Khusus Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => onSelectEvent(event)}
                      className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition cursor-pointer leading-snug"
                    >
                      {event.nama}
                    </h3>
                    {event.deskripsi && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {event.deskripsi}
                      </p>
                    )}
                  </div>

                  {/* Details metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(event.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-700">
                        {event.penanggung_jawab}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (% Item Selesai) */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">
                        {completedCount} dari {totalCount} item selesai
                      </span>
                      <span className="text-indigo-600 font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Estimasi Biaya
                    </div>
                    <div className="text-xs font-extrabold text-slate-800">
                      {formatRupiah(totalCost)}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectEvent(event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition"
                  >
                    Buka Kebutuhan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
