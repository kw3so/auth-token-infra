import { ConflictError } from "../errors/auth.errors.js";
import {
  createUser,
  findByEmailOrName,
} from "../prismaRepo/user.repository.js";
import { hashPassword } from "../utils/password.utils.js";

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
console.log("service:", user);
  return { user };
};
