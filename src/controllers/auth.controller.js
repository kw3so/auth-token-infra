import { ValidationError } from "../errors/auth.errors.js";

export const registerController = (req, res) => {
  const { username, phoneNumber, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ValidationError("Provide all required fields");
  }

  res.status(200).json({ username });
  //registerService
};
