import { ConflictError, ValidationError } from "../errors/auth.errors.js";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";

export const registerController = async (req, res) => {
  const { username, phoneNumber, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ValidationError("Provide all required fields");
  }

  // res.status(200).json({ username });
  //registerService
  //check if user already exists
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
      // email
    },
  });
  if (userExists) {
    throw new ConflictError("Username or password is already in use.");
  }
  //- hash the password
  const hashPassword = await bcrypt.hash(password, 12);
  //- build the user in db
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });
  //-
  return res.status(201).json({
    data: {
      user,
    },
  });
};
