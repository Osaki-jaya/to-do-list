# 📋 OSIS Event To-Do & Logistic Management System

Aplikasi web To-Do List kebutuhan event sekolah yang dirancang khusus untuk Pengurus OSIS dengan database online **Supabase (PostgreSQL + Realtime + Auth)**. Aplikasi ini memungkinkan banyak pengurus mencatat, memantau, dan berkolaborasi dalam mempersiapkan segala kebutuhan acara sekolah (perlengkapan, konsumsi, dana, perizinan, dll.) secara real-time.

---

## ✨ Fitur Utama

1. **Manajemen Event:**
   - Tambah, edit, dan hapus event (nama acara, tanggal pelaksanaan, lokasi, penanggung jawab, deskripsi, dan status: *Perencanaan*, *Berjalan*, *Selesai*).
   - Tampilan daftar event berupa kartu interaktif lengkap dengan **progress bar persentase kebutuhan selesai** dan total estimasi anggaran biaya.

2. **Kategori Kebutuhan per Event:**
   - Setiap event memiliki kategori tersendiri.
   - Saat event baru dibuat, sistem secara otomatis (*via database trigger*) menyediakan **8 Kategori Default**:
     1. Perlengkapan
     2. Konsumsi
     3. Dokumentasi
     4. Dana
     5. Perizinan
     6. Acara/Rundown
     7. Publikasi
     8. Keamanan
   - Pengurus dapat menambah kategori baru atau mengubah nama kategori yang ada.

3. **Daftar Kebutuhan (To-Do Items):**
   - Rincian item kebutuhan: *nama kebutuhan*, *jumlah/volume*, *estimasi biaya (Rp)*, *penanggung jawab (PJ)*, *deadline*, *prioritas (Tinggi/Sedang/Rendah)*, *catatan vendor/tempat*, dan *status (Belum/Proses/Selesai)*.
   - **Centang Cepat (Quick Check):** Tandai selesai langsung dari daftar dengan efek coret dan pembaruan instan.
   - Menampilkan label *"Ditambahkan oleh [Nama Pengurus]"* di setiap item.

4. **Ringkasan (Dashboard):**
   - Total event, total kebutuhan, item selesai (jumlah & %), item dalam proses/belum, serta total estimasi biaya seluruh event.
   - **Widget Peringatan Deadline:** Menampilkan otomatis item kebutuhan yang mendekati deadline (&le; 3 hari) atau telah melewati deadline.

5. **Pencarian dan Multi-Filter:**
   - Pencarian teks instan berdasarkan nama kebutuhan, catatan, atau PJ.
   - Filter cepat berdasarkan kategori, status, prioritas, dan penanggung jawab.

6. **Ekspor Rapat (PDF & CSV):**
   - **Ekspor PDF:** Menghasilkan dokumen resmi OSIS siap cetak berformat A4 dengan kop resmi, ringkasan progres, tabel kebutuhan, dan kolom tanda tangan Ketua OSIS & PJ Acara.
   - **Ekspor CSV:** Kompatibel penuh dengan Microsoft Excel (UTF-8 BOM).

7. **Kelola Pengurus & Hak Akses (Khusus Admin):**
   - Admin dapat melihat seluruh daftar pengguna terdaftar dan mengubah hak akses peran (*role*: `admin` atau `anggota`).

8. **Audit Trail (Riwayat Aktivitas):**
   - Tabel `activity_log` mencatat riwayat penambahan, pengubahan, penyelesaian, atau penghapusan item/event beserta nama pengurus dan waktu kejadian.

9. **Keamanan Row Level Security (RLS):**
   - `SELECT`: Semua pengurus yang telah login.
   - `INSERT`: Semua pengurus yang telah login.
   - `UPDATE`: Semua pengurus yang telah login.
   - `DELETE`: **Hanya role `admin`** yang diizinkan (dilindungi di tingkat database PostgreSQL via fungsi `is_admin()`).

---

## 🛠️ Arsitektur Teknologi

- **Frontend:** React 19 + Tailwind CSS v4 + Vite
- **Backend & Database:** Supabase (PostgreSQL 15+, Auth, Realtime)
- **Library:** `@supabase/supabase-js`, `lucide-react`, `jspdf`, `jspdf-autotable`

---

## 📁 Struktur Folder Proyek

