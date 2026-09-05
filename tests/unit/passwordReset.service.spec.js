import { vi, describe, test, expect, beforeEach } from "vitest";

import * as passwordResetTokenRepository from "../../src/repositories/passwordResetToken.repository.js";
import * as userRepository from "../../src/repositories/user.repository.js";
import * as cryptoUtils from "../../src/utils/crypto.utils.js";
import * as AuthError from "../../src/errors/auth.errors.js";

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
vi.mock("../../src/utils/password.utils.js", () => ({
  generateTokenHash: vi.fn(),
  generateRawToken: vi.fn(),
}));

describe("passwordReset.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requestPasswordReset", () => {
    test.todo("No throw or error if user doesn't exist", () => {});
    test.todo(
      "invalidates all the previous reset Tokens, and creates a new entry ",
      () => {},
    );
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
