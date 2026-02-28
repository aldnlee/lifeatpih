export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /**
     * PENGATURAN KEAMANAN FOLDER INTERNAL
     * 1. Hanya mengunci path yang dimulai dengan /internal
     * 2. Mengecualikan folder /admin agar Decap CMS tidak error
     * 3. Mengecualikan file statis penting jika diperlukan
     */
    if (url.pathname.startsWith("/internal")) {
      
      // Ambil header Authorization dari browser
      const auth = request.headers.get("Authorization");

      /**
       * KREDENSIAL LOGIN (Ganti sesuai keinginan)
       * Format: "username:password"
       * Contoh di bawah: user = admin, password = pihbatch1
       */
      const userPass = "admin:pihbatch1";
      const expectedAuth = "Basic " + btoa(userPass);

      // Jika user belum login atau password salah
      if (auth !== expectedAuth) {
        return new Response("Akses Ditolak. Silakan masukkan Username dan Password area Internal PIH.", {
          status: 401,
          headers: {
            // Ini yang memicu pop-up login muncul di browser
            "WWW-Authenticate": 'Basic realm="Area Internal Life at PIH"',
          },
        });
      }
    }

    /**
     * JALUR BEBAS (PUBLIC & ADMIN)
     * Jika akses ke halaman depan, /blog, atau /admin (Decap CMS),
     * Cloudflare akan langsung menyajikan file aslinya tanpa minta password.
     */
    return env.ASSETS.fetch(request);
  },
};