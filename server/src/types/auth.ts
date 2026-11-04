export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
    }
  }
}

