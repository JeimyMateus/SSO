import { verifyActiveUser, AuthorizationError } from "../server-auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// Mock Firebase Admin
jest.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
  getAdminAuthForProject: jest.fn(),
}));

describe("verifyActiveUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 401 AuthorizationError when Authorization header is missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/me");

    await expect(verifyActiveUser(request)).rejects.toThrow(AuthorizationError);
    await expect(verifyActiveUser(request)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining("Token inválido o ausente"),
    });
  });

  it("should throw 401 AuthorizationError when token is invalid in Firebase Auth", async () => {
    const request = new Request("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer invalid-token" },
    });

    (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Invalid token signature"));

    await expect(verifyActiveUser(request)).rejects.toThrow(AuthorizationError);
    await expect(verifyActiveUser(request)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("should throw 403 AuthorizationError when email is not verified", async () => {
    const request = new Request("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });

    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "unverified@example.com",
      email_verified: false,
    });

    await expect(verifyActiveUser(request)).rejects.toThrow(AuthorizationError);
    await expect(verifyActiveUser(request)).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("correo no está verificado"),
    });
  });

  it("should throw 403 AuthorizationError when user is not found in Firestore", async () => {
    const request = new Request("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });

    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "notfound@example.com",
      email_verified: true,
    });

    const mockGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });
    const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

    await expect(verifyActiveUser(request)).rejects.toThrow(AuthorizationError);
    await expect(verifyActiveUser(request)).rejects.toMatchObject({
      statusCode: 403,
      message: "Tu usuario no está registrado en el sistema.",
    });
  });

  it("should throw 403 AuthorizationError when user exists in Firestore but active is false", async () => {
    const request = new Request("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });

    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "inactive@example.com",
      email_verified: true,
    });

    const mockUserData = {
      id: "usr-1",
      email: "inactive@example.com",
      nombre: "Juan",
      apellidos: "Perez",
      estado: "Inactivo",
      active: false,
    };

    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [{ id: "usr-1", data: () => mockUserData }],
    });
    const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

    await expect(verifyActiveUser(request)).rejects.toThrow(AuthorizationError);
    await expect(verifyActiveUser(request)).rejects.toMatchObject({
      statusCode: 403,
      message: "Tu usuario está inactivo. Contacta con el administrador.",
    });
  });

  it("should throw 403 AuthorizationError when user exists in Firestore but active field is missing or not true", async () => {
    const request = new Request("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });

    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user-123",
      email: "missingactive@example.com",
      email_verified: true,
    });

    const mockUserData = {
      id: "usr-2",
      email: "missingactive@example.com",
      nombre: "Carlos",
      apellidos: "Gomez",
      estado: "Pendiente",
      // active field missing
    };

    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [{ id: "usr-2", data: () => mockUserData }],
    });
    const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

    await expect(verifyActiveUser(request)).rejects.toThrow(AuthorizationError);
    await expect(verifyActiveUser(request)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("should return decodedToken and usuario when user is registered and active === true", async () => {
    const request = new Request("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });

    const mockDecodedToken = {
      uid: "user-123",
      email: "active@example.com",
      email_verified: true,
    };

    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken);

    const mockUserData = {
      id: "usr-3",
      email: "active@example.com",
      nombre: "Maria",
      apellidos: "Lopez",
      estado: "Activo",
      active: true,
    };

    const mockGet = jest.fn().mockResolvedValue({
      empty: false,
      docs: [{ id: "usr-3", data: () => mockUserData }],
    });
    const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

    const result = await verifyActiveUser(request);

    expect(result.decodedToken).toEqual(mockDecodedToken);
    expect(result.usuario).toEqual(mockUserData);
    expect(result.usuario.active).toBe(true);
  });
});
