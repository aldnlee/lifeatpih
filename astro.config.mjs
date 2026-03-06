// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare'; // Tambahkan ini

export default defineConfig({
  // 'server' berarti semua halaman di-render di server Cloudflare
  // 'hybrid' berarti campuran antara statis dan server (cocok untuk API)
  output: 'server', 
  
  adapter: cloudflare(), // Tambahkan ini

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true,
      }
    }
  }
});