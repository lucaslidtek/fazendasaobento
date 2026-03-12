import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireAdmin, hashPassword } from "../lib/auth.js";
import { CreateUserBody, UpdateUserBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, requireAdmin, async (_req, res) => {
  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.name);
  res.json(users);
});

router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const body = CreateUserBody.parse(req.body);
    const [user] = await db.insert(usersTable).values({
      name: body.name,
      email: body.email,
      passwordHash: hashPassword(body.password),
      role: body.role as "admin" | "operador",
    }).returning();
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = UpdateUserBody.parse(req.body);
    const updates: any = {};
    if (body.name) updates.name = body.name;
    if (body.email) updates.email = body.email;
    if (body.role) updates.role = body.role;
    if (body.password) updates.passwordHash = hashPassword(body.password);
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ message: "Usuário não encontrado" }); return; }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "Usuário removido" });
});

export default router;
