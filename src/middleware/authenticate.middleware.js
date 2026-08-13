import { verifyAccessToken } from "../services/token.service.js";
import { UnauthorizedError } from "../errors/auth.errors.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed authorization header");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    req.user = { id: payload.sub, username: payload.name };
    next();
  } catch (err) {
    next(err);
  }
};
