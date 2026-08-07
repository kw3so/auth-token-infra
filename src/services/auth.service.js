import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../errors/auth.errors.js";
import {
  createUser,
  findByEmail,
  findByEmailOrName,
} from "../prismaRepo/user.repository.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";

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
  const accessToken = await issueTokenPairFor(user);

  return { user, accessToken };
};

//Issue tokens for a freshly successfully auth/registered user
const issueTokenPairFor = (user) => {
  //Access token
  const generateToken = jwt.sign(
    { sub: user.id, name: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES_IN },
  );

  return generateToken;
};
