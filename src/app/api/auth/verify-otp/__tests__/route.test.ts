import { POST } from "../route";
import { verifyAuthToken } from "@/lib/auth/server-auth";
import { verifyOTP } from "@/lib/auth/otp-service";
import { adminAuth } from "@/lib/firebase/admin";

jest.mock("@/lib/auth/server-auth", () => ({
  verifyAuthToken: jest.fn(),
  AuthorizationError: class AuthorizationError extends Error {
    statusCode: number;
    code?: string;
    constructor(message: string, statusCode = 403, code?: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  },
}));

jest.mock("@/lib/auth/otp-service", () => ({
  verifyOTP: jest.fn(),
}));

jest.mock("@/lib/firebase/admin", () => {
  const mockAuth = {
    setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
    updateUser: jest.fn().mockResolvedValue(undefined),
  };
  return {
    adminAuth: mockAuth,
    getAdminAuthForProject: jest.fn().mockReturnValue(mockAuth),
  };
});

describe("POST /api/auth/verify-otp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    const { AuthorizationError } = jest.requireMock("@/lib/auth/server-auth");
    (verifyAuthToken as jest.Mock).mockRejectedValue(
      new AuthorizationError("No autorizado", 401, "MISSING_TOKEN")
    );

    const request = new Request("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ code: "123456" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain("No autorizado");
  });

  it("should return 400 if code is missing or not 6 digits", async () => {
    (verifyAuthToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "docente@mineduc.gob.gt",
    });

    const request = new Request("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ code: "12" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/6 dígitos/i);
  });

  it("should return 400 if verifyOTP returns failure", async () => {
    (verifyAuthToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "docente@mineduc.gob.gt",
    });

    (verifyOTP as jest.Mock).mockResolvedValue({
      success: false,
      error: "Código incorrecto.",
    });

    const request = new Request("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ code: "123456" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Código incorrecto.");
  });

  it("should set custom claim twoFactorVerified: true and return 200 on success", async () => {
    (verifyAuthToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "docente@mineduc.gob.gt",
    });

    (verifyOTP as jest.Mock).mockResolvedValue({
      success: true,
    });

    (adminAuth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

    const request = new Request("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ code: "123456" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(adminAuth.setCustomUserClaims).toHaveBeenCalledWith("user-123", {
      twoFactorVerified: true,
    });
  });
});
