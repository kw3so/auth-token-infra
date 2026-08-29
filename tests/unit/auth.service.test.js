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
  /**
   * registerService
   * login service
   * refresh service
   * issueTokenPair
   * Logout service
   *  */
  describe("register", ()=>{
    /**
     * throws an error for existent email
     * throw an error for existent username
     * create a user with a hashed password
     * issue access token
     * issue refresh token
     */
    
    //end of register
  })

  //end of mother test
});
