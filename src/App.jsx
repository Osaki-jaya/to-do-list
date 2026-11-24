import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, logActivity } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import ConfirmModal from './components/common/ConfirmModal'
import ConfigModal from './components/common/ConfigModal'
import DashboardView from './components/dashboard/DashboardView'
import EventList from './components/events/EventList'
import EventDetail from './components/events/EventDetail'
import EventModal from './components/events/EventModal'
import CategoryModal from './components/events/CategoryModal'
import ItemModal from './components/events/ItemModal'
import ActivityLogView from './components/admin/ActivityLogView'
import {
  INITIAL_DEMO_EVENTS,
  INITIAL_DEMO_CATEGORIES,
  INITIAL_DEMO_ITEMS,
  INITIAL_DEMO_LOGS,
  INITIAL_DEFAULT_CATEGORIES,
} from './data/initialData'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function App() {
  const { memberName, isAdmin } = useAuth()

  // Navigation state: 'dashboard' | 'events' | 'logs'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Data states
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [logs, setLogs] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // Toast notification
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [eventModalState, setEventModalState] = useState({ isOpen: false, event: null })
  const [categoryModalState, setCategoryModalState] = useState({
    isOpen: false,
    category: null,
    eventId: null,
  })
  const [itemModalState, setItemModalState] = useState({
    isOpen: false,
    item: null,
    categoryId: null,
    eventId: null,
  })
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Hapus',
    onConfirm: null,
  })

  // Load Data
  const loadAllData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback jika Supabase belum disetup
      const savedEvents = localStorage.getItem('osis_events')
      const savedCats = localStorage.getItem('osis_categories')
      const savedItems = localStorage.getItem('osis_items')
      const savedLogs = localStorage.getItem('osis_logs')

      setEvents(savedEvents ? JSON.parse(savedEvents) : INITIAL_DEMO_EVENTS)
      setCategories(savedCats ? JSON.parse(savedCats) : INITIAL_DEMO_CATEGORIES)
      setItems(savedItems ? JSON.parse(savedItems) : INITIAL_DEMO_ITEMS)
      setLogs(savedLogs ? JSON.parse(savedLogs) : INITIAL_DEMO_LOGS)
      setLoadingData(false)
      return
    }

    try {
      setLoadingData(true)
      const [
        { data: evData, error: evErr },
        { data: catData, error: catErr },
        { data: itemData, error: itemErr },
        { data: logData, error: logErr },
      ] = await Promise.all([
        supabase.from('events').select('*').order('tanggal', { ascending: true }),
        supabase.from('categories').select('*').order('urutan', { ascending: true }),
        supabase.from('items').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100),
      ])

      if (evErr) console.warn('Fetch events error:', evErr.message)
      if (catErr) console.warn('Fetch categories error:', catErr.message)
      if (itemErr) console.warn('Fetch items error:', itemErr.message)

      if (evData) setEvents(evData)
      if (catData) setCategories(catData)
      if (itemData) setItems(itemData)
      if (logData) setLogs(logData)
    } catch (err) {
      console.error('Error fetching data from Supabase:', err)
      showToast('Gagal memuat data dari database', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // Realtime subscription setup
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return

    const channel = supabase
      .channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents((prev) => [...prev.filter((e) => e.id !== payload.new.id), payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setEvents((prev) => prev.map((e) => (e.id === payload.new.id ? payload.new : e)))
          setSelectedEvent((prev) => (prev?.id === payload.new.id ? payload.new : prev))
        } else if (payload.eventType === 'DELETE') {
          setEvents((prev) => prev.filter((e) => e.id !== payload.old.id))
          setSelectedEvent((prev) => (prev?.id === payload.old.id ? null : prev))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCategories((prev) => [...prev.filter((c) => c.id !== payload.new.id), payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setCategories((prev) => prev.map((c) => (c.id === payload.new.id ? payload.new : c)))
        } else if (payload.eventType === 'DELETE') {
          setCategories((prev) => prev.filter((c) => c.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setItems((prev) => [payload.new, ...prev.filter((i) => i.id !== payload.new.id)])
        } else if (payload.eventType === 'UPDATE') {
          setItems((prev) => prev.map((i) => (i.id === payload.new.id ? payload.new : i)))
        } else if (payload.eventType === 'DELETE') {
          setItems((prev) => prev.filter((i) => i.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLogs((prev) => [payload.new, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem('osis_events', JSON.stringify(events))
    localStorage.setItem('osis_categories', JSON.stringify(categories))
    localStorage.setItem('osis_items', JSON.stringify(items))
    localStorage.setItem('osis_logs', JSON.stringify(logs))
  }, [events, categories, items, logs])

  // Log activity helper
  const addLog = async (action, entity_type, entity_id, event_id, keterangan) => {
    const newLog = {
      id: 'log-' + Date.now(),
      user_name: memberName,
      action,
      entity_type,
      entity_id,
      event_id,
      keterangan,
      created_at: new Date().toISOString(),
    }

    setLogs((prev) => [newLog, ...prev])

    if (supabase && isSupabaseConfigured) {
      await logActivity({
        action,
        entity_type,
        entity_id,
        event_id,
        keterangan,
        user: { user_metadata: { full_name: memberName } },
      })
    }
  }

  // ==========================================
  // EVENT ACTIONS
  // ==========================================
  const handleSaveEvent = async (eventData) => {
    const isEdit = Boolean(eventData.id)

    if (!supabase || !isSupabaseConfigured) {
      if (isEdit) {
        setEvents((prev) => prev.map((e) => (e.id === eventData.id ? { ...e, ...eventData } : e)))
        if (selectedEvent?.id === eventData.id) {
          setSelectedEvent((prev) => ({ ...prev, ...eventData }))
        }
        addLog('UPDATE_EVENT', 'event', eventData.id, eventData.id, `${memberName} memperbarui info event "${eventData.nama}"`)
        showToast('Event berhasil diperbarui!')
      } else {
        const newId = 'evt-' + Date.now()
        const newEvent = { ...eventData, id: newId, created_at: new Date().toISOString() }
        setEvents((prev) => [newEvent, ...prev])

        const newCats = INITIAL_DEFAULT_CATEGORIES.map((catName, idx) => ({
          id: `cat-${newId}-${idx + 1}`,
          event_id: newId,
          nama: catName,
          urutan: idx + 1,
        }))
        setCategories((prev) => [...prev, ...newCats])

        addLog('TAMBAH_EVENT', 'event', newId, newId, `${memberName} membuat event baru "${eventData.nama}"`)
        showToast('Event baru dan 8 kategori default berhasil dibuat!')
      }
      setEventModalState({ isOpen: false, event: null })
      return
    }

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('events')
          .update({
            nama: eventData.nama,
            tanggal: eventData.tanggal,
            lokasi: eventData.lokasi,
            penanggung_jawab: eventData.penanggung_jawab,
            deskripsi: eventData.deskripsi,
            status: eventData.status,
          })
          .eq('id', eventData.id)

        if (error) throw error
        addLog('UPDATE_EVENT', 'event', eventData.id, eventData.id, `${memberName} memperbarui event "${eventData.nama}"`)
        showToast('Event berhasil diperbarui!')
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert({
            nama: eventData.nama,
            tanggal: eventData.tanggal,
            lokasi: eventData.lokasi,
            penanggung_jawab: eventData.penanggung_jawab,
            deskripsi: eventData.deskripsi,
            status: eventData.status,
          })
          .select()
          .single()

        if (error) throw error
        addLog('TAMBAH_EVENT', 'event', data.id, data.id, `${memberName} membuat event baru "${eventData.nama}"`)
        showToast('Event baru & 8 kategori berhasil dibuat!')
        setTimeout(() => loadAllData(), 500)
      }
      setEventModalState({ isOpen: false, event: null })
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan event', 'error')
    }
  }

  const handleDeleteEvent = (event) => {
    if (!isAdmin) {
      showToast('Hanya Admin yang dapat menghapus event. Masuk Mode Admin terlebih dahulu!', 'error')
      return
    }

    setConfirmModalState({
      isOpen: true,
      title: `Hapus Event "${event.nama}"?`,
      message: `Tindakan ini akan menghapus event dan seluruh daftar kebutuhan di dalamnya secara permanen.`,
      confirmText: 'Ya, Hapus Event',
      onConfirm: async () => {
        if (!supabase || !isSupabaseConfigured) {
          setEvents((prev) => prev.filter((e) => e.id !== event.id))
          setCategories((prev) => prev.filter((c) => c.event_id !== event.id))
          setItems((prev) => prev.filter((i) => i.event_id !== event.id))
          if (selectedEvent?.id === event.id) setSelectedEvent(null)
          addLog('HAPUS_EVENT', 'event', event.id, event.id, `${memberName} menghapus event "${event.nama}"`)
          showToast('Event berhasil dihapus.')
          setConfirmModalState({ isOpen: false })
          return
        }

        try {
          const { error } = await supabase.from('events').delete().eq('id', event.id)
          if (error) throw error
          addLog('HAPUS_EVENT', 'event', event.id, event.id, `${memberName} menghapus event "${event.nama}"`)
          showToast('Event berhasil dihapus.')
          if (selectedEvent?.id === event.id) setSelectedEvent(null)
        } catch (err) {
          showToast(err.message || 'Gagal menghapus event', 'error')
        } finally {
          setConfirmModalState({ isOpen: false })
        }
      },
    })
  }

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================
  const handleSaveCategory = async (categoryData) => {
    const isEdit = Boolean(categoryData.id)
    const eventId = selectedEvent?.id || categoryModalState.eventId

    if (!supabase || !isSupabaseConfigured) {
      if (isEdit) {
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryData.id ? { ...c, nama: categoryData.nama } : c))
        )
        addLog('UPDATE_KATEGORI', 'category', categoryData.id, eventId, `${memberName} mengubah nama kategori jadi "${categoryData.nama}"`)
        showToast('Kategori berhasil diubah!')
      } else {
        const newCat = {
          id: 'cat-' + Date.now(),
          event_id: eventId,
          nama: categoryData.nama,
          urutan: categories.filter((c) => c.event_id === eventId).length + 1,
        }
        setCategories((prev) => [...prev, newCat])
        addLog('TAMBAH_KATEGORI', 'category', newCat.id, eventId, `${memberName} menambah kategori "${categoryData.nama}"`)
        showToast('Kategori baru ditambahkan!')
      }
      setCategoryModalState({ isOpen: false, category: null, eventId: null })
      return
    }

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('categories')
          .update({ nama: categoryData.nama })
          .eq('id', categoryData.id)
        if (error) throw error
        addLog('UPDATE_KATEGORI', 'category', categoryData.id, eventId, `${memberName} mengubah kategori jadi "${categoryData.nama}"`)
      } else {
        const { error } = await supabase.from('categories').insert({
          event_id: eventId,
          nama: categoryData.nama,
          urutan: categories.filter((c) => c.event_id === eventId).length + 1,
        })
        if (error) throw error
        addLog('TAMBAH_KATEGORI', 'category', null, eventId, `${memberName} menambah kategori "${categoryData.nama}"`)
      }
      showToast('Kategori berhasil disimpan!')
      setCategoryModalState({ isOpen: false, category: null, eventId: null })
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan kategori', 'error')
    }
  }

  const handleDeleteCategory = (category) => {
    if (!isAdmin) {
      showToast('Hanya Admin yang dapat menghapus kategori!', 'error')
      return
    }

    setConfirmModalState({
      isOpen: true,
      title: `Hapus Kategori "${category.nama}"?`,
      message: `Semua item kebutuhan di dalam kategori ini akan ikut terhapus. Lanjutkan?`,
      confirmText: 'Ya, Hapus Kategori',
      onConfirm: async () => {
        if (!supabase || !isSupabaseConfigured) {
          setCategories((prev) => prev.filter((c) => c.id !== category.id))
          setItems((prev) => prev.filter((i) => i.category_id !== category.id))
          addLog('HAPUS_KATEGORI', 'category', category.id, category.event_id, `${memberName} menghapus kategori "${category.nama}"`)
          showToast('Kategori berhasil dihapus.')
          setConfirmModalState({ isOpen: false })
          return
        }

        try {
          const { error } = await supabase.from('categories').delete().eq('id', category.id)
          if (error) throw error
          addLog('HAPUS_KATEGORI', 'category', category.id, category.event_id, `${memberName} menghapus kategori "${category.nama}"`)
          showToast('Kategori berhasil dihapus.')
        } catch (err) {
          showToast(err.message || 'Gagal menghapus kategori', 'error')
        } finally {
          setConfirmModalState({ isOpen: false })
        }
      },
    })
  }

  // ==========================================
  // ITEM (TO-DO) ACTIONS
  // ==========================================
  const handleSaveItem = async (itemData) => {
    const isEdit = Boolean(itemData.id)
    const eventId = selectedEvent?.id || itemModalState.eventId

    if (!supabase || !isSupabaseConfigured) {
      if (isEdit) {
        setItems((prev) => prev.map((i) => (i.id === itemData.id ? { ...i, ...itemData } : i)))
        addLog('UPDATE_ITEM', 'item', itemData.id, eventId, `${memberName} memperbarui "${itemData.nama_kebutuhan}"`)
        showToast('Kebutuhan berhasil diperbarui!')
      } else {
        const newItem = {
          ...itemData,
          id: 'item-' + Date.now(),
          event_id: eventId,
          created_by_name: memberName,
          created_at: new Date().toISOString(),
        }
        setItems((prev) => [newItem, ...prev])
        addLog('TAMBAH_ITEM', 'item', newItem.id, eventId, `${memberName} menambah "${itemData.nama_kebutuhan}" (${itemData.jumlah})`)
        showToast('Kebutuhan to-do berhasil ditambahkan!')
      }
      setItemModalState({ isOpen: false, item: null, categoryId: null, eventId: null })
      return
    }

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('items')
          .update({
            category_id: itemData.category_id,
            nama_kebutuhan: itemData.nama_kebutuhan,
            tipe_kebutuhan: itemData.tipe_kebutuhan || 'Barang/Logistik',
            link_file: itemData.link_file || '',
            jumlah: itemData.jumlah,
            estimasi_biaya: itemData.estimasi_biaya,
            penanggung_jawab: itemData.penanggung_jawab,
            deadline: itemData.deadline,
            prioritas: itemData.prioritas,
            catatan: itemData.catatan,
            status: itemData.status,
          })
          .eq('id', itemData.id)

        if (error) throw error
        addLog('UPDATE_ITEM', 'item', itemData.id, eventId, `${memberName} memperbarui "${itemData.nama_kebutuhan}"`)
        showToast('Kebutuhan berhasil diperbarui!')
      } else {
        const { data, error } = await supabase
          .from('items')
          .insert({
            event_id: eventId,
            category_id: itemData.category_id,
            nama_kebutuhan: itemData.nama_kebutuhan,
            tipe_kebutuhan: itemData.tipe_kebutuhan || 'Barang/Logistik',
            link_file: itemData.link_file || '',
            jumlah: itemData.jumlah,
            estimasi_biaya: itemData.estimasi_biaya,
            penanggung_jawab: itemData.penanggung_jawab,
            deadline: itemData.deadline,
            prioritas: itemData.prioritas,
            catatan: itemData.catatan,
            status: itemData.status,
            created_by_name: memberName,
          })
          .select()
          .single()

        if (error) throw error
        addLog('TAMBAH_ITEM', 'item', data.id, eventId, `${memberName} menambah "${itemData.nama_kebutuhan}" (${itemData.jumlah})`)
        showToast('Kebutuhan berhasil ditambahkan!')
      }
      setItemModalState({ isOpen: false, item: null, categoryId: null, eventId: null })
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan kebutuhan', 'error')
    }
  }

  // Centang Cepat (Toggle Status Selesai)
  const handleToggleItemStatus = async (item) => {
    const newStatus = item.status === 'Selesai' ? 'Belum' : 'Selesai'

    // Optimistic UI update
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)))

    const logText =
      newStatus === 'Selesai'
        ? `${memberName} menandai SELESAI "${item.nama_kebutuhan}"`
        : `${memberName} membatalkan selesai "${item.nama_kebutuhan}"`

    addLog('CENTANG_STATUS', 'item', item.id, item.event_id, logText)

    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('items')
          .update({ status: newStatus })
          .eq('id', item.id)

        if (error) {
          setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
          showToast('Gagal mengubah status: ' + error.message, 'error')
        }
      } catch (err) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
      }
    }
  }

  const handleDeleteItem = (item) => {
    if (!isAdmin) {
      showToast('Hanya Admin yang dapat menghapus kebutuhan!', 'error')
      return
    }

    setConfirmModalState({
      isOpen: true,
      title: `Hapus Kebutuhan "${item.nama_kebutuhan}"?`,
      message: `Item kebutuhan ini akan dihapus dari daftar event.`,
      confirmText: 'Ya, Hapus Item',
      onConfirm: async () => {
        if (!supabase || !isSupabaseConfigured) {
          setItems((prev) => prev.filter((i) => i.id !== item.id))
          addLog('HAPUS_ITEM', 'item', item.id, item.event_id, `${memberName} menghapus "${item.nama_kebutuhan}"`)
          showToast('Item kebutuhan berhasil dihapus.')
          setConfirmModalState({ isOpen: false })
          return
        }

        try {
          const { error } = await supabase.from('items').delete().eq('id', item.id)
          if (error) throw error
          addLog('HAPUS_ITEM', 'item', item.id, item.event_id, `${memberName} menghapus "${item.nama_kebutuhan}"`)
          showToast('Item kebutuhan berhasil dihapus.')
        } catch (err) {
          showToast(err.message || 'Gagal menghapus item', 'error')
        } finally {
          setConfirmModalState({ isOpen: false })
        }
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
              toast.type === 'error'
                ? 'bg-red-900/90 text-white border-red-700'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={selectedEvent ? 'events' : activeTab}
        setActiveTab={(tab) => {
          setSelectedEvent(null)
          setActiveTab(tab)
        }}
        onOpenConfigGuide={() => setIsConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8">
        {selectedEvent ? (
          <EventDetail
            event={selectedEvent}
            categories={categories}
            items={items}
            onBack={() => setSelectedEvent(null)}
            onEditEvent={(ev) => setEventModalState({ isOpen: true, event: ev })}
            onDeleteEvent={handleDeleteEvent}
            onAddCategory={() =>
              setCategoryModalState({ isOpen: true, category: null, eventId: selectedEvent.id })
            }
            onEditCategory={(cat) =>
              setCategoryModalState({ isOpen: true, category: cat, eventId: selectedEvent.id })
            }
            onDeleteCategory={handleDeleteCategory}
            onAddItem={(catId) =>
              setItemModalState({
                isOpen: true,
                item: null,
                categoryId: catId,
                eventId: selectedEvent.id,
              })
            }
            onEditItem={(item) =>
              setItemModalState({
                isOpen: true,
                item,
                categoryId: item.category_id,
                eventId: selectedEvent.id,
              })
            }
            onDeleteItem={handleDeleteItem}
            onToggleItemStatus={handleToggleItemStatus}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            events={events}
            categories={categories}
            items={items}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onAddEvent={() => setEventModalState({ isOpen: true, event: null })}
            onToggleItemStatus={handleToggleItemStatus}
          />
        ) : activeTab === 'events' ? (
          <EventList
            events={events}
            items={items}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onAddEvent={() => setEventModalState({ isOpen: true, event: null })}
            onEditEvent={(ev) => setEventModalState({ isOpen: true, event: ev })}
            onDeleteEvent={handleDeleteEvent}
          />
        ) : activeTab === 'logs' ? (
          <ActivityLogView logs={logs} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Organisasi Siswa Intra Sekolah (OSIS). Portal Terbuka & Real-Time.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Panduan Database Supabase
            </button>
            <span>&bull;</span>
            <span className="text-slate-400">PostgreSQL + Realtime</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <EventModal
        isOpen={eventModalState.isOpen}
        event={eventModalState.event}
        onClose={() => setEventModalState({ isOpen: false, event: null })}
        onSave={handleSaveEvent}
      />

      <CategoryModal
        isOpen={categoryModalState.isOpen}
        category={categoryModalState.category}
        onClose={() => setCategoryModalState({ isOpen: false, category: null, eventId: null })}
        onSave={handleSaveCategory}
      />

      <ItemModal
        isOpen={itemModalState.isOpen}
        item={itemModalState.item}
        categories={categories.filter(
          (c) => c.event_id === (selectedEvent?.id || itemModalState.eventId)
        )}
        activeCategoryId={itemModalState.categoryId}
        onClose={() =>
          setItemModalState({ isOpen: false, item: null, categoryId: null, eventId: null })
        }
        onSave={handleSaveItem}
      />

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        onConfirm={confirmModalState.onConfirm}
        onClose={() => setConfirmModalState({ isOpen: false })}
      />

      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  )
}
