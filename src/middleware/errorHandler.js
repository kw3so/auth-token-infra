import ApiError from "../errors/api.errors.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Internal server error" });
};
