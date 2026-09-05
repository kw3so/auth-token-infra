import { vi, describe, test, expect, beforeEach } from "vitest";

import * as PasswordResetTokenRepository from "../../src/repositories/passwordResetToken.repository.js";
import * as UserRepository from "../../src/repositories/user.repository.js";
import * as CryptoUtils from "../../src/utils/crypto.utils.js";
import * as AuthError from "../../src/errors/auth.errors.js";
import * as PasswordResetService from "../../src/services/passwordReset.service.js";

vi.mock("../../src/repositories/user.repository.js", () => ({
  findByEmail: vi.fn(),
}));
vi.mock("../../src/repositories/passwordResetToken.repository.js", () => ({
  create: vi.fn(),
  findByHash: vi.fn(),
  markUsed: vi.fn(),
  invalidateAllForUser: vi.fn(),
}));
vi.mock("../../src/services/token.repository.js", () => ({
  revokeAllTokensForUser: vi.fn(),
}));
vi.mock("../../src/utils/crypto.utils.js", () => ({
  generateTokenHash: vi.fn(),
  generateRawToken: vi.fn(),
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
    test.only("invalidates previous reset tokens, and creates a new entry ", async () => {
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
    test.todo("throw unauthorized if the token is not present", () => {});
    test.todo("throw unauthorized if the token is used", () => {});
    test.todo("throw unauthorized if the token is expired", () => {});
    test.todo(
      "create a new passwordHash, update user password, mark token as used and revokes all session on success",
      () => {},
    );
  });

  //Mother test
});
