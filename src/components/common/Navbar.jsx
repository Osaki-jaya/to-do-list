import React, { useState } from 'react'
import {
  Calendar,
  LayoutDashboard,
  History,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Menu,
  X,
  HelpCircle,
  KeyRound,
  Edit3,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AdminPinModal from './AdminPinModal'
import NameModal from './NameModal'

export default function Navbar({ activeTab, setActiveTab, onOpenConfigGuide }) {
  const { memberName, isAdmin, exitAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [nameModalOpen, setNameModalOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Daftar Event', icon: Calendar },
    { id: 'logs', label: 'Riwayat Aktivitas', icon: History },
  ]

  const handleNavClick = (tabId) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Brand OSIS */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-100">
                <span className="font-extrabold text-lg tracking-tight">OS</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                    OSIS Event To-Do
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Logistik & Kebutuhan Acara</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            {/* User Profile & Admin Toggle */}
            <div className="hidden md:flex items-center gap-3">
              {/* Nama Pengurus (bisa diubah dengan klik) */}
              <button
                onClick={() => setNameModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition font-medium"
                title="Klik untuk mengubah nama Anda"
              >
                <span>{memberName}</span>
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="h-5 w-px bg-slate-200" />

              {/* Status & Tombol Mode Admin */}
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Mode Admin Aktif
                  </span>
                  <button
                    onClick={exitAdmin}
                    className="text-xs text-slate-500 hover:text-red-600 font-semibold underline px-1"
                    title="Keluar dari mode admin"
                  >
                    Keluar Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPinModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
                  title="Masuk sebagai Admin untuk menghapus event atau mengatur sistem"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Masuk Admin
                </button>
              )}

              <button
                onClick={onOpenConfigGuide}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                title="Panduan Database Supabase"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setNameModalOpen(true)
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <span>{memberName}</span>
                <Edit3 className="w-3 h-3 text-slate-400" />
              </button>

              {isAdmin ? (
                <button
                  onClick={exitAdmin}
                  className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg"
                >
                  Keluar Admin
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setPinModalOpen(true)
                  }}
                  className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> Masuk Admin
                </button>
              )}
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AdminPinModal isOpen={pinModalOpen} onClose={() => setPinModalOpen(false)} />
      <NameModal isOpen={nameModalOpen} onClose={() => setNameModalOpen(false)} />
    </>
  )
}
