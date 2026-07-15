// supabase/functions/send-email-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Mengambil API Key dari environment variable milik Supabase Vault
const apiKey = Deno.env.get("BREVO_API_KEY");

// Konfigurasi Header CORS agar bisa ditembak dari web Astro kamu
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle request preflight OPTIONS untuk CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Membaca data kiriman (Payload) dari form Astro kamu
    const { emailPelamar, namaPelamar } = await req.json();

    if (!emailPelamar || !namaPelamar) {
      return new Response(
        JSON.stringify({ error: "Missing emailPelamar or namaPelamar parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payload JSON khusus untuk spesifikasi Brevo API V3
    const emailPayload = {
      sender: { 
        name: "Tim Manajemen PIH UIN", 
        email: "aldnlee.ale@gmail.com" // Ganti dengan Gmail kamu yang aktif di Brevo
      },
      to: [
        { 
          email: emailPelamar, 
          name: namaPelamar 
        }
      ],
      subject: "📢 Update Status Seleksi Magang PIH UIN Jakarta",
      htmlContent: `
        <div style="font-family: sans-serif; padding: 24px; color: #0f2854; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #1b509b;">Halo ${namaPelamar},</h2>
          <p style="line-height: 1.6; font-size: 15px;">Terima kasih telah mendaftar di program magang internal PIH UIN Syarif Hidayatullah Jakarta.</p>
          <p style="line-height: 1.6; font-size: 15px;">Dokumen pendaftaran Anda telah berhasil masuk ke sistem kami dan saat ini sedang berada dalam tahap <b>Review Berkas</b> oleh tim manajemen.</p>
          <br/>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;"/>
          <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
            Salam Hangat,<br/>
            <b>Project Management Office (PMO) PIH</b>
          </p>
        </div>
      `
    };

    // Eksekusi POST request ke Brevo
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey || '',
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(`Brevo API Error: ${errorResponse}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification email sent successfully!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})