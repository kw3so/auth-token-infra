import ApiError from "./api.errors.js";

export class ValidationError extends ApiError {
  constructor(message = "Invalid input") {
    super(400, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests - please try again later") {
    super(message, 429);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
