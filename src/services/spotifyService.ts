import axios from "axios";

const getSpotifyAuthUrl = (
  state: string,
  codeChallenge: string,
  codeChallengeMethod: string
): string => {
  const scope =
    "streaming user-read-private user-read-email user-follow-read user-follow-modify user-top-read user-library-read user-library-modify user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private";
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  const config = {
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope,
    state,
    code_challenge_method: codeChallengeMethod,
    code_challenge: codeChallenge,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  };

  authUrl.search = new URLSearchParams(config).toString();
  return authUrl.toString();
};

const exchangeCodeForToken = async (code: string) => {
  const authOptions = new URLSearchParams();
  authOptions.append("code", code);
  authOptions.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI!);
  authOptions.append("grant_type", "authorization_code");

  const authHeader =
    "Basic " +
    Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    authOptions,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      responseType: "text",
    }
  );

  return JSON.parse(response.data);
};

const getSpotifyUserData = async (spotifyAccessToken: string) => {
  const result = await axios.get("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` },
  });

  return result.data;
};

export const spotifyService = {
  getSpotifyAuthUrl,
  exchangeCodeForToken,
  getSpotifyUserData,
};
