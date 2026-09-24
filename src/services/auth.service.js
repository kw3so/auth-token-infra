import { ConflictError, UnauthorizedError } from "../errors/auth.errors.js";
import {
  createUser,
  findByEmail,
  findByEmailOrName,
  findById,
} from "../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";
import {
  generateAccessToken,
  issueRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from "./token.service.js";

export const registerService = async ({
  username,
  phoneNumber,
  email,
  password,
}) => {
  const userExists = await findByEmailOrName({ username, email });
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
  // const { accessToken, refreshToken } = await issueTokenPairFor(user);
  // return { user, accessToken, refreshToken };
  //The above commented code returned the password so we outsourced the solution
  return issueTokenPairFor(user);
};

export const loginService = async ({ email, password }) => {
  const userExist = await findByEmail(email);
  if (!userExist) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const passwordMatches = await comparePassword(password, userExist.password);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }
  // const { password: _pw, ...user } = userExist;
  // const { accessToken, refreshToken } = await issueTokenPairFor(user);

  // return { user, accessToken, refreshToken };
  return issueTokenPairFor(userExist);
};

export const refreshService = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new UnauthorizedError("Invalid token or token not present");
  }
  const { rawToken, userId } = await rotateRefreshToken(rawRefreshToken);
  const user = await findById(userId);
  const accessToken = generateAccessToken({
    userId: user.id,
    username: user.username,
  });
  return { accessToken, refreshToken: rawToken };
};

export const logoutService = async (rawRefreshToken) => {
  await revokeRefreshToken(rawRefreshToken);
};

const issueTokenPairFor = async (user) => {
  //generateAccessToken
  const accessToken = generateAccessToken({
    userId: user.id,
    username: user.username,
  });

  //Refresh token
  const refreshToken = await issueRefreshToken(user.id);

  //get safeUser
  const { password: _pw, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
};
