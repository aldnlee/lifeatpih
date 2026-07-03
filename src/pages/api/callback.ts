import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const client_id = import.meta.env.GITHUB_CLIENT_ID || "Ov23lie5hFEdktkSQH85";
  const client_secret = import.meta.env.GITHUB_CLIENT_SECRET || "201f2a87a10b9281c9e7bc91fcdee442d3ed876e";
  
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Error: Missing authorization code from GitHub.', { status: 400 });
  }

  try {
    // Tukarkan kode sementara dengan access_token ke API GitHub
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code
      }),
    });

    const data: any = await response.json();

    if (data.error) {
      return new Response(`GitHub OAuth Error: ${data.error_description || data.error}`, { status: 400 });
    }

    // Script HTML untuk mengirim token kembali ke panel admin Decap CMS
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Otorisasi Sukses</title>
      </head>
      <body>
        <p style="text-align:center; font-family:sans-serif; margin-top:50px;">
          Otorisasi berhasil! Menghubungkan kembali ke Decap CMS...
        </p>
        <script>
          window.addEventListener("message", function(e) {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}',
              e.origin
            );
          }, false);
          
          // Trigger jabat tangan awal dengan Decap CMS
          window.opener.postMessage("authorizing:github", "*");
        </script>
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

  } catch (error: any) {
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
};