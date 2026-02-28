export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cek apakah user mencoba mengakses path yang dimulai dengan /internal
    if (url.pathname.startsWith("/internal")) {
      const auth = request.headers.get("Authorization");

      // Tentukan Username dan Password di sini
      // Formatnya: "username:password"
      // Contoh di bawah: user = admin, password = pihbatch1
      const credentials = "admin:pihbatch1";
      const expectedAuth = "Basic " + btoa(credentials);

      if (auth !== expectedAuth) {
        return new Response("Akses Ditolak. Silakan masukkan kredensial yang benar.", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Area Internal Life at PIH"',
          },
        });
      }
    }

    // Jika bukan folder internal, atau password benar, lanjutkan ke website biasa
    return env.ASSETS.fetch(request);
  },
};