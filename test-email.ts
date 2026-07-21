import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 1. Supabase Client Setup
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Transporter Brevo SMTP Relay
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRelayBroadcast() {
  console.log('🚀 Memulai pengiriman email via Brevo SMTP Relay...\n');

  // Tarik data pendaftar bernilai 'pending' dari Supabase
  const { data: applicants, error } = await supabase
    .from('applications')
    .select('id, full_name, user_email, status, position')
    .eq('email_status', 'pending');

  if (error || !applicants || applicants.length === 0) {
    console.log('✨ Tidak ada antrean email pending.');
    return;
  }

  console.log(`📋 Ditemukan ${applicants.length} pendaftar.\n`);

  for (const [index, app] of applicants.entries()) {
    try {
      console.log(`[${index + 1}/${applicants.length}] Mengirim ke ${app.user_email}...`);

      await transporter.sendMail({
        // FROM WAJIB Menggunakan Email Terdaftar di Brevo
        from: `"Life at PIH UIN Jakarta" <${process.env.BREVO_SMTP_USER}>`,
        to: app.user_email,
        subject: `[Life at PIH] Pengumuman Seleksi Magang - ${app.full_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f2854;">
            <h2 style="color: #1b509b;">Halo ${app.full_name},</h2>
            <p>Terima kasih telah mendaftar posisi <strong>${app.position || 'Magang PIH'}</strong>.</p>
            <p>Status pendaftaran kamu: <b>${app.status.toUpperCase()}</b>.</p>
            <br/>
            <p>Salam,<br/><b>Tim PIH UIN Jakarta</b></p>
          </div>
        `
      });

      // Update status di Supabase
      await supabase
        .from('applications')
        .update({ email_status: 'sent' })
        .eq('id', app.id);

      console.log(`   ✅ Berhasil ke ${app.user_email}`);
    } catch (err: any) {
      console.error(`   ❌ Gagal ke ${app.user_email}:`, err.message);
    }

    // Jeda 1.5 detik per email
    await sleep(1500);
  }

  console.log('\n🎉 Broadcast Selesai!');
}

runRelayBroadcast();