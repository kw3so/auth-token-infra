import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "../errors/auth.errors.js";



const createRateLimiter = ({ max, message }) => {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10),
    max,
    standardHeaders: true, // return RateLimit-* headers so client can backoff intelligente
    legacyHeaders: false,
    //Routing through our own error middleware instead of express-rate-limit default.
    handler: (req, res, next) => {
      next(new TooManyRequestsError(message)); //Due to the error being carried this will be caught in middleware before any request.
    },
  });
};

export const authRateLimiter = createRateLimiter({
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10),
  message: "Too many login/ register attempts. Please try again later",
});

export const passwordResetRateLimiter = createRateLimiter({
  max: Math.max(3, Math.floor(process.env.RATE_LIMIT_AUTH_MAX / 2)),
  message: "Too many password reset requests. Please try again later."
});
