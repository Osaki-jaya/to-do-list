import React, { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Palette,
  Package,
  Layers,
  Banknote,
  FolderGit2,
  FolderOpen,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react'
import { formatRupiah, formatDate, getDeadlineStatus } from '../../utils/formatters'
import { exportToPDF, exportToCSV } from '../../utils/exporter'
import { useAuth } from '../../context/AuthContext'

export default function EventDetail({
  event,
  categories,
  items,
  onBack,
  onEditEvent,
  onDeleteEvent,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItemStatus,
}) {
  const { isAdmin } = useAuth()

  // Mode Tampilan Utama: 'files' (Pusat File & Desain) | 'budget' (Logistik & Biaya) | 'all' (Semua)
  const [viewMode, setViewMode] = useState('all')

  // State navigasi tab kategori: 'all' atau category.id
  const [activeCategoryId, setActiveCategoryId] = useState('all')

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [priorityFilter, setPriorityFilter] = useState('Semua')
  const [pjFilter, setPjFilter] = useState('Semua')

  // Kategori & Item milik event ini
  const eventCategories = categories.filter((c) => c.event_id === event.id)
  const eventItems = items.filter((i) => i.event_id === event.id)

  // Pemisahan Koleksi Data
  const fileItems = eventItems.filter(
    (i) => i.tipe_kebutuhan === 'Desain/Kreatif' || i.tipe_kebutuhan === 'Dokumen/Surat' || Boolean(i.link_file)
  )
  const budgetItems = eventItems.filter(
    (i) => i.tipe_kebutuhan === 'Barang/Logistik' || Number(i.estimasi_biaya) > 0 || !i.tipe_kebutuhan
  )

  // Data yang aktif berdasarkan viewMode
  const activeDataset =
    viewMode === 'files' ? fileItems : viewMode === 'budget' ? budgetItems : eventItems

  // List unique PJ untuk filter
  const uniquePJs = Array.from(new Set(activeDataset.map((i) => i.penanggung_jawab).filter(Boolean)))

  // Filter logic
  const filteredItems = activeDataset.filter((item) => {
    if (activeCategoryId !== 'all' && item.category_id !== activeCategoryId) {
      return false
    }
    if (statusFilter !== 'Semua' && item.status !== statusFilter) {
      return false
    }
    if (priorityFilter !== 'Semua' && item.prioritas !== priorityFilter) {
      return false
    }
    if (pjFilter !== 'Semua' && item.penanggung_jawab !== pjFilter) {
      return false
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchName = (item.nama_kebutuhan || '').toLowerCase().includes(q)
      const matchNotes = (item.catatan || '').toLowerCase().includes(q)
      const matchPJ = (item.penanggung_jawab || '').toLowerCase().includes(q)
      const matchLink = (item.link_file || '').toLowerCase().includes(q)
      if (!matchName && !matchNotes && !matchPJ && !matchLink) {
        return false
      }
    }

    return true
  })

  // Hitungan statistik
  const totalCount = eventItems.length
  const completedCount = eventItems.filter((i) => i.status === 'Selesai').length
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const totalCost = eventItems.reduce((acc, curr) => acc + (Number(curr.estimasi_biaya) || 0), 0)

  // Map category id ke nama
  const categoryMap = {}
  eventCategories.forEach((c) => {
    categoryMap[c.id] = c.nama
  })

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Tombol Kembali & Ekspor */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Event
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToPDF(event, eventCategories, eventItems)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition"
            title="Ekspor PDF siap cetak"
          >
            <FileText className="w-4 h-4 text-rose-500" /> Ekspor PDF
          </button>
          <button
            onClick={() => exportToCSV(event, eventCategories, eventItems)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition"
            title="Ekspor ke CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Ekspor CSV
          </button>
        </div>
      </div>

      {/* Header Info Event */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  event.status === 'Berjalan'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : event.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {event.status}
              </span>
              <span className="text-xs font-semibold text-slate-400">&bull;</span>
              <span className="text-xs font-medium text-slate-500">
                Pelaksanaan: <strong>{formatDate(event.tanggal)}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {event.nama}
            </h1>
            {event.deskripsi && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
                {event.deskripsi}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEditEvent(event)}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Event
            </button>
            {isAdmin && (
              <button
                onClick={() => onDeleteEvent(event)}
                className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition inline-flex items-center gap-1.5"
                title="Hapus Event (Khusus Mode Admin)"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Lokasi</span>
              <span className="font-semibold text-slate-800">{event.lokasi}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Penanggung Jawab</span>
              <span className="font-semibold text-slate-800">{event.penanggung_jawab}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Anggaran Event</span>
              <span className="font-extrabold text-emerald-700">{formatRupiah(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NAVIGASI PEMISAH: FILE/DESAIN vs LOGISTIK/BIAYA                           */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-1.5 rounded-2xl shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
          {/* Tab 1: Pusat File & Desain */}
          <button
            type="button"
            onClick={() => setViewMode('files')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'files'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-300" />
            <span>Pusat File & Desain Garapan</span>
            <span className="ml-1 text-[11px] px-2 py-0.2 rounded-full bg-purple-800 text-purple-100">
              {fileItems.length}
            </span>
          </button>

          {/* Tab 2: Kebutuhan Logistik & Biaya */}
          <button
            type="button"
            onClick={() => setViewMode('budget')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'budget'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-300" />
            <span>Logistik & Anggaran Biaya</span>
            <span className="ml-1 text-[11px] px-2 py-0.2 rounded-full bg-emerald-800 text-emerald-100">
              {budgetItems.length}
            </span>
          </button>

          {/* Tab 3: Tampilkan Semua */}
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Semua ({totalCount})</span>
          </button>
        </div>

        {/* Quick Add Button Sesuai Tab Aktif */}
        <button
          onClick={() => onAddItem(activeCategoryId !== 'all' ? activeCategoryId : (eventCategories[0]?.id || ''))}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md ${
            viewMode === 'files'
              ? 'bg-purple-500 hover:bg-purple-400 text-white'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          {viewMode === 'files'
            ? '+ Upload / Catat File Desain'
            : viewMode === 'budget'
            ? '+ Tambah Belanja / Logistik'
            : '+ Tambah Item'}
        </button>
      </div>

      {/* Summary Box Spesifik Sesuai Tab yang Dipilih */}
      {viewMode === 'files' ? (
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-200 text-purple-800 rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-purple-900">
                Pusat Dokumen, Draf Canva & Desain Digital
              </div>
              <p className="text-purple-700/90 text-xs">
                Khusus link Google Drive, draf Canva, aset spanduk, dan berkas surat. Bebas biaya uang.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <span className="px-3 py-1 bg-white rounded-lg border border-purple-200 text-purple-800 shadow-xs">
              {fileItems.filter((i) => i.status === 'Selesai').length} dari {fileItems.length} Siap Pakai
            </span>
          </div>
        </div>
      ) : viewMode === 'budget' ? (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-200 text-emerald-800 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-emerald-900">
                Kebutuhan Logistik, Perlengkapan Fisik & Anggaran Biaya
              </div>
              <p className="text-emerald-700/90 text-xs">
                Khusus belanja barang, sewa panggung, sound system, konsumsi, dan kas kepanitiaan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <span className="px-3 py-1 bg-white rounded-lg border border-emerald-200 text-emerald-800 shadow-xs">
              Total Dana: {formatRupiah(totalCost)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Navigasi Kategori (Tab Kategori) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeCategoryId === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Kategori ({activeDataset.length})
          </button>

          {eventCategories.map((cat) => {
            const count = activeDataset.filter((i) => i.category_id === cat.id).length
            const isSelected = activeCategoryId === cat.id
            return (
              <div key={cat.id} className="relative group inline-flex items-center">
                <button
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.nama}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {isSelected && (
                  <div className="flex items-center ml-1">
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                      title="Ubah Nama Kategori"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteCategory(cat)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                        title="Hapus Kategori (Mode Admin)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onAddCategory}
          className="shrink-0 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition inline-flex items-center gap-1 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" /> Kategori
        </button>
      </div>

      {/* Filter & Pencarian Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                viewMode === 'files'
                  ? 'Cari nama desain, link Canva/Drive, atau PJ...'
                  : 'Cari barang, vendor, estimasi biaya, atau PJ...'
              }
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <button
            onClick={() => onAddItem(activeCategoryId !== 'all' ? activeCategoryId : (eventCategories[0]?.id || ''))}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Baru
          </button>
        </div>

        {/* Multi-Filters: Status, Prioritas, PJ */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum">{viewMode === 'files' ? 'Belum Digarap' : 'Belum Diproses'}</option>
            <option value="Proses">{viewMode === 'files' ? 'Sedang Draf/Desain' : 'Sedang Proses'}</option>
            <option value="Selesai">{viewMode === 'files' ? 'Selesai / Siap Cetak' : 'Selesai Siap'}</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:bg-white"
          >
            <option value="Semua">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>

          <select
            value={pjFilter}
            onChange={(e) => setPjFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:bg-white"
          >
            <option value="Semua">Semua PJ</option>
            {uniquePJs.map((pj) => (
              <option key={pj} value={pj}>
                PJ: {pj}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'Semua' || priorityFilter !== 'Semua' || pjFilter !== 'Semua') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('Semua')
                setPriorityFilter('Semua')
                setPjFilter('Semua')
              }}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DAFTAR ITEM / KARTU ASSET                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
            {viewMode === 'files' ? (
              <FolderOpen className="w-10 h-10 text-purple-300 mx-auto" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            )}
            <h3 className="text-sm font-bold text-slate-800">
              {viewMode === 'files'
                ? 'Belum ada file garapan / desain di bagian ini'
                : 'Belum ada item belanja / logistik di bagian ini'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {viewMode === 'files'
                ? 'Klik tombol Tambah untuk menempelkan link Google Drive, Canva, atau berkas surat.'
                : 'Catat perlengkapan, konsumsi, atau sewa peralatan acara.'}
            </p>
            <button
              onClick={() => onAddItem(activeCategoryId !== 'all' ? activeCategoryId : (eventCategories[0]?.id || ''))}
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Baru
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = item.status === 'Selesai'
            const deadlineInfo = getDeadlineStatus(item.deadline, item.status)
            const isFileItem =
              item.tipe_kebutuhan === 'Desain/Kreatif' || item.tipe_kebutuhan === 'Dokumen/Surat' || Boolean(item.link_file)

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : isFileItem
                    ? 'border-purple-100 hover:border-purple-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Quick Check & Info */}
                <div className="flex items-start gap-3.5 flex-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onToggleItemStatus(item)}
                    className="mt-0.5 shrink-0 transition transform active:scale-90"
                    title={isCompleted ? 'Tandai belum selesai' : 'Centang selesai / siap'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-indigo-600" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge Jenis */}
                      {isFileItem ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-purple-600" /> File / Desain
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Package className="w-3 h-3 text-emerald-600" /> Logistik
                        </span>
                      )}

                      {/* Kategori */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {categoryMap[item.category_id] || 'Kategori'}
                      </span>

                      {/* Prioritas */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.prioritas === 'Tinggi'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : item.prioritas === 'Sedang'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Prioritas {item.prioritas}
                      </span>

                      {/* Status */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Proses'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status === 'Proses' ? 'Sedang Digarap' : item.status}
                      </span>

                      {/* Deadline */}
                      {item.deadline && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${deadlineInfo.badgeColor}`}
                        >
                          <Clock className="w-3 h-3" /> {formatDate(item.deadline)} ({deadlineInfo.label})
                        </span>
                      )}
                    </div>

                    {/* Nama Item & Link Button */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4
                        className={`text-sm sm:text-base font-bold leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.nama_kebutuhan}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {item.jumlah}
                      </span>

                      {/* Tombol Akses Langsung File / Canva / Drive */}
                      {item.link_file && (
                        <a
                          href={item.link_file.startsWith('http') ? item.link_file : `https://${item.link_file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-200 transition shadow-xs"
                          title="Buka Link File Canva / Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Buka File Garapan
                        </a>
                      )}
                    </div>

                    {/* Catatan / Panduan */}
                    {item.catatan && (
                      <p className="text-xs text-slate-500 italic leading-relaxed">
                        &ldquo;{item.catatan}&rdquo;
                      </p>
                    )}

                    {/* Metadata PJ, Biaya, Pembuat */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>
                        PJ: <strong className="text-slate-700 font-semibold">{item.penanggung_jawab}</strong>
                      </span>
                      <span>&bull;</span>
                      {Number(item.estimasi_biaya) > 0 ? (
                        <span>
                          Biaya: <strong className="text-emerald-700 font-bold">{formatRupiah(item.estimasi_biaya)}</strong>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Non-biaya</span>
                      )}
                      <span>&bull;</span>
                      <span className="text-slate-400">
                        Oleh: <span className="font-medium text-slate-600">{item.created_by_name || 'Pengurus OSIS'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Edit Item / Desain"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Item (Mode Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
