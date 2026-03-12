// Supabase Edge Function: Pengiriman Email otomatis via Resend API
// Trigger: Database Webhook (Setiap INSERT atau UPDATE pada tabel applications)

/**
 * Interface untuk struktur data dari Webhook Supabase
 */
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    full_name: string;
    user_email: string;
    role_applied: string;
    status: string;
    batch_id: string;
  };
  old_record: {
    status: string;
  } | null;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req: Request) => {
  try {
    // Memberikan tipe data pada payload
    const payload: WebhookPayload = await req.json();
    const { record, type, old_record } = payload;

    const userEmail = record.user_email;
    const fullName = record.full_name;
    const role = record.role_applied;
    const status = record.status;

    let subject = "";
    let htmlContent = "";

    // 1. LOGIKA UNTUK PENDAFTARAN BARU (INSERT)
    if (type === 'INSERT') {
      subject = `[Konfirmasi] Pendaftaran Magang PIH: ${fullName}`;
      htmlContent = `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f2854; margin: 0;">Life at PIH.</h1>
            <p style="color: #1b509b; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Recruitment Portal</p>
          </div>
          <h2 style="color: #333;">Halo, ${fullName}!</h2>
          <p style="line-height: 1.6; color: #555;">Terima kasih telah mendaftarkan diri Anda untuk posisi <strong>${role}</strong> di Pusat Informasi dan Humas UIN Jakarta.</p>
          <p style="line-height: 1.6; color: #555;">Saat ini aplikasi Anda sedang dalam tahap <strong>Seleksi Administrasi</strong>. Kami akan mengabari Anda kembali melalui email ini jika ada perkembangan terbaru.</p>
          <div style="margin: 40px 0; text-align: center;">
            <a href="https://lifeatpih.pages.dev/dashboard" style="background: #0f2854; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold;">Cek Progres di Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
        </div>
      `;
    } 
    
    // 2. LOGIKA UNTUK PERUBAHAN STATUS (UPDATE)
    else if (type === 'UPDATE' && status !== old_record?.status) {
      if (status === 'interview') {
        subject = `[PENTING] Undangan Wawancara Magang PIH - ${fullName}`;
        htmlContent = `
          <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h2 style="color: #1b509b;">Selamat! Anda Lolos Tahap Administrasi</h2>
            <p>Halo <strong>${fullName}</strong>, kami terkesan dengan portofolio Anda.</p>
            <p>Anda diundang untuk mengikuti <strong>Tahap Wawancara</strong>. Detail jadwal dan link pertemuan dapat Anda akses melalui dashboard pelamar.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://lifeatpih.pages.dev/dashboard" style="background: #1b509b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold;">Lihat Jadwal Wawancara</a>
            </div>
          </div>
        `;
      } else if (status === 'accepted') {
        subject = `🎉 Selamat! Anda Diterima di Squad PIH UIN Jakarta`;
        htmlContent = `
          <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px; background-color: #f0fdf4;">
            <h1 style="color: #15803d; text-align: center;">Welcome to the Squad!</h1>
            <p>Halo <strong>${fullName}</strong>,</p>
            <p>Berdasarkan hasil seleksi, kami dengan senang hati menginformasikan bahwa Anda <strong>DITERIMA</strong> sebagai intern di posisi <strong>${role}</strong>.</p>
            <p>Silakan segera lakukan konfirmasi melalui dashboard pelamar untuk proses onboarding selanjutnya.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://lifeatpih.pages.dev/dashboard" style="background: #15803d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold;">Konfirmasi Sekarang</a>
            </div>
          </div>
        `;
      } else if (status === 'rejected') {
        subject = `Update Lamaran Magang PIH UIN Jakarta - ${fullName}`;
        htmlContent = `
          <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h2 style="color: #333;">Terima Kasih Atas Ketertarikan Anda</h2>
            <p>Halo <strong>${fullName}</strong>,</p>
            <p>Kami sangat menghargai waktu yang Anda luangkan untuk melamar di PIH. Namun, saat ini kami belum dapat melanjutkan aplikasi Anda ke tahap berikutnya.</p>
            <p>Jangan berkecil hati, terus kembangkan skill Anda dan kami nantikan lamaran Anda di batch selanjutnya.</p>
          </div>
        `;
      }
    }

    if (!subject) return new Response("No email triggered", { status: 200 });

    // KIRIM KE API RESEND
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PIH Recruitment <onboarding@resend.dev>',
        to: [userEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});