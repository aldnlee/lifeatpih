import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. Load variabel dari file .env
dotenv.config();

// 2. Inisialisasi Supabase Client
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.PUBLIC_SUPABASE_ANON_KEY || 
  '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: URL atau API Key Supabase belum terpasang di .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Inisialisasi Transporter Brevo SMTP Relay
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false, // Gunakan TLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// Helper untuk jeda waktu (delay)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRelayBroadcast() {
  console.log('🚀 Memulai pengiriman email via Brevo SMTP Relay...\n');

  try {
    // 4. Tarik data pendaftar (posisi dihapus dari query agar tidak error)
    const { data: applicants, error } = await supabase
      .from('applications')
      .select('id, full_name, user_email, status, email_status')
      .ilike('email_status', '%pending%');

    if (error) {
      console.error('❌ Gagal mengambil data dari Supabase:', error.message);
      return;
    }

    if (!applicants || applicants.length === 0) {
      console.log('✨ Tidak ada antrean email pending.');
      return;
    }

    console.log(`📋 Ditemukan ${applicants.length} pendaftar dalam antrean.\n`);

    let successCount = 0;
    let failCount = 0;

    // 5. Looping Pengiriman Email
    for (const [index, app] of applicants.entries()) {
      const recipientEmail = app.user_email;
      const recipientName = app.full_name || 'Pelamar';

      try {
        console.log(`[${index + 1}/${applicants.length}] Mengirim ke ${recipientEmail}...`);

        // Kirim Email via Brevo SMTP
        await transporter.sendMail({
          from: `"Life at PIH UIN Jakarta" <${process.env.BREVO_SMTP_USER}>`,
          to: recipientEmail,
          subject: `[Life at PIH] Update Pendaftaran Magang - ${recipientName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f2854; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px;">
              <h2 style="color: #1b509b; margin-top: 0;">Halo ${recipientName},</h2>
              <p>Terima kasih telah mendaftar pada program <strong>Mahardhika Life at PIH UIN Jakarta</strong>.</p>
              <p>Status pendaftaran kamu saat ini: <b style="text-transform: uppercase; color: #1b509b; background: #e0f2fe; padding: 4px 8px; border-radius: 4px;">${app.status || 'Diproses'}</b>.</p>
              <p>Silakan pantau pembaruan informasi selengkapnya melalui portal pendaftar.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Salam hangat,<br/><b>Tim Penyeleksi PIH UIN Jakarta</b></p>
            </div>
          `,
        });

        // 6. Update status di Supabase menjadi 'sent'
        const { error: updateError } = await supabase
          .from('applications')
          .update({ email_status: 'sent' })
          .eq('id', app.id);

        if (updateError) {
          console.warn(`   ⚠️ Email terkirim ke ${recipientEmail}, tapi gagal update status DB:`, updateError.message);
        } else {
          console.log(`   ✅ Berhasil terkirim & status ter-update di DB`);
        }

        successCount++;
      } catch (err: any) {
        console.error(`   ❌ Gagal mengirim ke ${recipientEmail}:`, err.message);
        failCount++;
      }

      // Jeda 1.5 detik antar pengiriman
      await sleep(1500);
    }

    console.log('\n===========================================');
    console.log(`🎉 Broadcast Selesai!`);
    console.log(`   - Berhasil: ${successCount}`);
    console.log(`   - Gagal   : ${failCount}`);
    console.log('===========================================\n');

  } catch (err: any) {
    console.error('❌ Terjadi kesalahan fatal:', err.message);
  }
}

runRelayBroadcast();