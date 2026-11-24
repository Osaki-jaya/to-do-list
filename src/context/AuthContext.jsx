import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const DEFAULT_ADMIN_PIN = '1234'

export function AuthProvider({ children }) {
  // Nama pengurus aktif (disimpan di browser pengurus)
  const [memberName, setMemberName] = useState(() => {
    return localStorage.getItem('osis_member_name') || 'Pengurus OSIS'
  })

  // Status Role: Admin atau Anggota
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('osis_is_admin') === 'true'
  })

  const [loading, setLoading] = useState(false)

  // Ubah nama pengurus
  const updateMemberName = (name) => {
    const clean = name.trim() || 'Pengurus OSIS'
    setMemberName(clean)
    localStorage.setItem('osis_member_name', clean)
  }

  // Masuk mode admin dengan PIN
  const unlockAdmin = (pin) => {
    if (pin === DEFAULT_ADMIN_PIN || pin === 'admin') {
      setIsAdmin(true)
      localStorage.setItem('osis_is_admin', 'true')
      return { success: true }
    }
    return { success: false, message: 'PIN Admin salah! (Default PIN: 1234)' }
  }

  // Keluar dari mode admin (kembali jadi anggota biasa)
  const exitAdmin = () => {
    setIsAdmin(false)
    localStorage.removeItem('osis_is_admin')
  }

  // User object sintetis untuk kompatibilitas
  const user = {
    id: 'user-' + (memberName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'pengurus'),
    email: `${memberName.toLowerCase().replace(/\s+/g, '.')}@osis.sekolah`,
    user_metadata: { full_name: memberName },
  }

  const profile = {
    id: user.id,
    full_name: memberName,
    role: isAdmin ? 'admin' : 'anggota',
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        memberName,
        updateMemberName,
        isAdmin,
        unlockAdmin,
        exitAdmin,
        loading,
        DEFAULT_ADMIN_PIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
