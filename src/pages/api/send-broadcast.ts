import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { supabase } from '../../lib/supabase';

const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { applicantIds } = await request.json();

    // 1. Tarik data pendaftar terpilih dari Supabase
    const { data: applicants, error } = await supabase
      .from('applications')
      .select('id, full_name, user_email, status, position')
      .in('id', applicantIds);

    if (error || !applicants) {
      return new Response(JSON.stringify({ message: 'Gagal mengambil data pelamar' }), { status: 400 });
    }

    let successCount = 0;

    // 2. Kirim Email via Resend API
    for (const applicant of applicants) {
      const { id, full_name, user_email, status, position } = applicant;

      const { data, error: sendError } = await resend.emails.send({
        from: 'PIH UIN Jakarta <onboarding@resend.dev>', // Menggunakan domain default Resend
        to: [user_email],
        subject: `[Life at PIH] Update Status Pendaftaran - ${full_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f2854;">
            <h2 style="color: #1b509b;">Halo ${full_name},</h2>
            <p>Terima kasih telah mendaftar posisi <strong>${position || 'Magang PIH'}</strong> pada program <strong>Mahardhika Life at PIH UIN Jakarta</strong>.</p>
            <p>Status pendaftaran kamu saat ini: <b style="text-transform: uppercase; color: #1b509b; background: #f0fdf4; padding: 4px 8px; border-radius: 6px;">${status}</b>.</p>
            <p>Silakan akses portal pendaftar untuk informasi lebih lanjut.</p>
            <br/>
            <p>Salam hangat,<br/><b>Tim Penyeleksi PIH UIN Jakarta</b></p>
          </div>
        `
      });

      if (!sendError) {
        // 3. Update email_status di Supabase menjadi 'sent'
        await supabase
          .from('applications')
          .update({ email_status: 'sent' })
          .eq('id', id);
        
        successCount++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Berhasil mengirim ${successCount} email.` 
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};