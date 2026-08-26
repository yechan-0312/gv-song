function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

module.exports = async (req, res) => {
  const cookies = parseCookies(req);
  const refresh_token = cookies.sid;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refresh_token) {
    res.status(200).json({ authenticated: false });
    return;
  }

  try {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
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
      res.setHeader('Set-Cookie', 'sid=; Path=/; Max-Age=0');
      res.status(200).json({ authenticated: false });
      return;
    }

    // Spotify는 재발급 시 새 refresh_token을 줄 수도, 안 줄 수도 있음 (있으면 회전 저장)
    if (data.refresh_token) {
      res.setHeader(
        'Set-Cookie',
        `sid=${encodeURIComponent(data.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
      );
    }

    res.status(200).json({
      authenticated: true,
      access_token: data.access_token,
      expires_in: data.expires_in || 3600
    });
  } catch (e) {
    res.status(200).json({ authenticated: false });
  }
};
