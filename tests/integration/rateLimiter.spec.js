//IMPORTS
import request from "supertest";
import app from "../../src/app.js";
import * as AuthService from "../../src/services/auth.service.js";
import * as PasswordResetService from "../../src/services/passwordReset.service.js";
import { UnauthorizedError } from "../../src/errors/auth.errors.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

//MOCKS
vi.mock("../../src/services/auth.service.js", () => ({
  loginService: vi.fn(),
}));
vi.mock("../../src/services/passwordReset.service.js", () => ({
  requestPasswordReset: vi.fn(),
}));

//Tests
describe("RateLimiting on auth endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("rate limiting on /api/auth", () => {
    test("allows requests under the limit through to the service, then blocks anything after with 429", async () => {
      AuthService.loginService.mockRejectedValue(
        new UnauthorizedError("Invalid email or password"),
      );

      const max = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10);
      

      for (let i = 0; i < max; i++) {
        const res = await request(app).post("/api/auth/login").send({
          email: "unregUser@email.com",
          password: "aWrongPassword",
        });
        expect(res.status).toBe(401); //Unauthorized
      }

      const blockedRes = await request(app).post("/api/auth/login").send({
        email: "unregUser@email.com",
        password: "aWrongPassword",
      });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.error).toMatch(/too many/i);
      expect(AuthService.loginService).toHaveBeenCalledTimes(max);
    });

    test("rate limit on forgot password", async () => {
      PasswordResetService.requestPasswordReset.mockResolvedValue();
      const max = Math.floor(parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10)/2);

      for (let i = 0; i < max; i++) {
        const res = await request(app)
          .post("/api/auth/forgot-password")
          .send({ email: "withinLimit@email.com" });
        expect(res.status).toBe(200);
      }
      const blockedRes = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "outLimit@email.com" });
      expect(blockedRes.status).toBe(429);
      expect(PasswordResetService.requestPasswordReset).toHaveBeenCalledTimes(
        max,
      );
      expect(PasswordResetService.requestPasswordReset).toHaveBeenCalledWith(
        "withinLimit@email.com",
      );
      expect(
        PasswordResetService.requestPasswordReset,
      ).not.toHaveBeenCalledWith("outLimit@email.com");
    });
  });
});
