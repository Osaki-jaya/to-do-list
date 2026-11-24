-- Tambahkan kolom tipe kebutuhan dan link file ke tabel items jika belum ada
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS tipe_kebutuhan TEXT DEFAULT 'Barang/Logistik';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS link_file TEXT DEFAULT '';

-- Berikan izin akses
GRANT ALL ON TABLE public.items TO anon, authenticated, service_role;
