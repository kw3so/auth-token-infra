import ApiError from "./ApiError.js";

export class ValidationError extends ApiError {
  constructor(message = "Invalid input") {
    super(400, message);
  }
}


