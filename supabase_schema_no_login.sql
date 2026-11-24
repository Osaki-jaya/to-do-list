-- ==============================================================================
-- SCHEMA SUPABASE: MODE TANPA LOGIN (AKSES LANGSUNG UNTUK PENGURUS OSIS)
-- ==============================================================================
-- Jalankan skrip ini di SQL Editor Supabase Anda:
-- https://supabase.com/dashboard/project/oxhxhekfcdyxqvtryggm
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    tanggal DATE NOT NULL,
    lokasi TEXT NOT NULL,
    penanggung_jawab TEXT NOT NULL,
    deskripsi TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('Perencanaan', 'Berjalan', 'Selesai')) DEFAULT 'Perencanaan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL: CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL: ITEMS (To-Do List Kebutuhan)
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
    created_by_name TEXT DEFAULT 'Pengurus OSIS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL: ACTIVITY_LOG (Riwayat Perubahan)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL DEFAULT 'Pengurus OSIS',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    keterangan TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TRIGGER OTOMATIS: 8 KATEGORI DEFAULT SAAT EVENT BARU DIBUAT
CREATE OR REPLACE FUNCTION public.handle_default_event_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.categories (event_id, nama, urutan)
    VALUES
        (NEW.id, 'Perlengkapan', 1),
        (NEW.id, 'Konsumsi', 2),
        (NEW.id, 'Dokumentasi', 3),
        (NEW.id, 'Dana', 4),
        (NEW.id, 'Perizinan', 5),
        (NEW.id, 'Acara/Rundown', 6),
        (NEW.id, 'Publikasi', 7),
        (NEW.id, 'Keamanan', 8);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_default_categories ON public.events;
CREATE TRIGGER trg_create_default_categories
    AFTER INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_default_event_categories();

-- 7. BERIKAN HAK AKSES LENGKAP (GRANT PRIVILEGES) KE ROLE ANON
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 8. KEBIJAKAN RLS PUBLIK (TANPA PERLU LOGIN EMAIL/PASSWORD)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_all" ON public.events;
CREATE POLICY "events_public_all" ON public.events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_public_all" ON public.categories;
CREATE POLICY "categories_public_all" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "items_public_all" ON public.items;
CREATE POLICY "items_public_all" ON public.items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "activity_log_public_all" ON public.activity_log;
CREATE POLICY "activity_log_public_all" ON public.activity_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. AKTIFKAN REALTIME SINKRONISASI
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- 10. DATA AWAL CONTOH
DO $$
DECLARE
    v_event_id UUID;
    v_cat_perlengkapan UUID;
    v_cat_konsumsi UUID;
    v_cat_dokumentasi UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.events WHERE nama = 'Harlah OSIS & Sekolah ke-45') THEN
        INSERT INTO public.events (nama, tanggal, lokasi, penanggung_jawab, deskripsi, status)
        VALUES (
            'Harlah OSIS & Sekolah ke-45',
            (CURRENT_DATE + INTERVAL '14 days')::DATE,
            'Lapangan Utama & Aula SMA Garuda',
            'Ketua OSIS (Bima Prakoso)',
            'Peringatan Hari Lahir Sekolah dan OSIS ke-45 dengan rangkaian festival seni, pameran stan, dan bakti sosial.',
            'Berjalan'
        )
        RETURNING id INTO v_event_id;

        SELECT id INTO v_cat_perlengkapan FROM public.categories WHERE event_id = v_event_id AND nama = 'Perlengkapan' LIMIT 1;
        SELECT id INTO v_cat_konsumsi FROM public.categories WHERE event_id = v_event_id AND nama = 'Konsumsi' LIMIT 1;
        SELECT id INTO v_cat_dokumentasi FROM public.categories WHERE event_id = v_event_id AND nama = 'Dokumentasi' LIMIT 1;

        IF v_cat_perlengkapan IS NOT NULL THEN
            INSERT INTO public.items (category_id, event_id, nama_kebutuhan, jumlah, estimasi_biaya, penanggung_jawab, deadline, prioritas, catatan, status, created_by_name)
            VALUES
                (v_cat_perlengkapan, v_event_id, 'Panggung Utama Rigging 8x6 Meter', '1 Set', 3500000, 'Rian (Sie Perlengkapan)', (CURRENT_DATE + INTERVAL '10 days')::DATE, 'Tinggi', 'Include tenda sound dan lighting standar.', 'Proses', 'Admin OSIS'),
                (v_cat_perlengkapan, v_event_id, 'Sound System 5000 Watt & Mic Wireless', '4 Mic + Sound', 1800000, 'Doni', (CURRENT_DATE + INTERVAL '11 days')::DATE, 'Tinggi', 'Siapkan baterai cadangan AA 10 pasang.', 'Belum', 'Admin OSIS');
        END IF;

        IF v_cat_konsumsi IS NOT NULL THEN
            INSERT INTO public.items (category_id, event_id, nama_kebutuhan, jumlah, estimasi_biaya, penanggung_jawab, deadline, prioritas, catatan, status, created_by_name)
            VALUES
                (v_cat_konsumsi, v_event_id, 'Snack Box Tamu Undangan & Guru', '120 Box', 1800000, 'Siti (Sie Konsumsi)', (CURRENT_DATE + INTERVAL '13 days')::DATE, 'Tinggi', 'Lemper ayam, kue sus, risoles mayo, air botol mini.', 'Proses', 'Siti Rahma'),
                (v_cat_konsumsi, v_event_id, 'Air Mineral Gelas untuk Peserta', '15 Dus', 450000, 'Siti', (CURRENT_DATE + INTERVAL '12 days')::DATE, 'Sedang', 'Diletakkan di 3 pos minuman utama.', 'Selesai', 'Siti Rahma');
        END IF;

        IF v_cat_dokumentasi IS NOT NULL THEN
            INSERT INTO public.items (category_id, event_id, nama_kebutuhan, jumlah, estimasi_biaya, penanggung_jawab, deadline, prioritas, catatan, status, created_by_name)
            VALUES
                (v_cat_dokumentasi, v_event_id, 'Kamera Mirrorless & Lensa Zoom', '2 Unit', 0, 'Adit (Sie Dokum)', (CURRENT_DATE + INTERVAL '8 days')::DATE, 'Tinggi', 'Unit milik ekskul Multimedia, SD Card siap.', 'Selesai', 'Adit');
        END IF;

        INSERT INTO public.activity_log (user_name, action, entity_type, entity_id, event_id, keterangan)
        VALUES ('Sistem OSIS', 'TAMBAH_EVENT', 'event', v_event_id, v_event_id, 'Event "Harlah OSIS & Sekolah ke-45" siap dipantau bersama.');
    END IF;
END $$;
