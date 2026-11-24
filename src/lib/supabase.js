import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
)

// Inisialisasi Supabase client dengan fallback aman jika belum dikonfigurasi
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/**
 * Helper untuk mencatat log aktivitas ke tabel `activity_log`.
 * Menyimpan informasi siapa, melakukan apa, pada entitas mana.
 */
export async function logActivity({
  action,
  entity_type,
  entity_id = null,
  event_id = null,
  keterangan,
  user = null,
}) {
  if (!supabase || !isSupabaseConfigured) {
    console.log('[Activity Log Mock]', { action, entity_type, keterangan })
    return { data: null, error: null }
  }

  try {
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengurus OSIS'
    const { data, error } = await supabase.from('activity_log').insert({
      user_id: user?.id || null,
      user_name: userName,
      action,
      entity_type,
      entity_id,
      event_id,
      keterangan,
    })

    if (error) {
      console.warn('Gagal mencatat log aktivitas:', error.message)
    }
    return { data, error }
  } catch (err) {
    console.warn('Kesalahan saat logging aktivitas:', err)
    return { data: null, error: err }
  }
}
