import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../errors/auth.errors.js";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import {
  createUser,
  findByEmail,
  findByEmailOrName,
} from "../prismaRepo/user.repository.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";
import { loginService, registerService } from "../services/auth.service.js";

export const registerController = async (req, res, next) => {
  try {
    const { username, phoneNumber, email, password } = req.body;

    if (!username || !email || !password) {
      throw new ValidationError("Provide all required fields");
    }

    // res.status(200).json({ username });
    //registerService
    //check if user already exists
    const { user } = await registerService(
      username,
      phoneNumber,
      email,
      password,
    );
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Provide all required fields");
    }
    const user = await loginService(email, password);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
