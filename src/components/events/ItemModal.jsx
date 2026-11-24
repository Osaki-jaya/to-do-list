import React, { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, User, Link as LinkIcon, Palette, FileText, Package, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  activeCategoryId = '',
  item = null,
  isLoading = false,
}) {
  const { memberName } = useAuth()
  const [categoryId, setCategoryId] = useState('')
  const [namaKebutuhan, setNamaKebutuhan] = useState('')
  const [tipeKebutuhan, setTipeKebutuhan] = useState('Desain/Kreatif')
  const [linkFile, setLinkFile] = useState('')
  const [jumlah, setJumlah] = useState('1')
  const [estimasiBiaya, setEstimasiBiaya] = useState('0')
  const [penanggungJawab, setPenanggungJawab] = useState('')
  const [deadline, setDeadline] = useState('')
  const [prioritas, setPrioritas] = useState('Sedang')
  const [catatan, setCatatan] = useState('')
  const [status, setStatus] = useState('Belum')

  useEffect(() => {
    if (item) {
      setCategoryId(item.category_id || '')
      setNamaKebutuhan(item.nama_kebutuhan || '')
      setTipeKebutuhan(item.tipe_kebutuhan || 'Barang/Logistik')
      setLinkFile(item.link_file || '')
      setJumlah(item.jumlah || '1')
      setEstimasiBiaya(item.estimasi_biaya !== undefined ? String(item.estimasi_biaya) : '0')
      setPenanggungJawab(item.penanggung_jawab || '')
      setDeadline(item.deadline || '')
      setPrioritas(item.prioritas || 'Sedang')
      setCatatan(item.catatan || '')
      setStatus(item.status || 'Belum')
    } else {
      setCategoryId(activeCategoryId || (categories[0]?.id || ''))
      setNamaKebutuhan('')
      setTipeKebutuhan('Desain/Kreatif')
      setLinkFile('')
      setJumlah('1 File/Set')
      setEstimasiBiaya('0')
      setPenanggungJawab(memberName || '')
      setDeadline('')
      setPrioritas('Sedang')
      setCatatan('')
      setStatus('Belum')
    }
  }, [item, activeCategoryId, categories, isOpen, memberName])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...(item ? { id: item.id } : {}),
      category_id: categoryId,
      nama_kebutuhan: namaKebutuhan,
      tipe_kebutuhan: tipeKebutuhan,
      link_file: linkFile.trim(),
      jumlah: jumlah || '1',
      estimasi_biaya: parseFloat(estimasiBiaya) || 0,
      penanggung_jawab: penanggungJawab,
      deadline: deadline || null,
      prioritas,
      catatan,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {item ? 'Edit Kebutuhan / Garapan' : 'Tambah Kebutuhan / Desain / Tugas'}
            </h2>
            <p className="text-xs text-slate-500">
              Catat file desain, berkas dokumen, rundown, maupun barang logistik yang perlu digarap
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Tipe Kebutuhan Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Jenis Kebutuhan *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipeKebutuhan('Desain/Kreatif')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  tipeKebutuhan === 'Desain/Kreatif'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-600" /> Desain & File
              </button>
              <button
                type="button"
                onClick={() => setTipeKebutuhan('Dokumen/Surat')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  tipeKebutuhan === 'Dokumen/Surat'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Dokumen/Surat
              </button>
              <button
                type="button"
                onClick={() => setTipeKebutuhan('Barang/Logistik')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  tipeKebutuhan === 'Barang/Logistik'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-600" /> Logistik/Barang
              </button>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Kategori Kebutuhan *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Kebutuhan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nama Kebutuhan / Desain / Tugas *
            </label>
            <input
              type="text"
              required
              value={namaKebutuhan}
              onChange={(e) => setNamaKebutuhan(e.target.value)}
              placeholder={
                tipeKebutuhan === 'Desain/Kreatif'
                  ? 'Contoh: Desain Banner Panggung 8x4m & Feed Instagram'
                  : tipeKebutuhan === 'Dokumen/Surat'
                  ? 'Contoh: Surat Dispensasi Guru & Rundown Acara Final'
                  : 'Contoh: Sound System 5000W & 4 Mic Wireless'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Tautan File / Desain (Google Drive / Canva / Figma / Docs) */}
          <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" /> Link File / Canva / Drive / Figma (Opsional)
            </label>
            <input
              type="url"
              value={linkFile}
              onChange={(e) => setLinkFile(e.target.value)}
              placeholder="https://canva.com/... atau https://drive.google.com/..."
              className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <p className="text-[11px] text-indigo-700/80">
              Tempelkan link folder Google Drive, draf Canva, atau Figma agar panitia lain bisa langsung membuka dan menggarapnya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jumlah */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Jumlah / Volume *
              </label>
              <input
                type="text"
                required
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Contoh: 1 Desain, 3 Lembar, 1 Set"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Estimasi Biaya (Opsional, boleh 0) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Biaya / Cetak (Rp) <span className="text-slate-400 font-normal lowercase">(0 jika gratis)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={estimasiBiaya}
                onChange={(e) => setEstimasiBiaya(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Penanggung Jawab */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Penanggung Jawab (PJ) *
              </label>
              <input
                type="text"
                required
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                placeholder="Contoh: Adit (Sie Publikasi)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tenggat Waktu Selesai (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prioritas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Prioritas
              </label>
              <select
                value={prioritas}
                onChange={(e) => setPrioritas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition"
              >
                <option value="Tinggi">Tinggi (Krusial / Perlu Cepat)</option>
                <option value="Sedang">Sedang (Standar)</option>
                <option value="Rendah">Rendah (Opsional)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Status Pengerjaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition"
              >
                <option value="Belum">Belum Dikerjakan</option>
                <option value="Proses">Sedang Digarap / Draf</option>
                <option value="Selesai">Selesai / Siap Digunakan</option>
              </select>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Instruksi / Catatan Ukuran / Spesifikasi
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Ukuran 1080x1350px (IG Carousel), tema warna biru-emas, logo sekolah di pojok kiri atas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2"
            >
              {isLoading ? 'Menyimpan...' : item ? 'Simpan Perubahan' : 'Tambah Kebutuhan / Desain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
