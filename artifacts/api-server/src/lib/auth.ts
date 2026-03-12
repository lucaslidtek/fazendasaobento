import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "fazenda-sao-bento-secret-2024";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    const users = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!users[0]) {
      res.status(401).json({ message: "Usuário não encontrado" });
      return;
    }
    (req as any).user = users[0];
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
