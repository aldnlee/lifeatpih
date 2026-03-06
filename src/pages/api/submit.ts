import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const fullName = data.get('full_name');
    const contact = data.get('contact');
    const role = data.get('role');
    const portfolio = data.get('portfolio'); // Sekarang kita pastikan ini terbaca

    // 1. Validasi Sederhana (Sekarang menyertakan portfolio)
    if (!fullName || !contact || !role || !portfolio) {
      return new Response(
        JSON.stringify({ message: "Data tidak lengkap. Semua field wajib diisi!" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    /**
     * 2. Logika Backend
     * Muhammad Daffa Muis[cite: 7], di sini data portfolio akan tercatat.
     */
    console.log(`[REKRUTMEN PIH] Pendaftar baru: ${fullName}`);
    console.log(`Posisi: ${role} | Portofolio: ${portfolio}`);

    // Contoh integrasi masa depan: Kirim ke database Cloudflare D1
    // await env.DB.prepare("INSERT INTO applicants...").run();

    return new Response(
      JSON.stringify({ message: "Aplikasi berhasil diterima! Tim PIH akan segera menghubungimu." }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Submission Error:", error);
    return new Response(
      JSON.stringify({ message: "Terjadi kesalahan pada server. Coba lagi nanti." }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};