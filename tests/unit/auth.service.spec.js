import { describe, expect, beforeEach, vi, test } from "vitest";
import * as userRepository from "../../src/repositories/user.repository.js";
import * as authService from "../../src/services/auth.service.js";
import * as authError from "../../src/errors/auth.errors.js";
import * as passwordUtils from "../../src/utils/password.utils.js";
import * as tokenService from "../../src/services/token.service.js";

vi.mock("../../src/repositories/user.repository.js", () => ({
  findByEmail: vi.fn(),
  findByEmailOrName: vi.fn(),
  createUser: vi.fn(),
  findById: vi.fn(),
}));
vi.mock("../../src/utils/password.utils.js", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));
vi.mock("../../src/services/token.service.js", () => ({
  generateAccessToken: vi.fn(),
  issueRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    test("throw ConflictError if email is used", async () => {
      userRepository.findByEmailOrName.mockResolvedValue({
        username: "existing-user",
        email: "existing-user@email.com",
      });
      const newUser = {
        username: "new-user",
        phoneNumber: "0909090",
        email: "existing-user@email.com",
        password: "secret123",
      };
      await expect(authService.registerService(newUser)).rejects.toThrow(
        authError.ConflictError,
      );
    });

    test("throw ConflictError if username is used", async () => {
      userRepository.findByEmailOrName.mockResolvedValue({
        username: "existing-user",
        email: "existing-user@email.com",
      });
      const newUser = {
        username: "existing-user",
        phoneNumber: "0909090",
        email: "new-user@email.com",
        pasword: "secret123",
      };
      await expect(authService.registerService(newUser)).rejects.toThrow(
        authError.ConflictError,
      );
    });

    test("create user, issuetokenpair() is called and a token is received", async () => {
      //Mocks first
      userRepository.findByEmailOrName.mockResolvedValue(null);
      passwordUtils.hashPassword.mockResolvedValue("hashed-password");
      userRepository.createUser.mockResolvedValue({
        id: "user-id-1",
        username: "new-user",
        email: "user@email.com",
        password: "hashed-password",
      });

      tokenService.generateAccessToken.mockReturnValue("access-token");
      tokenService.issueRefreshToken.mockReturnValue("refresh-token");

      //Assign result of function call
      const newUser = {
        username: "new-user",
        phoneNumber: "0909090",
        email: "user@email.com",
        password: "secret123", //mocked value will assume this as hashed password
      };
      const newUserCalled = {
        username: "new-user",
        phoneNumber: "0909090",
        email: "user@email.com",
        password: "hashed-password", //mocked value will assume this as hashed password
      };

      const result = await authService.registerService(newUser);
      //Assert
      expect(userRepository.createUser).toHaveBeenCalledWith(newUserCalled);

      expect(result.user.password).toBeUndefined();
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    //register
  });

  describe("login service", () => {
    test("throw Unauthorised if the email is not available", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const userLogin = {
        email: "existing-user@email.com",
        password: "secret123",
      };
      await expect(authService.loginService(userLogin)).rejects.toThrow(
        authError.UnauthorizedError,
      );
    });

    test("throw unauthorised error if the password doesn't match", async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: "user-1",
        email: "user@email.com",
        password: "hashed-password",
      });
      const userLogin = {
        email: "user@email.com",
        password: "wrong-password",
      };
      passwordUtils.comparePassword.mockResolvedValue(false);
      await expect(authService.loginService(userLogin)).rejects.toThrow(
        authError.UnauthorizedError,
      );
    });

    test("issue tokens for a successful login", async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: "user-id-1",
        email: "user@email.com",
        password: "hashed-password",
      });
      const userLogin = {
        email: "user@email.com",
        password: "secret123",
      };
      passwordUtils.comparePassword.mockResolvedValue(true);
      tokenService.generateAccessToken.mockReturnValue("access-token");
      tokenService.issueRefreshToken.mockResolvedValue("refresh-token");

      const result = await authService.loginService(userLogin);
      //Assertions
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    //login
  });
  describe("refresh Service", () => {
    test("Throws unauthorised if token is not present", async () => {
      await expect(authService.refreshService(null)).rejects.toThrow(
        authError.UnauthorizedError,
      );
    });

    test("Calls rotateRefreshToken() and returns accessToken and refreshToken", async () => {
      //Arrange
      userRepository.findById.mockResolvedValue({
        id: "user-id-1",
        username: "named-user",
      });
      tokenService.rotateRefreshToken.mockResolvedValue({
        rawToken: "rotated-token",
        userId: "user-id-1",
      });
      tokenService.generateAccessToken.mockReturnValue("access-token");

      //Act
      const result = await authService.refreshService("raw-token");

      //Asset
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("rotated-token");

      expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith("raw-token");
      expect(userRepository.findById).toHaveBeenCalledWith("user-id-1");
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        userId: "user-id-1",
        username: "named-user",
      });
    });
  });

  //mother test
});
