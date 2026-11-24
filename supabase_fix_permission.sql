-- ==============================================================================
-- SOLUSI PERMISSION DENIED + TAMBAH KOLOM FILE/DESAIN
-- ==============================================================================
-- Salin seluruh query ini dan klik RUN di SQL Editor Supabase Anda:
-- https://supabase.com/dashboard/project/oxhxhekfcdyxqvtryggm
-- ==============================================================================

-- 1. BERIKAN HAK AKSES LENGKAP KE ROLE ANON
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. TAMBAHKAN KOLOM DUKUNGAN FILE GARAPAN & DESAIN JIKA BELUM ADA
ALTER TABLE IF EXISTS public.items ADD COLUMN IF NOT EXISTS tipe_kebutuhan TEXT DEFAULT 'Barang/Logistik';
ALTER TABLE IF EXISTS public.items ADD COLUMN IF NOT EXISTS link_file TEXT DEFAULT '';

-- 3. PASTIKAN ROW LEVEL SECURITY (RLS) MENGIZINKAN ROLE ANON
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_all" ON public.events;
CREATE POLICY "events_public_all" ON public.events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_public_all" ON public.categories;
CREATE POLICY "categories_public_all" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "items_public_all" ON public.items;
CREATE POLICY "items_public_all" ON public.items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "activity_log_public_all" ON public.activity_log;
CREATE POLICY "activity_log_public_all" ON public.activity_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
