import { Request, Response } from "express";
import { saveUserAndTokens } from "../services/tokenService.js";
import { spotifyService } from "../services/spotifyService.js";
import Session from "../models/Session.js";
import { IUser } from "../models/User.js";

export const requestSpotifyAuthUrl = (req: Request, res: Response) => {
  const { state, code_challenge, code_challenge_method } = req.query;
  const url = spotifyService.getSpotifyAuthUrl(
    state as string,
    code_challenge as string,
    code_challenge_method as string
  );
  res.json({ url });
};

export const handleSpotifyCallback = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const {
      access_token: spotifyAccessToken,
      refresh_token: spotifyRefreshToken,
    } = await spotifyService.exchangeCodeForToken(code);

    const userInfo = await spotifyService.getSpotifyUserData(
      spotifyAccessToken
    );
    const { email } = userInfo;

    const { sessionId } = await saveUserAndTokens(email, {
      accessToken: spotifyAccessToken,
      refreshToken: spotifyRefreshToken,
    });

    const cookieOptions: {
      httpOnly: boolean;
      maxAge: number;
      sameSite: "lax" | "strict" | "none";
      secure: boolean;
      path: string;
    } = {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
      path: "/",
    };

    res.status(200).cookie("sessionId", sessionId, cookieOptions).json({
      message: "Login Successful",
    });
  } catch (error) {
    console.error("Error at handleSpotifyCallback:", error);
    res.status(500).json({ error: "Failed to handle Spotify callback" });
  }
};

export const checkAuthStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      res.status(200).json({ authenticated: false });
      return;
    }

    const session = await Session.findOne({ sessionId });

    if (!session || session.expiresAt < new Date()) {
      res.status(200).json({ authenticated: false });
      return;
    }

    res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error("Error at checkAuthStatus:", error);
    res.status(500).json({ error: "Failed to check auth status" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    await Session.deleteOne({ sessionId });
    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).send({ message: "Logout successful" });
  } else {
    res.status(200).send({ message: "Logout successful" });
  }
};

export const getSpotifyToken = async (req: Request, res: Response) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    res.status(200).json({ token: "" });
    return;
  }

  const session = await Session.findOne({ sessionId }).populate<{
    userId: IUser;
  }>("userId");

  if (!session || session.expiresAt < new Date()) {
    res.status(200).json({ token: "" });
    return;
  }

  const user = session.userId as IUser;

  res.status(200).json({ token: user.spotifyToken.accessToken });
};
