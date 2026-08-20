import { describe, it, expect, beforeEach, vi } from "vitest";
import * as refreshTokenRepository from "../../src/repositories/refreshtoken.repository.js";
import * as tokenService from "../../src/services/token.service.js";
import * as authError from "../../src/errors/auth.errors.js";

vi.mock("../../src/repositories/refreshtoken.repository.js", () => ({
  createRefreshToken: vi.fn(),
  findByHash: vi.fn(),
  revokeFamily: vi.fn(),
  markRotated: vi.fn(),
  revokeByHash: vi.fn(),
  revokeAllTokensForUser: vi.fn(),
}));

//the mother test
describe("token.service tests", () => {
  //Make sure any mocks made before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //Test issueRefreshToken
  describe("issueRefreshToken", () => {
    //Using it, in the callback we can then compare output to what we expect
    it("creates a token record and returns a raw token string", async () => {
      refreshTokenRepository.createRefreshToken.mockResolvedValue({});
      const userId = "user-id-1";
      //Call function issueRefreshToken
      const rawToken = await tokenService.issueRefreshToken(userId);
      //Compare the output of the function
      expect(typeof rawToken).toBe("string");
      expect(rawToken.length).toBeGreaterThan(0);
      expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledTimes(
        1,
      );
      //Check the stored output and its relation
      const callArgs =
        refreshTokenRepository.createRefreshToken.mock.calls[0][0];
      expect(callArgs.userId).toBe(userId); //
      expect(callArgs.tokenHash).not.toBe(rawToken);
    });
  });
  //Test the rofreshToken part
  describe("rotateRefreshToken", () => {
    it("throws unauthorized if a token is not passed", async () => {
      refreshTokenRepository.findByHash.mockResolvedValue(null);
      const notRawToken = "notOurAuthedToken";
      await expect(
        tokenService.rotateRefreshToken(notRawToken),
      ).rejects.toThrow(authError.UnauthorizedError);
      //We put the await before expect because rejects/resolve receives the promise itself and not the result of the promise
    });
    it("throws Unauthorized when the token is expired", async () => {
      refreshTokenRepository.findByHash.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() - 1000),
        familyId: "family-id-1",
        userId: "user-1",
      });

      await expect(
        tokenService.rotateRefreshToken("expiredToken"),
      ).rejects.toThrow(authError.UnauthorizedError);
    });
    it("revokes the whole family and throws ForbiddenError on reuse of a revoked token", async () => {
      refreshTokenRepository.findByHash.mockResolvedValue({
        revoked: true,
        expiresAt: new Date(Date.now() + 1000),
        familyId: "family-id-1",
        userId: "user-id-1",
      });
      await expect(
        tokenService.rotateRefreshToken("revoked-token"),
      ).rejects.toThrow(authError.ForbiddenError);
      //Make sure the revokeFamily has been called - It is not async because it is just a quick check
      expect(refreshTokenRepository.revokeFamily).toHaveBeenCalledWith(
        "family-id-1",
      );
    });
    it("issue a new token, marks the old one rotated on success and newRawTokenHash is stored", async () => {
      refreshTokenRepository.findByHash.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() + 1000),
        familyId: "family-id-1",
        userId: "user-id-1",
      });
      refreshTokenRepository.createRefreshToken.mockResolvedValue({});
      refreshTokenRepository.markRotated.mockResolvedValue({});

      //I want to check args pased into createRefreshToken because is where the new hashed token should be stored. We always store a tokenHash.

      const result = await tokenService.rotateRefreshToken("valid-token");

      expect(result.userId).toBe("user-id-1");
      expect(typeof result.rawToken).toBe("string");
      expect(refreshTokenRepository.markRotated).toHaveBeenCalledTimes(1);
      expect(refreshTokenRepository.markRotated).toHaveBeenCalledTimes(1);

      const createTokenArgs =
        refreshTokenRepository.createRefreshToken.mock.calls[0][0];

      expect(createTokenArgs.tokenHash).not.toBe(result.rawToken);
    });
  });
  describe("revokeRefreshToken", () => {
    it("is idempotent - does nothing but does not throw if the token is unknown", async () => {
      refreshTokenRepository.findByHash.mockResolvedValue(null);
      await expect(
        tokenService.revokeRefreshToken("unknown-token"),
      ).resolves.toBeUndefined();
      expect(refreshTokenRepository.revokeByHash).not.toHaveBeenCalled(); //There is a check before calling the hash with an unkown token.
    });
  });
  describe("generateAccessToken", () => {
    it("generate access token by userId and username", () => {
      const tokenGenerated = tokenService.generateAccessToken({
        userId: "user-id-1",
        username: "username",
      });

      expect(typeof tokenGenerated).toBe("string");
    });
  });
  describe("verifyAccessToken", () => {
    it("throws an UnauthorizedError if the token is invalid", () => {
      //Using toThrow requires to be wrapped. For that the function either needs to be awaited or use the sync throw pattern 
      expect(() => tokenService.verifyAccessToken("Invalid token")).toThrow(
        authError.UnauthorizedError,
      );
    });
  });
  describe("revokeAllUserTokens",()=>{
    it("revokes all User Tokens across the logins", async()=>{
      await tokenService.revokeAllUserTokens("user-id")

      expect(refreshTokenRepository.revokeAllTokensForUser).toHaveBeenCalledTimes(1)
    })
  })
  //end of mother test
});
