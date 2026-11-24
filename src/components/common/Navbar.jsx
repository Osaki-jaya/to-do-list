import React, { useState } from 'react'
import {
  Calendar,
  LayoutDashboard,
  History,
  ShieldCheck,
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
    { id: 'logs', label: 'Riwayat', icon: History },
  ]

  const handleNavClick = (tabId) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo Brand OSIS */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-100">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight">OS</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                    OSIS Event
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Logistik & File Acara
                </p>
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

            {/* Right Controls: Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setNameModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition font-medium"
                title="Klik untuk mengubah nama Anda"
              >
                <span className="max-w-[120px] truncate">{memberName}</span>
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="h-5 w-px bg-slate-200" />

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Aktif
                  </span>
                  <button
                    onClick={exitAdmin}
                    className="text-xs text-slate-500 hover:text-red-600 font-semibold underline px-1"
                  >
                    Keluar Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPinModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
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

            {/* Right Controls: Mobile Header Quick Bar */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setNameModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg max-w-[110px] truncate"
              >
                <span className="truncate">{memberName}</span>
                <Edit3 className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isAdmin ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  Admin
                </span>
              ) : (
                <button
                  onClick={() => setPinModalOpen(true)}
                  className="p-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200"
                  title="Masuk Mode Admin"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="text-slate-500 font-medium">Status Pengurus:</span>
              {isAdmin ? (
                <button
                  onClick={() => {
                    exitAdmin()
                    setMobileMenuOpen(false)
                  }}
                  className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg"
                >
                  Keluar dari Mode Admin
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setPinModalOpen(true)
                  }}
                  className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> Buka Akses Admin (PIN)
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenConfigGuide()
              }}
              className="w-full text-left py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" /> Panduan Database Supabase
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Ala Aplikasi HP Native)                      */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex-1 py-1 px-2 flex flex-col items-center justify-center gap-0.5 transition active:scale-90 ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Modals */}
      <AdminPinModal isOpen={pinModalOpen} onClose={() => setPinModalOpen(false)} />
      <NameModal isOpen={nameModalOpen} onClose={() => setNameModalOpen(false)} />
    </>
  )
}
