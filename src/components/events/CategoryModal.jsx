import React, { useState, useEffect } from 'react'
import { X, Tag } from 'lucide-react'

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category = null,
  isLoading = false,
}) {
  const [nama, setNama] = useState('')

  useEffect(() => {
    if (category) {
      setNama(category.nama || '')
    } else {
      setNama('')
    }
  }, [category, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nama.trim()) return
    onSave({
      ...(category ? { id: category.id } : {}),
      nama: nama.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              {category ? 'Ubah Nama Kategori' : 'Tambah Kategori Kebutuhan'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nama Kategori *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Transportasi, Dekorasi, Hadiah Lomba"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
            >
              {isLoading ? 'Menyimpan...' : category ? 'Simpan' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
