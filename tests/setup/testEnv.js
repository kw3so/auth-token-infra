process.env.NODE_ENV = "test";
process.env.LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL;
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
process.env.REFRESH_TOKEN_PEPPER = process.env.REFRESH_TOKEN_PEPPER;
process.env.ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "10m";
process.env.SALT_ROUNDS = process.env.SALT_ROUNDS || 12;

//RATE LIMIT env variables testing space
