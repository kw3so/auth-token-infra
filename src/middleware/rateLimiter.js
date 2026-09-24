import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "../errors/auth.errors.js";
import * as ConfigEnv from "../config/config.env.js";


const AUTH_RATE_LIMIT_MAX = ConfigEnv.AUTH_RATE_LIMIT_MAX
const AUTH_RATE_LIMIT_WINDOW_MS = ConfigEnv.AUTH_RATE_LIMIT_WINDOW_MINUTES* 60 * 1000

const createRateLimiter = ({ max, message }) => {
  return rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS, //This should be in ms so conversion is important
    max,
    standardHeaders: true, // return RateLimit-* headers so client can backoff intelligente
    legacyHeaders: false,
    //Routing through our own error middleware instead of express-rate-limit default.
    handler: (req, res, next) => {
      next(new TooManyRequestsError(message)); //Due to the error being carried this will be caught in middleware before any request.
    },
  });
};

export const registerLimiter = createRateLimiter({
  max: AUTH_RATE_LIMIT_MAX,
  message: "Too many attempts at register, do try again later",
});

export const loginLimiter = createRateLimiter({
  max: AUTH_RATE_LIMIT_MAX,
  message: "Too many attempts at login, do try again later",
});

export const forgotPasswordLimiter = createRateLimiter({
  max: Math.floor(AUTH_RATE_LIMIT_MAX / 2),
  message: "Too many attempts at forgot password, do try again later",
});

export const resetPasswordLimiter = createRateLimiter({
  max: Math.floor(AUTH_RATE_LIMIT_MAX / 2),
  message: "Too many attempts at reset password, do try again later",
});
