import { ValidationError } from "../errors/auth.errors.js";
import {
  loginService,
  logoutService,
  refreshService,
  registerService,
} from "../services/auth.service.js";

const setRefreshTokenCookie = ({ res, token }) => {
  const refreshExpiration = parseInt(process.env.REFRESH_EXPIRES_IN, 10);
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,
    // sameSite: "strict",
    maxAge: refreshExpiration * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", { path: "/api/auth" });
};

export const registerController = async (req, res, next) => {
  try {
    const { username, phoneNumber, email, password } = req.body;

    if (!username || !email || !password) {
      throw new ValidationError("Provide all required fields");
    }

    // res.status(200).json({ username });
    //registerService
    //check if user already exists
    const { user, accessToken, refreshToken } = await registerService(
      username,
      phoneNumber,
      email,
      password,
    );
    setRefreshTokenCookie({ res, token: refreshToken });
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Provide all required fields");
    }
    const { user, accessToken, refreshToken } = await loginService(
      email,
      password,
    );
    setRefreshTokenCookie({ res, token: refreshToken });
    res.status(200).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const refreshController = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken;

    console.log(incomingToken);
    if (!incomingToken) {
      throw new ValidationError("Refresh token missing");
    }

    const { accessToken, refreshToken } = await refreshService(incomingToken);
    setRefreshTokenCookie({ res, token: refreshToken });
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken;
    console.log(incomingToken);
    if (incomingToken) {
      await logoutService(incomingToken);
    }
    clearRefreshTokenCookie(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
