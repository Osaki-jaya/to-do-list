import React, { useState } from 'react'
import { Users, ShieldCheck, UserCheck, Search, Shield, AlertCircle } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'

export default function UserManagement({
  users,
  onUpdateRole,
  isLoading = false,
}) {
  const { profile: currentProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase()
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Khusus Admin OSIS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Pengurus & Hak Akses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ubah role pengurus (Admin atau Anggota). Keamanan dilindungi oleh Row Level Security Supabase.
          </p>
        </div>

        {/* Search user */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau email pengurus..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Kebijakan Hak Akses OSIS:</strong> Pengurus dengan role <strong>Admin</strong> memiliki hak penuh termasuk menghapus event, kategori, dan item kebutuhan. Pengurus dengan role <strong>Anggota</strong> dapat menambah dan memperbarui item/kebutuhan (termasuk mencentang selesai), namun tidak dapat menghapus data demi keamanan kepanitiaan.
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">Nama Pengurus</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role Saat Ini</th>
                <th className="px-6 py-4">Bergabung</th>
                <th className="px-6 py-4 text-right">Ubah Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada pengurus yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentProfile?.id
                  const isAdminRole = u.role === 'admin'

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{u.full_name || 'Pengurus OSIS'}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isAdminRole
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isAdminRole ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          {isAdminRole ? 'Admin' : 'Anggota'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(u.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <select
                          disabled={isLoading || isSelf}
                          value={u.role}
                          onChange={(e) => onUpdateRole(u.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                            isSelf
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20'
                          }`}
                        >
                          <option value="anggota">Anggota</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
