import { vi, describe, test, expect, beforeEach } from "vitest";

import * as PasswordResetTokenRepository from "../../src/repositories/passwordResetToken.repository.js";
import * as UserRepository from "../../src/repositories/user.repository.js";
import * as CryptoUtils from "../../src/utils/crypto.utils.js";
import * as AuthError from "../../src/errors/auth.errors.js";
import * as PasswordResetService from "../../src/services/passwordReset.service.js";
import { hashPassword } from "../../src/utils/password.utils.js";
import { revokeAllTokensForUser } from "../../src/repositories/refreshtoken.repository.js";

vi.mock("../../src/repositories/user.repository.js", () => ({
  findByEmail: vi.fn(),
  updatePassword: vi.fn(),
}));
vi.mock("../../src/repositories/passwordResetToken.repository.js", () => ({
  create: vi.fn(),
  findByHash: vi.fn(),
  markUsed: vi.fn(),
  invalidateAllForUser: vi.fn(),
}));
vi.mock("../../src/repositories/refreshtoken.repository.js", () => ({
  revokeAllTokensForUser: vi.fn(),
}));
vi.mock("../../src/utils/crypto.utils.js", () => ({
  generateTokenHash: vi.fn(),
  generateRawToken: vi.fn(),
}));
vi.mock("../../src/utils/password.utils.js", () => ({
  hashPassword: vi.fn(),
}));
vi.mock("../../src/services/email.service.js", () => ({
  emailService: vi.fn().mockResolvedValue(true),
}));

describe("passwordReset.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requestPasswordReset", () => {
    test("No throw or error if user doesn't exist", async () => {
      UserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        PasswordResetService.requestPasswordReset("not-Stored@email.com"),
      ).resolves.toBeUndefined();
    });

    test("invalidates previous reset tokens, and creates a new entry ", async () => {
      //Arrange
      UserRepository.findByEmail.mockResolvedValue({
        id: "user-id-1",
      });
      CryptoUtils.generateRawToken.mockReturnValue("reset-token");
      CryptoUtils.generateTokenHash.mockResolvedValue("reset-token-hash");
      PasswordResetTokenRepository.invalidateAllForUser.mockResolvedValue({});
      //If I am not using the function out put, anything pouring into it is not needed for mocking - create and relation to generateRawToken and its hash.
      PasswordResetTokenRepository.create.mockResolvedValue({});

      //Act
      await PasswordResetService.requestPasswordReset("user@email.com");

      //Assert
      expect(
        PasswordResetTokenRepository.invalidateAllForUser,
      ).toHaveBeenCalledWith("user-id-1");
      expect(CryptoUtils.generateRawToken).toHaveBeenCalled();
      expect(CryptoUtils.generateTokenHash).toHaveBeenCalled();
      expect(PasswordResetTokenRepository.create).not.toHaveBeenCalledWith({
        tokenHash: "reset-token",
      });
    });
  });

  describe("resetPassword", () => {
    test("throw unauthorized if the token is not present", async () => {
      PasswordResetTokenRepository.findByHash.mockResolvedValue(null);

      await expect(
        PasswordResetService.resetPassword("no-token", "user@email.com"),
      ).rejects.toThrow(AuthError.UnauthorizedError);
      expect(UserRepository.updatePassword).not.toHaveBeenCalled();
      expect(PasswordResetTokenRepository.markUsed).not.toHaveBeenCalled();
    });
    test("throw unauthorized if the token is used", async () => {
      PasswordResetTokenRepository.findByHash.mockResolvedValue({
        used: true,
      });
      await expect(
        PasswordResetService.resetPassword("used-token", "user@email.com"),
      ).rejects.toThrow(AuthError.UnauthorizedError);
    });
    test("throw unauthorized if the token is expired", async () => {
      PasswordResetTokenRepository.findByHash.mockResolvedValue({
        expiresAt: new Date(Date.now() - 10000),
      });
      await expect(
        PasswordResetService.resetPassword("expired-token", "user@email.com"),
      ).rejects.toThrow(AuthError.UnauthorizedError);
    });
    test("create a new passwordHash, update user password, mark token as used and revokes all session on success", async () => {
      PasswordResetTokenRepository.findByHash.mockResolvedValue({
        userId: "user-id-1",
      });
      hashPassword.mockResolvedValue("hashed-secret123");
      PasswordResetTokenRepository.markUsed.mockResolvedValue(true);
      UserRepository.updatePassword.mockResolvedValue({});
      revokeAllTokensForUser.mockResolvedValue({});
      CryptoUtils.generateTokenHash.mockResolvedValue("valid-token-hashed");
      //Act
      const passwordResetArgs = {
        rawToken: "valid-token",
        newPassword: "secret123",
      };
      await PasswordResetService.resetPassword(passwordResetArgs);

      //Assertions
      expect(PasswordResetTokenRepository.findByHash).toHaveBeenCalledWith(
        "valid-token-hashed",
      );
      expect(hashPassword).toHaveBeenCalledWith("secret123");
      expect(UserRepository.updatePassword).toHaveBeenCalledWith({
        userId: "user-id-1",
        newPasswordHash: "hashed-secret123",
      });
      expect(PasswordResetTokenRepository.markUsed).toHaveBeenCalledWith(
        "valid-token-hashed",
      );
      expect(revokeAllTokensForUser).toHaveBeenCalledWith("user-id-1");
    });
  });

  //Mother test
});
