import { POST } from "../route";
import { verifyAuthToken } from "@/lib/auth/server-auth";
import { createAndSaveOTP } from "@/lib/auth/otp-service";
import { sendOTPEmail } from "@/lib/email/email-service";

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
  createAndSaveOTP: jest.fn(),
}));

jest.mock("@/lib/email/email-service", () => ({
  sendOTPEmail: jest.fn(),
}));

describe("POST /api/auth/send-otp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    const { AuthorizationError } = jest.requireMock("@/lib/auth/server-auth");
    (verifyAuthToken as jest.Mock).mockRejectedValue(
      new AuthorizationError("No autorizado", 401, "MISSING_TOKEN")
    );

    const request = new Request("http://localhost:3000/api/auth/send-otp", {
      method: "POST",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain("No autorizado");
  });

  it("should return 400 if token has no email", async () => {
    (verifyAuthToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: undefined,
    });

    const request = new Request("http://localhost:3000/api/auth/send-otp", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("correo");
  });

  it("should generate OTP, send email, and return 200 on success", async () => {
    (verifyAuthToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "docente@mineduc.gob.gt",
    });

    (createAndSaveOTP as jest.Mock).mockResolvedValue({
      otp: "654321",
      expiresAt: new Date(Date.now() + 300000),
    });

    (sendOTPEmail as jest.Mock).mockResolvedValue({
      messageId: "msg-123",
    });

    const request = new Request("http://localhost:3000/api/auth/send-otp", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/código/i);
    expect(createAndSaveOTP).toHaveBeenCalledWith("docente@mineduc.gob.gt");
    expect(sendOTPEmail).toHaveBeenCalledWith("docente@mineduc.gob.gt", "654321");
  });
});
