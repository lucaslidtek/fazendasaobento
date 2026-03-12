import { Router } from "express";
import { db, machinesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateMachineBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  const machines = await db.select().from(machinesTable).orderBy(machinesTable.name);
  res.json(machines);
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateMachineBody.parse(req.body);
    const [machine] = await db.insert(machinesTable).values({
      name: body.name,
      model: body.model ?? null,
      type: body.type as any,
      location: body.location ?? null,
      status: body.status as any,
    }).returning();
    res.status(201).json(machine);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = CreateMachineBody.parse(req.body);
    const [machine] = await db.update(machinesTable).set({
      name: body.name,
      model: body.model ?? null,
      type: body.type as any,
      location: body.location ?? null,
      status: body.status as any,
    }).where(eq(machinesTable.id, id)).returning();
    if (!machine) { res.status(404).json({ message: "Máquina não encontrada" }); return; }
    res.json(machine);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(machinesTable).where(eq(machinesTable.id, id));
  res.json({ message: "Máquina removida" });
});

export default router;
