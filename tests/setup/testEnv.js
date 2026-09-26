process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL;
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
process.env.REFRESH_TOKEN_PEPPER = process.env.REFRESH_TOKEN_PEPPER;
process.env.ACCESS_TOKEN_TTL_MINUTES = process.env.ACCESS_TOKEN_TTL_DAYS|| "10";
process.env.SALT_ROUNDS = process.env.SALT_ROUNDS || 12;

//RATE LIMIT env variables testing space
process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES = "1"; //1 minute

process.env.AUTH_RATE_LIMIT_MAX = "5"; //making this smaller so we can quickly test

//test auth routes
process.env.REFRESH_TOKEN_TTL_DAYS=10
process.env.RESEND_KEY = process.env.RESEND_API_KEY