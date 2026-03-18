import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "fazenda-sao-bento-secret-2024";

export function hashPassword(password: string): string {
  return password; // No hashing in mock mode
}

export function comparePassword(password: string, hash: string): boolean {
  return password === hash;
}

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}

// Usuário Mock padrão para autenticação
const MOCK_USER = {
  id: 1,
  name: "Administrador Demo",
  email: "admin@fazenda.com",
  role: "admin",
  createdAt: new Date().toISOString()
};

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const _payload = verifyToken(token);
    // No modo mockup, aceitamos o token e injetamos o usuário demo
    (req as any).user = MOCK_USER;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    return;
  }
  next();
}
