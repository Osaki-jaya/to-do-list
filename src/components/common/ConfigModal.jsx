import React, { useState } from 'react'
import { X, Copy, Check, ExternalLink, Terminal, Shield, Sparkles } from 'lucide-react'

export default function ConfigModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const copyEnvSample = () => {
    const text = `VITE_SUPABASE_URL=https://your-id.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Panduan Setup Supabase & Row Level Security
              </h2>
              <p className="text-xs text-slate-500">
                Langkah cepat menghubungkan aplikasi ke database Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600">
          {/* Step 1 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Buat Project Baru di Supabase
            </div>
            <p className="text-xs text-slate-600 leading-relaxed ml-8">
              Buka{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-semibold underline inline-flex items-center gap-1"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
              , buat organisasi & project baru (pilih region Singapore untuk akses tercepat dari Indonesia).
            </p>
          </div>

          {/* Step 2 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Jalankan Skrip SQL Lengkap
            </div>
            <p className="text-xs text-slate-600 leading-relaxed ml-8 mb-2">
              Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda. Buat query baru, lalu salin seluruh isi file{' '}
              <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                supabase_schema.sql
              </code>{' '}
              yang ada di root direktori project ini dan klik <strong>Run</strong>.
            </p>
            <div className="ml-8 text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200 flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                Skrip ini otomatis membuat tabel profiles, events, categories, items, activity_log, fungsi{' '}
                <code>is_admin()</code>, trigger kategori default (8 kategori), RLS policies, dan sample data!
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Isi File .env di Proyek Ini
            </div>
            <p className="text-xs text-slate-600 leading-relaxed ml-8 mb-2">
              Masuk ke <strong>Project Settings &gt; API</strong> di Supabase. Salin URL dan anon public key ke dalam file{' '}
              <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">.env</code>:
            </p>
            <div className="ml-8 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
              <div>
                VITE_SUPABASE_URL=https://xyz.supabase.co
                <br />
                VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
              </div>
              <button
                onClick={copyEnvSample}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                title="Salin Template"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              Jadikan Akun Anda sebagai Admin Pertama
            </div>
            <p className="text-xs text-slate-600 leading-relaxed ml-8">
              Setelah mendaftarkan akun di website ini, buka kembali SQL Editor Supabase dan jalankan:
            </p>
            <pre className="ml-8 mt-2 bg-slate-900 text-amber-300 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
UPDATE public.profiles SET role = 'admin' WHERE email = 'email_anda@sekolah.sch.id';
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  )
}