```text
d:\to do/
├── .env.example               # Template environment variable Supabase
├── index.html                 # HTML template utama
├── package.json               # Dependensi & script aplikasi
├── supabase_schema.sql        # Skrip SQL lengkap (Tabel, RLS, Trigger, Seed Data)
├── vite.config.js             # Konfigurasi Vite & Tailwind CSS v4
├── src/
│   ├── main.jsx               # Entry point React & AuthProvider
│   ├── index.css              # Styling Tailwind & base theme
│   ├── App.jsx                # Komponen root & orkestrasi realtime
│   ├── context/
│   │   └── AuthContext.jsx    # Autentikasi Supabase & session management
│   ├── lib/
│   │   └── supabase.js        # Supabase client & logging helper
│   ├── data/
│   │   └── initialData.js     # Data demo & fallback awal
│   ├── utils/
│   │   ├── formatters.js      # Formatter Rupiah, tanggal Indonesia, & deadline
│   │   └── exporter.js        # Export engine PDF (jsPDF) & CSV
│   └── components/
│       ├── auth/
│       │   └── AuthModal.jsx  # Form Login & Register
│       ├── common/
│       │   ├── Navbar.jsx     # Navigasi utama & profil pengguna
│       │   ├── ConfirmModal.jsx# Modal dialog konfirmasi hapus data
│       │   └── ConfigModal.jsx# Panduan setup Supabase interaktif
│       ├── dashboard/
│       │   └── DashboardView.jsx # Tampilan statistik & alert deadline
│       ├── events/
│       │   ├── EventList.jsx  # Daftar event kartu & progress bar
│       │   ├── EventDetail.jsx# Detail kebutuhan event (tab per kategori)
│       │   ├── EventModal.jsx # Modal tambah/edit event
│       │   ├── CategoryModal.jsx# Modal tambah/edit kategori
│       │   └── ItemModal.jsx  # Modal tambah/edit item to-do
│       └── admin/
│           ├── UserManagement.jsx # Kelola pengguna & role
│           └── ActivityLogView.jsx# Log riwayat aktivitas
```

---

## 🚀 Panduan Setup & Menjalankan Proyek

### Langkah 1: Persiapan Database Supabase

1. Buka [https://supabase.com](https://supabase.com) dan buat akun/login.
2. Buat proyek baru (*New Project*). Disarankan memilih region terdekat (**Singapore**).
3. Setelah project siap, buka menu **SQL Editor** pada sidebar kiri Supabase.
4. Klik **New Query**, buka file `supabase_schema.sql` dari project ini, lalu **salin (copy) seluruh kodenya** ke SQL Editor Supabase.
5. Klik tombol **Run** (Ctrl + Enter).
   - Skrip ini akan otomatis membuat tabel `profiles`, `events`, `categories`, `items`, `activity_log`, fungsi `is_admin()`, trigger kategori default, policy RLS, sinkronisasi realtime, serta data contoh acara *"Harlah OSIS & Sekolah ke-45"*.

---

### Langkah 2: Konfigurasi Environment Variable (`.env`)

1. Pada dashboard Supabase Anda, buka **Project Settings** (ikon gear) &gt; **API**.
2. Salin nilai:
   - **Project URL**
   - **anon / public key**
3. Buka file `.env` di proyek ini, lalu tempelkan nilai tersebut:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Langkah 3: Menjalankan Secara Lokal

Buka terminal di direktori proyek ini dan jalankan:

```bash
# Jalankan development server
npm run dev
```

Buka URL yang ditampilkan di browser (biasanya `http://localhost:5173`).

---

### Langkah 4: Registrasi Akun & Pengaturan Admin Pertama

1. Di halaman web, pilih tab **Daftar Akun Baru**.
2. Masukkan nama lengkap (misal: `Bima Prakoso (Ketua OSIS)`), email, dan password.
3. Setelah mendaftar, akun Anda secara otomatis masuk ke tabel `profiles` dengan role default `anggota`.
4. Untuk menjadikan akun Anda sebagai **Admin Pertama**, buka kembali **SQL Editor** di Supabase dan jalankan query berikut:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email_anda@sekolah.sch.id';
```

Setelah itu, muat ulang (refresh) halaman website Anda. Profil Anda kini memiliki lencana **Admin OSIS** dengan hak akses penuh untuk mengelola pengguna dan menghapus data.

---

## ☁️ Panduan Deploy ke Vercel

Aplikasi ini siap di-deploy secara instan dan gratis ke Vercel:

1. Buat repositori baru di GitHub / GitLab dan unggah kode proyek ini.
2. Buka [https://vercel.com](https://vercel.com) dan klik **Add New... &gt; Project**.
3. Hubungkan ke repositori GitHub Anda.
4. Pada bagian **Build and Output Settings**:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = *(URL Project Supabase Anda)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon Public Key Supabase Anda)*
6. Klik **Deploy**. Website akan aktif dalam hitungan detik dan dapat langsung digunakan oleh seluruh pengurus OSIS melalui ponsel maupun laptop!

---

## 🔒 Ringkasan Kebijakan Row Level Security (RLS)

| Tabel | SELECT | INSERT | UPDATE | DELETE |
| :--- | :---: | :---: | :---: | :---: |
| `events` | Authenticated (Semua pengurus login) | Authenticated | Authenticated | **Admin Saja (`is_admin()`)** |
| `categories` | Authenticated | Authenticated | Authenticated | **Admin Saja (`is_admin()`)** |
| `items` | Authenticated | Authenticated | Authenticated (termasuk centang status) | **Admin Saja (`is_admin()`)** |
| `profiles` | Authenticated | Trigger / Authenticated | Milik Sendiri atau Admin | **Admin Saja (`is_admin()`)** |
| `activity_log` | Authenticated | Authenticated | *Disabled* | **Admin Saja** |
#   t o - d o - l i s t  
 