export interface ClientSession {
  token: string;
  email: string;
  expiresAt: Date;
  role: "admin" | "vendor" | "user";
  vendorId?: string;
}
