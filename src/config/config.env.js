export const APP_ENV = process.env.APP_ENV;
export const NODE_ENV = process.env.NODE_ENV;
export const DATABASE_URL = process.env.DATABASE_URL;
export const APP_URL = process.env.APP_URL;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_TTL_MINUTES = parseInt(
  process.env.ACCESS_TOKEN_TTL_MINUTES,
  10,
);
export const REFRESH_TOKEN_PEPPER = process.env.REFRESH_TOKEN_PEPPER;
export const REFRESH_TOKEN_TTL_DAYS = parseInt(
  process.env.REFRESH_TOKEN_TTL_DAYS,
  10,
);
// - authController,
export const SALT_ROUNDS = process.env.SALT_ROUNDS;
export const PASSWORD_RESET_TTL_MINUTES =
  process.env.PASSWORD_RESET_TTL_MINUTES;
export const AUTH_RATE_LIMIT_WINDOW_MINUTES =
  process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES;
export const AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX;
export const PORT = process.env.PORT;

