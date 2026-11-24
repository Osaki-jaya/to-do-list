import React, { useState } from 'react'
import { LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal({ onOpenConfigGuide }) {
  const { signIn, signUp, isDemo } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setErrorMsg('Nama lengkap pengurus wajib diisi.')
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setErrorMsg(error.message)
        } else {
          setSuccessMsg(
            'Pendaftaran berhasil! Akun Anda aktif dengan role Anggota. Silakan masuk.'
          )
          setIsRegister(false)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setErrorMsg('Email atau password salah. Pastikan kredensial benar.')
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  // Tombol login instan untuk demonstrasi
  const handleDemoLogin = async (role) => {
    if (role === 'admin') {
      await signIn('admin.osis@sekolah.sch.id', 'password123')
    } else {
      await signIn('siti.anggota@sekolah.sch.id', 'password123')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
            OS
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            OSIS Event To-Do
          </h1>
          <p className="text-xs text-slate-500">
            Sistem Informasi Logistik & Kebutuhan Event Pengurus OSIS
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false)
              setErrorMsg('')
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegister
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true)
              setErrorMsg('')
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegister
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nama Lengkap & Jabatan
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Rian Hidayat (Sie Perlengkapan)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Pengurus
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@sekolah.sch.id"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Daftarkan Pengurus
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Aplikasi
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[11px] text-center text-slate-400 font-medium">
            Atau coba langsung tanpa daftar (Demo Mode):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition text-center"
            >
              Demo Admin OSIS
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('member')}
              className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition text-center"
            >
              Demo Anggota OSIS
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <button
            type="button"
            onClick={onOpenConfigGuide}
            className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" /> Panduan Menghubungkan Supabase
          </button>
        </div>
      </div>
    </div>
  )
}
