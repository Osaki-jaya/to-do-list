-- ==============================================================================
-- SCHEMA LENGKAP SUPABASE: APLIKASI TO-DO LIST KEBUTUHAN EVENT OSIS
-- ==============================================================================
-- File: supabase_schema.sql
-- Deskripsi: Skema database lengkap PostgreSQL untuk Supabase mencakup tabel,
--            fungsi is_admin(), trigger auto-profile, trigger kategori default,
--            RLS (Row Level Security), real-time replica, dan data contoh.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: PROFILES
-- Menyimpan data profil pengguna yang terhubung dengan Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('admin', 'anggota')) DEFAULT 'anggota',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk performa query role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. FUNGSI: is_admin()
-- Digunakan untuk memeriksa apakah pengguna saat ini berstatus 'admin'
-- Dibuat dengan SECURITY DEFINER agar dapat memeriksa tabel profiles dengan aman tanpa rekursi RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 4. TRIGGER AUTO UPDATE `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. TRIGGER ON AUTH USER CREATED -> AUTO INSERT PROFILES
-- Setiap kali ada registrasi user baru di auth.users, otomatis buat baris di public.profiles dengan role 'anggota'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'anggota'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. TABEL: EVENTS
-- Manajemen event OSIS (nama, tanggal, lokasi, penanggung jawab, deskripsi, status)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    tanggal DATE NOT NULL,
    lokasi TEXT NOT NULL,
    penanggung_jawab TEXT NOT NULL,
    deskripsi TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('Perencanaan', 'Berjalan', 'Selesai')) DEFAULT 'Perencanaan',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE TRIGGER set_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. TABEL: CATEGORIES
-- Kategori kebutuhan per event (Perlengkapan, Konsumsi, dll.)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_event_id ON public.categories(event_id);

CREATE OR REPLACE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. TRIGGER OTOMATIS GENERATE KATEGORI DEFAULT SAAT EVENT DIBUAT
-- Kategori default: Perlengkapan, Konsumsi, Dokumentasi, Dana, Perizinan, Acara/Rundown, Publikasi, Keamanan
CREATE OR REPLACE FUNCTION public.handle_default_event_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.categories (event_id, nama, urutan, created_by)
    VALUES
        (NEW.id, 'Perlengkapan', 1, NEW.created_by),
        (NEW.id, 'Konsumsi', 2, NEW.created_by),
        (NEW.id, 'Dokumentasi', 3, NEW.created_by),
        (NEW.id, 'Dana', 4, NEW.created_by),
        (NEW.id, 'Perizinan', 5, NEW.created_by),
        (NEW.id, 'Acara/Rundown', 6, NEW.created_by),
        (NEW.id, 'Publikasi', 7, NEW.created_by),
        (NEW.id, 'Keamanan', 8, NEW.created_by);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_default_categories ON public.events;
CREATE TRIGGER trg_create_default_categories
    AFTER INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_default_event_categories();

-- 9. TABEL: ITEMS (Kebutuhan To-Do List)
-- Item to-do dalam tiap kategori event
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    nama_kebutuhan TEXT NOT NULL,
    jumlah TEXT NOT NULL DEFAULT '1',
    estimasi_biaya NUMERIC(15, 2) NOT NULL DEFAULT 0,
    penanggung_jawab TEXT NOT NULL,
    deadline DATE,
    prioritas TEXT NOT NULL CHECK (prioritas IN ('Tinggi', 'Sedang', 'Rendah')) DEFAULT 'Sedang',
    catatan TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('Belum', 'Proses', 'Selesai')) DEFAULT 'Belum',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    created_by_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_items_event_id ON public.items(event_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_deadline ON public.items(deadline);

CREATE OR REPLACE TRIGGER set_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger untuk mengisi created_by_name secara otomatis jika kosong
CREATE OR REPLACE FUNCTION public.handle_item_creator_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    creator_name TEXT;
BEGIN
    IF NEW.created_by_name IS NULL OR NEW.created_by_name = '' THEN
        SELECT full_name INTO creator_name
        FROM public.profiles
        WHERE id = NEW.created_by;

        IF creator_name IS NOT NULL AND creator_name <> '' THEN
            NEW.created_by_name := creator_name;
        ELSE
            NEW.created_by_name := 'Pengurus OSIS';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_item_creator_name ON public.items;
CREATE TRIGGER trg_set_item_creator_name
    BEFORE INSERT ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_item_creator_name();

-- 10. TABEL: ACTIVITY_LOG (Riwayat Aktivitas)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    user_name TEXT NOT NULL DEFAULT 'Pengguna',
    action TEXT NOT NULL, -- e.g. 'TAMBAH_EVENT', 'UPDATE_EVENT', 'HAPUS_EVENT', 'TAMBAH_ITEM', 'UPDATE_STATUS_ITEM', dll
    entity_type TEXT NOT NULL, -- 'event', 'category', 'item', 'profile'
    entity_id UUID,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    keterangan TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_log_event_id ON public.activity_log(event_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Aturan Wajib:
-- - SELECT: semua user terautentikasi (auth.uid() IS NOT NULL)
-- - INSERT: semua user terautentikasi (auth.uid() IS NOT NULL)
-- - UPDATE: semua user terautentikasi (auth.uid() IS NOT NULL)
-- - DELETE: HANYA role 'admin' via fungsi is_admin()
-- ==============================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ---- POLICIES: PROFILES ----
-- Semua user terautentikasi bisa melihat profil anggota lain
CREATE POLICY "profiles_select_authenticated"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- User bisa update profil dirinya sendiri, atau Admin bisa update siapapun (termasuk ganti role)
CREATE POLICY "profiles_update_policy"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- Insert profil ditangani trigger handle_new_user, tapi beri izin jika user login
CREATE POLICY "profiles_insert_policy"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- Hapus profil hanya admin
CREATE POLICY "profiles_delete_admin"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ---- POLICIES: EVENTS ----
CREATE POLICY "events_select_authenticated"
    ON public.events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "events_insert_authenticated"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "events_update_authenticated"
    ON public.events FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "events_delete_admin"
    ON public.events FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ---- POLICIES: CATEGORIES ----
CREATE POLICY "categories_select_authenticated"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "categories_insert_authenticated"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "categories_update_authenticated"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "categories_delete_admin"
    ON public.categories FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ---- POLICIES: ITEMS ----
CREATE POLICY "items_select_authenticated"
    ON public.items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "items_insert_authenticated"
    ON public.items FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "items_update_authenticated"
    ON public.items FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "items_delete_admin"
    ON public.items FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ---- POLICIES: ACTIVITY_LOG ----
CREATE POLICY "activity_log_select_authenticated"
    ON public.activity_log FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "activity_log_insert_authenticated"
    ON public.activity_log FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Activity log tidak boleh sembarang diupdate
CREATE POLICY "activity_log_delete_admin"
    ON public.activity_log FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 12. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
-- Menambahkan tabel ke publikasi realtime Supabase agar perubahan langsung tersinkron
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ==============================================================================
-- 13. DATA CONTOH (SEED DATA)
-- Event contoh: "Harlah OSIS & Sekolah ke-45"
-- ==============================================================================
DO $$
DECLARE
    v_event_id UUID;
    v_cat_perlengkapan UUID;
    v_cat_konsumsi UUID;
    v_cat_dokumentasi UUID;
    v_dummy_user UUID;
BEGIN
    -- Ambil salah satu user auth jika ada, atau biarkan NULL
    SELECT id INTO v_dummy_user FROM auth.users LIMIT 1;

    -- Masukkan Event Contoh
    INSERT INTO public.events (nama, tanggal, lokasi, penanggung_jawab, deskripsi, status, created_by)
    VALUES (
        'Harlah OSIS & Sekolah ke-45',
        (CURRENT_DATE + INTERVAL '14 days')::DATE,
        'Lapangan Utama & Aula SMA Garuda',
        'Ketua OSIS (Bima Prakoso)',
        'Peringatan Hari Lahir Sekolah dan OSIS ke-45 dengan rangkaian pameran kreativitas siswa, pentas seni, dan bakti sosial.',
        'Berjalan',
        v_dummy_user
    )
    RETURNING id INTO v_event_id;

    -- Ambil id kategori yang otomatis dibuat oleh trigger
    SELECT id INTO v_cat_perlengkapan FROM public.categories WHERE event_id = v_event_id AND nama = 'Perlengkapan' LIMIT 1;
    SELECT id INTO v_cat_konsumsi FROM public.categories WHERE event_id = v_event_id AND nama = 'Konsumsi' LIMIT 1;
    SELECT id INTO v_cat_dokumentasi FROM public.categories WHERE event_id = v_event_id AND nama = 'Dokumentasi' LIMIT 1;

    -- Jika trigger belum berjalan (misal run manual), insert manual jika null
    IF v_cat_perlengkapan IS NULL THEN
        INSERT INTO public.categories (event_id, nama, urutan) VALUES (v_event_id, 'Perlengkapan', 1) RETURNING id INTO v_cat_perlengkapan;
    END IF;
    IF v_cat_konsumsi IS NULL THEN
        INSERT INTO public.categories (event_id, nama, urutan) VALUES (v_event_id, 'Konsumsi', 2) RETURNING id INTO v_cat_konsumsi;
    END IF;
    IF v_cat_dokumentasi IS NULL THEN
        INSERT INTO public.categories (event_id, nama, urutan) VALUES (v_event_id, 'Dokumentasi', 3) RETURNING id INTO v_cat_dokumentasi;
    END IF;

    -- Masukkan Item Contoh Kategori Perlengkapan
    INSERT INTO public.items (category_id, event_id, nama_kebutuhan, jumlah, estimasi_biaya, penanggung_jawab, deadline, prioritas, catatan, status, created_by_name)
    VALUES
        (v_cat_perlengkapan, v_event_id, 'Panggung Utama Ukuran 8x6 Meter', '1 Set', 3500000, 'Rian (Sie Perlengkapan)', (CURRENT_DATE + INTERVAL '10 days')::DATE, 'Tinggi', 'Sewa dari vendor audio panggung terpercaya, include rigging & tenda sarnafil.', 'Proses', 'Admin OSIS'),
        (v_cat_perlengkapan, v_event_id, 'Sound System 5000 Watt & Mic Wireless', '4 Mic + Sound', 1800000, 'Doni', (CURRENT_DATE + INTERVAL '11 days')::DATE, 'Tinggi', 'Pastikan ada 4 baterai cadangan untuk wireless mic.', 'Belum', 'Admin OSIS'),
        (v_cat_perlengkapan, v_event_id, 'Kursi Tamu VIP & Cover Putih', '60 Pcs', 600000, 'Rian', (CURRENT_DATE + INTERVAL '12 days')::DATE, 'Sedang', 'Pinjam sebagian dari inventaris sekolah, sisanya sewa.', 'Selesai', 'Admin OSIS');

    -- Masukkan Item Contoh Kategori Konsumsi
    INSERT INTO public.items (category_id, event_id, nama_kebutuhan, jumlah, estimasi_biaya, penanggung_jawab, deadline, prioritas, catatan, status, created_by_name)
    VALUES
        (v_cat_konsumsi, v_event_id, 'Snack Box Tamu Undangan & Guru', '120 Box', 1800000, 'Siti (Sie Konsumsi)', (CURRENT_DATE + INTERVAL '13 days')::DATE, 'Tinggi', 'Menu: lemper, risoles mayo, kue sus, air mineral botol mini.', 'Proses', 'Admin OSIS'),
        (v_cat_konsumsi, v_event_id, 'Makan Siang Panitia & Pengisi Acara', '85 Porsi', 2125000, 'Nadia', (CURRENT_DATE + INTERVAL '14 days')::DATE, 'Tinggi', 'Nasi kotak ayam bakar, pastikan tepat waktu pukul 12.00 WIB.', 'Belum', 'Admin OSIS'),
        (v_cat_konsumsi, v_event_id, 'Air Mineral Gelas untuk Peserta', '15 Dus', 450000, 'Siti', (CURRENT_DATE + INTERVAL '12 days')::DATE, 'Sedang', 'Diletakkan di 3 pos pembagian air minum.', 'Selesai', 'Admin OSIS');

    -- Masukkan Item Contoh Kategori Dokumentasi
    INSERT INTO public.items (category_id, event_id, nama_kebutuhan, jumlah, estimasi_biaya, penanggung_jawab, deadline, prioritas, catatan, status, created_by_name)
    VALUES
        (v_cat_dokumentasi, v_event_id, 'Kamera Mirrorless & Lensa Zoom', '2 Unit', 0, 'Adit (Sie Dokum)', (CURRENT_DATE + INTERVAL '9 days')::DATE, 'Tinggi', 'Gunakan kamera milik ekskul multimedia & memori SD Card 64GB x 2.', 'Selesai', 'Admin OSIS'),
        (v_cat_dokumentasi, v_event_id, 'Pencetakan Backdrop Photo Booth 3x4m', '1 Pcs', 250000, 'Adit', (CURRENT_DATE + INTERVAL '8 days')::DATE, 'Sedang', 'File desain siap cetak dari tim publikasi, bahan flexi korea.', 'Proses', 'Admin OSIS');

    -- Log aktivitas awal
    INSERT INTO public.activity_log (user_name, action, entity_type, entity_id, event_id, keterangan)
    VALUES
        ('Sistem OSIS', 'TAMBAH_EVENT', 'event', v_event_id, v_event_id, 'Event "Harlah OSIS & Sekolah ke-45" berhasil dibuat dengan data awal.'),
        ('Sistem OSIS', 'TAMBAH_ITEM', 'item', NULL, v_event_id, 'Item kebutuhan perlengkapan, konsumsi, dan dokumentasi telah diinputkan.');
END $$;

-- ==============================================================================
-- CARA MENGUBAH ROLE ADMIN PERTAMA KALI:
-- Jalankan query berikut di Supabase SQL Editor setelah akun terdaftar:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'email_anda@sekolah.sch.id';
-- ==============================================================================
