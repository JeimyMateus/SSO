import {
  generateOTP,
  hashOTP,
  createAndSaveOTP,
  verifyOTP,
  OTPVerificationResult,
} from "../otp-service";
import { adminDb } from "@/lib/firebase/admin";

jest.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

describe("OTP Service", () => {
  describe("generateOTP", () => {
    it("should generate a 6-digit numeric string", () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("should generate different codes on subsequent calls", () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      expect(otp1).not.toEqual(otp2);
    });
  });

  describe("hashOTP", () => {
    it("should return consistent SHA-256 hash", () => {
      const hash1 = hashOTP("123456");
      const hash2 = hashOTP("123456");
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe("createAndSaveOTP", () => {
    let mockDocSet: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockDocSet = jest.fn().mockResolvedValue(undefined);
      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: mockDocSet,
        }),
      });
    });

    it("should save OTP with 5-minute TTL and normalized email", async () => {
      const email = "USER@Example.COM ";
      const result = await createAndSaveOTP(email);

      expect(result.otp).toHaveLength(6);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(mockDocSet).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@example.com",
          attempts: 0,
          verified: false,
        })
      );
    });
  });

  describe("verifyOTP", () => {
    let mockDocGet: jest.Mock;
    let mockDocUpdate: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockDocGet = jest.fn();
      mockDocUpdate = jest.fn().mockResolvedValue(undefined);

      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockDocGet,
          update: mockDocUpdate,
        }),
      });
    });

    it("should return error if no OTP record exists", async () => {
      mockDocGet.mockResolvedValue({ exists: false });

      const result = await verifyOTP("user@example.com", "123456");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/no se encontró/i);
    });

    it("should return error if OTP is expired", async () => {
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => ({
          email: "user@example.com",
          codeHash: hashOTP("123456"),
          expiresAt: { toDate: () => new Date(Date.now() - 10000) }, // 10s in the past
          attempts: 0,
          maxAttempts: 5,
          verified: false,
        }),
      });

      const result = await verifyOTP("user@example.com", "123456");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/expirado/i);
    });

    it("should return error if max attempts exceeded", async () => {
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => ({
          email: "user@example.com",
          codeHash: hashOTP("123456"),
          expiresAt: { toDate: () => new Date(Date.now() + 60000) },
          attempts: 5,
          maxAttempts: 5,
          verified: false,
        }),
      });

      const result = await verifyOTP("user@example.com", "123456");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/demasiados intentos/i);
    });

    it("should increment attempts and fail if code is incorrect", async () => {
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => ({
          email: "user@example.com",
          codeHash: hashOTP("123456"),
          expiresAt: { toDate: () => new Date(Date.now() + 60000) },
          attempts: 1,
          maxAttempts: 5,
          verified: false,
        }),
      });

      const result = await verifyOTP("user@example.com", "999999");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/código incorrecto/i);
      expect(mockDocUpdate).toHaveBeenCalledWith({ attempts: 2 });
    });

    it("should succeed and mark verified if code is correct", async () => {
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => ({
          email: "user@example.com",
          codeHash: hashOTP("123456"),
          expiresAt: { toDate: () => new Date(Date.now() + 60000) },
          attempts: 0,
          maxAttempts: 5,
          verified: false,
        }),
      });

      const result = await verifyOTP("user@example.com", "123456");
      expect(result.success).toBe(true);
      expect(mockDocUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: true,
        })
      );
    });
  });
});
