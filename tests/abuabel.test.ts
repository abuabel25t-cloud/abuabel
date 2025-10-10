
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "abuabel";

describe("Abuabel Smart Contract Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
    simnet.initializeThenCallReadOnlyFn(CONTRACT_NAME, "get-total-users", [], deployer);
  });

  describe("Contract Initialization", () => {
    it("should initialize with zero users", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-users", [], deployer);
      expect(result).toBeUint(0);
    });

    it("should not be paused initially", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "is-contract-paused", [], deployer);
      expect(result).toBeBool(false);
    });

    it("should have correct contract owner", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-owner", [], deployer);
      expect(result).toBePrincipal(deployer);
    });
  });

  describe("Profile Management", () => {
    it("should create a new user profile successfully", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        [
          "alice",
          "u\"Software developer passionate about blockchain\"",
          "\"https://alice.dev\"",
          "\"https://avatar.alice.dev/photo.jpg\""
        ],
        wallet1
      );
      expect(result).toBeOk(wallet1);
    });

    it("should retrieve user profile correctly", () => {
      // First create a profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        [
          "alice",
          "u\"Software developer\"",
          "\"https://alice.dev\"",
          "\"https://avatar.alice.dev/photo.jpg\""
        ],
        wallet1
      );

      // Then retrieve it
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-user-profile",
        [wallet1],
        wallet1
      );
      
      expect(result).toBeSome();
    });

    it("should retrieve user profile by username", () => {
      // Create a profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        [
          "alice",
          "u\"Software developer\"",
          "\"https://alice.dev\"",
          "\"https://avatar.alice.dev/photo.jpg\""
        ],
        wallet1
      );

      // Retrieve by username
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-user-profile-by-username",
        ["alice"],
        wallet1
      );
      
      expect(result).toBeSome();
    });

    it("should get principal by username", () => {
      // Create a profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        [
          "alice",
          "u\"Software developer\"",
          "\"https://alice.dev\"",
          "\"https://avatar.alice.dev/photo.jpg\""
        ],
        wallet1
      );

      // Get principal by username
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-principal-by-username",
        ["alice"],
        wallet1
      );
      
      expect(result).toBeSome(wallet1);
    });

    it("should update profile successfully", () => {
      // Create a profile first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        [
          "alice",
          "u\"Software developer\"",
          "\"https://alice.dev\"",
          "\"https://avatar.alice.dev/photo.jpg\""
        ],
        wallet1
      );

      // Update the profile
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-profile",
        [
          "u\"Updated bio: Senior blockchain developer\"",
          "\"https://newalice.dev\"",
          "\"https://avatar.alice.dev/new-photo.jpg\""
        ],
        wallet1
      );
      
      expect(result).toBeOk(wallet1);
    });

    it("should increment total users when creating profiles", () => {
      // Initial count should be 0
      let result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-users", [], deployer);
      expect(result.result).toBeUint(0);

      // Create first profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Bio1\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );

      result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-users", [], deployer);
      expect(result.result).toBeUint(1);

      // Create second profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["bob", "u\"Bio2\"", "\"https://bob.dev\"", "\"avatar2.jpg\""],
        wallet2
      );

      result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-users", [], deployer);
      expect(result.result).toBeUint(2);
    });
  });

  describe("Profile Validation and Error Handling", () => {
    it("should fail to create profile with duplicate username", () => {
      // Create first profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Bio1\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );

      // Try to create profile with same username
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Bio2\"", "\"https://bob.dev\"", "\"avatar2.jpg\""],
        wallet2
      );
      
      expect(result).toBeErr(102); // ERR_USER_ALREADY_EXISTS
    });

    it("should fail to create profile if user already has one", () => {
      // Create first profile
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Bio1\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );

      // Try to create another profile with same user
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice2", "u\"Bio2\"", "\"https://alice2.dev\"", "\"avatar2.jpg\""],
        wallet1
      );
      
      expect(result).toBeErr(102); // ERR_USER_ALREADY_EXISTS
    });

    it("should fail to create profile with empty username", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["\"", "u\"Bio\"", "\"https://test.dev\"", "\"avatar.jpg\""],
        wallet1
      );
      
      expect(result).toBeErr(103); // ERR_INVALID_USERNAME
    });

    it("should fail to update profile if user doesn't exist", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-profile",
        ["u\"New bio\"", "\"https://new.dev\"", "\"new-avatar.jpg\""],
        wallet1
      );
      
      expect(result).toBeErr(101); // ERR_USER_NOT_FOUND
    });
  });

  describe("Social Connections", () => {
    beforeEach(() => {
      // Create two users for connection testing
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Alice's bio\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["bob", "u\"Bob's bio\"", "\"https://bob.dev\"", "\"avatar2.jpg\""],
        wallet2
      );
    });

    it("should connect users successfully", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );
      
      expect(result).toBeOk(true);
    });

    it("should check if users are connected", () => {
      // Connect users first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );

      // Check connection
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "are-users-connected",
        [wallet1, wallet2],
        wallet1
      );
      
      expect(result).toBeBool(true);
    });

    it("should get connection details", () => {
      // Connect users first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );

      // Get connection details
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-connection-details",
        [wallet1, wallet2],
        wallet1
      );
      
      expect(result).toBeSome();
    });

    it("should update connection counts correctly", () => {
      // Connect wallet1 to wallet2
      simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );

      // Check wallet1's following count (should be 1)
      let result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-connection-counts",
        [wallet1],
        wallet1
      );
      expect(result.result).toBeTuple({ followers: "u0", following: "u1" });

      // Check wallet2's follower count (should be 1)
      result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-connection-counts",
        [wallet2],
        wallet1
      );
      expect(result.result).toBeTuple({ followers: "u1", following: "u0" });
    });

    it("should disconnect users successfully", () => {
      // Connect first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );

      // Then disconnect
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "disconnect-from-user",
        [wallet2],
        wallet1
      );
      
      expect(result).toBeOk(true);
    });

    it("should fail to connect to non-existent user", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet3, "\"follow\""],
        wallet1
      );
      
      expect(result).toBeErr(101); // ERR_USER_NOT_FOUND
    });

    it("should fail to connect to self", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet1, "\"follow\""],
        wallet1
      );
      
      expect(result).toBeErr(106); // ERR_CANNOT_CONNECT_TO_SELF
    });

    it("should fail to connect twice to same user", () => {
      // First connection
      simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );

      // Second connection attempt
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "connect-to-user",
        [wallet2, "\"follow\""],
        wallet1
      );
      
      expect(result).toBeErr(105); // ERR_ALREADY_CONNECTED
    });
  });

  describe("Administrative Functions", () => {
    beforeEach(() => {
      // Create a user for admin testing
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Alice's bio\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );
    });

    it("should allow contract owner to verify user", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "verify-user",
        [wallet1],
        deployer
      );
      
      expect(result).toBeOk(true);
    });

    it("should fail verification by non-owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "verify-user",
        [wallet1],
        wallet2
      );
      
      expect(result).toBeErr(100); // ERR_UNAUTHORIZED
    });

    it("should allow contract owner to pause contract", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "pause-contract",
        [],
        deployer
      );
      
      expect(result).toBeOk(true);
      
      // Verify contract is paused
      const pausedResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-contract-paused",
        [],
        deployer
      );
      expect(pausedResult.result).toBeBool(true);
    });

    it("should allow contract owner to unpause contract", () => {
      // Pause first
      simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);
      
      // Then unpause
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "unpause-contract",
        [],
        deployer
      );
      
      expect(result).toBeOk(true);
      
      // Verify contract is unpaused
      const pausedResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-contract-paused",
        [],
        deployer
      );
      expect(pausedResult.result).toBeBool(false);
    });

    it("should prevent operations when contract is paused", () => {
      // Pause contract
      simnet.callPublicFn(CONTRACT_NAME, "pause-contract", [], deployer);
      
      // Try to create profile when paused
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["bob", "u\"Bob's bio\"", "\"https://bob.dev\"", "\"avatar2.jpg\""],
        wallet2
      );
      
      expect(result).toBeErr(100); // ERR_UNAUTHORIZED
    });

    it("should fail admin functions by non-owner", () => {
      let result = simnet.callPublicFn(
        CONTRACT_NAME,
        "pause-contract",
        [],
        wallet1
      );
      expect(result.result).toBeErr(100); // ERR_UNAUTHORIZED
      
      result = simnet.callPublicFn(
        CONTRACT_NAME,
        "unpause-contract",
        [],
        wallet1
      );
      expect(result.result).toBeErr(100); // ERR_UNAUTHORIZED
    });
  });

  describe("Edge Cases and Data Integrity", () => {
    it("should return none for non-existent user profile", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-user-profile",
        [wallet1],
        wallet1
      );
      
      expect(result).toBeNone();
    });

    it("should return none for non-existent username", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-principal-by-username",
        ["nonexistent"],
        wallet1
      );
      
      expect(result).toBeNone();
    });

    it("should return false for non-connected users", () => {
      // Create users but don't connect them
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Alice's bio\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["bob", "u\"Bob's bio\"", "\"https://bob.dev\"", "\"avatar2.jpg\""],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "are-users-connected",
        [wallet1, wallet2],
        wallet1
      );
      
      expect(result).toBeBool(false);
    });

    it("should return default connection counts for new users", () => {
      // Create user
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-profile",
        ["alice", "u\"Alice's bio\"", "\"https://alice.dev\"", "\"avatar1.jpg\""],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-connection-counts",
        [wallet1],
        wallet1
      );
      
      expect(result).toBeTuple({ followers: "u0", following: "u0" });
    });
  });
});
