import request from "supertest";
import app from "../../src/app.js";
import * as AuthService from "../../src/services/auth.service.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { UnauthorizedError } from "../../src/errors/auth.errors.js";

vi.mock("../../src/services/auth.service.js", () => ({
  registerService: vi.fn(),
  loginService: vi.fn(),
  refreshService: vi.fn(),
  logoutService: vi.fn(),
}));

describe("Auth routes integration testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    test("returns 201, a user and pair token on success", async () => {
      AuthService.registerService.mockResolvedValue({
        user: {
          email: "user@email.com",
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      const res = await request(app).post("/api/auth/register").send({
        username: "named-user",
        email: "user@email.com",
        password: "secret123",
      });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("user@email.com");
      expect(res.body.accessToken).toBe("access-token");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("return 400 if username, email, or password is not provided", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "user@email.com" });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required fields/i);
      expect(AuthService.registerService).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    /**
     * success
     * no user exists
     * wrong password
     */
    test("returns 200, a user and an access token with refreshToken as cookie", async () => {
      AuthService.loginService.mockResolvedValue({
        user: {
          id: "user-id-1",
          email: "user@email.com",
        },
        accessToken: "access-token",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "user@email.com",
        password: "secret123",
      });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("access-token");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("returns 400 if no email or password passed", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/i);
    });

    test("returns 401 if login password is incorrect", async () => {
      //The login service rejects, not the compare password. Therefore we should have the loginService return a rejection.
      AuthService.loginService.mockRejectedValue(
        new UnauthorizedError("Invalid email or password"),
      );

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@email.com", password: "wrongPassword" });

      expect(res.status).toBe(401); //unauthorised
    });

    test("returns 400 if the user is not registered", async () => {
      AuthService.loginService.mockRejectedValue(
        new UnauthorizedError("invalid email or password"),
      );

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "unreg@email.com", password: "secret123" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    test("returns 400 if there's no token parsed in the header of the request ", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/token missing/i);
    });

    test("returns 200 and an access token as well as cookie set", async () => {
      AuthService.refreshService.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", ["refreshToken=refresh-token-from-header"]);

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("POST /api/auth/logout", () => {
    test("clear the cookie header from the request", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", ["refreshToken=refresh-token"]);

      expect(res.status).toBe(204);
    });
  });
});
