// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // Pastikan Vite mengenali plugin Tailwind v4
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Opsi tambahan untuk Windows agar lebih stabil saat reload
      watch: {
        usePolling: true,
      }
    }
  },

  adapter: cloudflare()
});