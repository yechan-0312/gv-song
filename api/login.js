module.exports = (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

  if (!client_id || !redirect_uri) {
    res.statusCode = 500;
    res.end('환경변수(SPOTIFY_CLIENT_ID / SPOTIFY_REDIRECT_URI)가 설정되지 않았습니다.');
    return;
  }

  const scope = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');

  const state = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
    state
  });

  res.writeHead(302, { Location: `https://accounts.spotify.com/authorize?${params.toString()}` });
  res.end();
};
