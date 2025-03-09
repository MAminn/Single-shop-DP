export interface Session {
  id: string;
  token: string;
  expiresAt: Date;
}

export interface Permission<Tag extends string> {
  id: string;
  tag: Tag;
  userId: string;
}

export interface UserPermissions<Tags extends string> {
  permissions: Permission<Tags>[];
}

export interface User {
  id: string;
  email: string;
  passwordDigest: string;
  role: "admin" | "shopper" | "vendor";
}
