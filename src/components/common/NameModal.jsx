import React, { useState } from 'react'
import { User, X, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function NameModal({ isOpen, onClose }) {
  const { memberName, updateMemberName } = useAuth()
  const [name, setName] = useState(memberName)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMemberName(name)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Atur Nama Anda</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nama Lengkap & Jabatan
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rian (Sie Perlengkapan)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Nama ini akan muncul pada keterangan kebutuhan yang Anda tambahkan/selesaikan.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
