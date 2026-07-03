import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, redirect }) => {
  // Ambil Client ID dari environment variable Cloudflare Workers Anda
  // Jika belum diset di Cloudflare, Anda bisa hardcode sementara: const client_id = "..."
  const client_id = import.meta.env.GITHUB_CLIENT_ID || "Ov23lie5hFEdktkSQH85";
  
  const scope = url.searchParams.get('scope') || 'repo';
  
  // Bentuk URL Otorisasi resmi milik GitHub
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}`;
  
  // Arahkan pengguna ke GitHub
  return redirect(githubAuthUrl, 302);
};