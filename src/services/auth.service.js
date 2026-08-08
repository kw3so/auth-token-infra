import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../errors/auth.errors.js";
import {
  createUser,
  findByEmail,
  findByEmailOrName,
} from "../prismaRepo/user.repository.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";
import { createRefreshToken } from "../prismaRepo/refreshtoken.repository.js";
import crypto from "crypto";

export const registerService = async (
  username,
  phoneNumber,
  email,
  password,
) => {
  const userExists = await findByEmailOrName(username, email);
  if (userExists) {
    throw new ConflictError("Username or email is already in use.");
  }
  //- hash the password
  const passwordHashed = await hashPassword(password);
  //- build the user in db
  const user = await createUser({
    username,
    phoneNumber,
    email,
    password: passwordHashed,
  });
  return { user };
};

export const loginService = async (email, password) => {
  const userExist = await findByEmail(email);
  if (!userExist) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const passwordMatches = await comparePassword(password, userExist.password);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const { password: _pw, ...user } = userExist;
  const { accessToken, refreshToken } = await issueTokenPairFor(user);

  return { user, accessToken, refreshToken };
};

//Issue tokens for a freshly successfully auth/registered user
const issueTokenPairFor = async (user) => {
  //Access token
  const accessToken = jwt.sign(
    { sub: user.id, name: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES_IN },
  );

  //Refresh token
  const refreshToken = await issueRefreshToken(user.id);
  console.log(`Refresh: ${refreshToken}, Access: ${accessToken}`);

  return { accessToken, refreshToken };
};
//Refresh token
const issueRefreshToken = async (userId) => {
  const pepper = process.env.REFRESH_TOKEN_PEPPER;
  const refreshExpiration = parseInt(process.env.REFRESH_EXPIRES_IN, 10);
  //Token is a random string
  const rawToken = crypto.randomBytes(64).toString("hex");

  //Create a Hash, peppered to store in the db
  const rawTokenHash = crypto
    .createHmac("sha256", pepper)
    .update(rawToken)
    .digest("hex");
  //This is called only once during the auth session. Grouping purpose
  const familyId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + refreshExpiration * 24 * 60 * 60 * 1000,
  );

  //Store the token in db
  await createRefreshToken({
    tokenHash: rawTokenHash,
    userId,
    familyId,
    expiresAt,
  });

  return rawToken;
};
