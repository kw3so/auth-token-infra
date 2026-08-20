import { describe, expect, beforeEach, vi, it } from "vitest";
import * as userRepository from "../../src/repositories/user.repository.js";
import * as authService from "../../src/services/auth.service.js";
import * as authError from "../../src/errors/auth.errors";

vi.mock("../../src/repositories/user.repository.js", () => ({
  findByEmail: vi.fn(),
  findByEmailOrName: vi.fn(),
  createUser: vi.fn(),
  findById: vi.fn(),
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throw conflictError if register email or username already exists", async () => {
    userRepository.findByEmailOrName.mockResolvedValue({
      username: "user-1-name",
      email: "user@email.com",
    });

    await expect(
      authService.registerService({
        username: "user-1-name",
        email: "user@email.com",
        password: "userPassword",
      }),
    ).rejects.toThrow(authError.ConflictError);
  });
  //end of mother test
});
