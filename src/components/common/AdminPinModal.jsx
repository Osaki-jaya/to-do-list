import React, { useState } from 'react'
import { ShieldCheck, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminPinModal({ isOpen, onClose, onSuccess }) {
  const { unlockAdmin, DEFAULT_ADMIN_PIN } = useAuth()
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    const res = unlockAdmin(pin)
    if (res.success) {
      setPin('')
      if (onSuccess) onSuccess()
      onClose()
    } else {
      setErrorMsg(res.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden animate-fade-in">
        <div className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Masuk Mode Admin</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Masukkan PIN Admin untuk membuka hak akses menghapus event dan mengatur sistem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              PIN Admin (Default: {DEFAULT_ADMIN_PIN})
            </label>
            <input
              type="password"
              autoFocus
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN..."
              className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Buka Akses
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
