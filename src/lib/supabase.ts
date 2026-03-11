import { createClient } from '@supabase/supabase-js';

/**
 * Astro menggunakan Vite, jadi kita mengakses environment variables 
 * menggunakan import.meta.env. 
 * Pastikan variabel diawali dengan PUBLIC_ agar bisa dibaca di browser.
 */
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Logika Fallback: 
// Jika variabel undefined, kita berikan string kosong agar createClient tidak melempar Error fatal.
// Ini akan membiarkan halaman web tetap termuat, tapi fitur Supabase tidak akan berfungsi.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ KONFIGURASI ERROR: PUBLIC_SUPABASE_URL atau PUBLIC_SUPABASE_ANON_KEY tidak ditemukan!\n" +
    "Pastikan kamu sudah memasukkan Environment Variables di Dashboard Cloudflare (Settings > Environment Variables) " +
    "dan melakukan 'Retry Deployment'."
  );
}

// Inisialisasi client dengan fallback string kosong jika variabel tidak ada
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);