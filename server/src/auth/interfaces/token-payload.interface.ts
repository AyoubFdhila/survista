export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: string; // Role is a string type enum 
  jti?: string; // JWT ID, optional for access tokens, mandatory for refresh
  iat?: number;
  exp?: number;
}