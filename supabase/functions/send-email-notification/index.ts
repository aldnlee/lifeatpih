// Supabase Edge Function: Pengiriman Email otomatis via Resend API dengan Tracking Status
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req: Request) => {
  // Inisialisasi client internal untuk update status
  const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const payload: WebhookPayload = await req.json();
    const { record, type, old_record } = payload;

    const userEmail = record.user_email;
    const fullName = record.full_name;
    const role = record.role_applied;
    const status = record.status;

    let subject = "";
    let htmlContent = "";

    // Logika Trigger Email
    if (type === 'INSERT') {
      subject = `[Konfirmasi] Pendaftaran Magang PIH: ${fullName}`;
      htmlContent = `<div style="font-family: sans-serif; padding: 20px;"><h2>Halo, ${fullName}!</h2><p>Pendaftaran Anda untuk posisi <b>${role}</b> telah kami terima.</p></div>`;
    } 
    else if (type === 'UPDATE' && status !== old_record?.status) {
      if (status === 'interview') {
        subject = `[Undangan Wawancara] Magang PIH - ${fullName}`;
        htmlContent = `<div style="font-family: sans-serif; padding: 20px;"><h2>Selamat!</h2><p>Anda lolos ke tahap interview untuk posisi <b>${role}</b>.</p></div>`;
      } else if (status === 'accepted') {
        subject = `🎉 Selamat! Anda Diterima di Squad PIH`;
        htmlContent = `<div style="font-family: sans-serif; padding: 20px;"><h2>Welcome to the Squad!</h2><p>Anda resmi diterima di posisi <b>${role}</b>.</p></div>`;
      } else if (status === 'rejected') {
        subject = `Update Lamaran Magang PIH - ${fullName}`;
        htmlContent = `<div style="font-family: sans-serif; padding: 20px;"><p>Terima kasih sudah melamar. Mohon maaf, Anda belum bisa lanjut ke tahap berikutnya.</p></div>`;
      }
    }

    if (!subject) return new Response("No trigger", { status: 200 });

    // KIRIM KE RESEND
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

    const resendData = await res.json();

    // VALIDASI & CATAT KE DATABASE
    if (res.ok) {
      await supabaseAdmin
        .from('applications')
        .update({ email_status: 'sent' })
        .eq('id', record.id);
    } else {
      await supabaseAdmin
        .from('applications')
        .update({ email_status: 'failed' })
        .eq('id', record.id);
    }

    return new Response(JSON.stringify(resendData), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});