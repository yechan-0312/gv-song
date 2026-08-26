module.exports = async (req, res) => {
  const refresh_token = req.query.refresh_token;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refresh_token) {
    res.status(400).json({ error: 'missing refresh_token' });
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
    res.status(tokenRes.ok ? 200 : 400).json(data);
  } catch (e) {
    res.status(500).json({ error: 'network_error' });
  }
};
