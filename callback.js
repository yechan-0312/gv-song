module.exports = async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

  if (error || !code) {
    res.writeHead(302, { Location: '/?sync_error=denied' });
    return res.end();
  }

  try {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || data.error) {
      res.writeHead(302, { Location: '/?sync_error=token' });
      return res.end();
    }

    // 토큰을 URL 해시(#)로 넘긴다 - 해시는 서버 로그에 남지 않는다.
    const params = new URLSearchParams({
      at: data.access_token,
      rt: data.refresh_token || '',
      exp: String(data.expires_in || 3600)
    });

    res.writeHead(302, { Location: `/#${params.toString()}` });
    res.end();
  } catch (e) {
    res.writeHead(302, { Location: '/?sync_error=network' });
    res.end();
  }
};
