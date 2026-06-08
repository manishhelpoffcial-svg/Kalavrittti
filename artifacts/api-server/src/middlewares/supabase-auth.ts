import type { Request, Response, NextFunction } from "express";

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  next();
}
