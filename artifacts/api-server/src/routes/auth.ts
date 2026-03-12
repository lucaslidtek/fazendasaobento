import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, hashPassword, comparePassword, signToken } from "../lib/auth.js";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    const users = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);
    const user = users[0];
    if (!user || !comparePassword(body.password, user.passwordHash)) {
      res.status(401).json({ message: "Email ou senha inválidos" });
      return;
    }
    const token = signToken(user.id, user.role);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      token,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Dados inválidos" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const body = RegisterBody.parse(req.body);
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);
    if (existing[0]) {
      res.status(400).json({ message: "Email já cadastrado" });
      return;
    }
    const [user] = await db.insert(usersTable).values({
      name: body.name,
      email: body.email,
      passwordHash: hashPassword(body.password),
      role: (body.role as "admin" | "operador") || "operador",
    }).returning();
    const token = signToken(user.id, user.role);
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      token,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Dados inválidos" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logout realizado" });
});

router.get("/me", authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
});

export default router;
