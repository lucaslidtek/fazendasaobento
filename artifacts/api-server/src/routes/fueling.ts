import { Router } from "express";
import { db, fuelingTable, machinesTable } from "@workspace/db";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateFuelingBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { machineId, startDate, endDate } = req.query;
  const conditions = [];
  if (machineId) conditions.push(eq(fuelingTable.machineId, parseInt(machineId as string)));
  if (startDate) conditions.push(gte(fuelingTable.date, startDate as string));
  if (endDate) conditions.push(lte(fuelingTable.date, endDate as string));

  const rows = await db
    .select({
      id: fuelingTable.id,
      date: fuelingTable.date,
      machineId: fuelingTable.machineId,
      machineName: machinesTable.name,
      operatorName: fuelingTable.operatorName,
      pump: fuelingTable.pump,
      liters: fuelingTable.liters,
      notes: fuelingTable.notes,
      createdAt: fuelingTable.createdAt,
    })
    .from(fuelingTable)
    .leftJoin(machinesTable, eq(fuelingTable.machineId, machinesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${fuelingTable.date} DESC`);

  res.json(rows.map(r => ({ ...r, liters: Number(r.liters) })));
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateFuelingBody.parse(req.body);
    const [fueling] = await db.insert(fuelingTable).values({
      date: body.date,
      machineId: body.machineId,
      operatorName: body.operatorName,
      pump: body.pump ?? null,
      liters: String(body.liters),
      notes: body.notes ?? null,
    }).returning();
    const machine = await db.select().from(machinesTable).where(eq(machinesTable.id, fueling.machineId)).limit(1);
    res.status(201).json({ ...fueling, machineName: machine[0]?.name ?? null, liters: Number(fueling.liters) });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = CreateFuelingBody.parse(req.body);
    const [fueling] = await db.update(fuelingTable).set({
      date: body.date,
      machineId: body.machineId,
      operatorName: body.operatorName,
      pump: body.pump ?? null,
      liters: String(body.liters),
      notes: body.notes ?? null,
    }).where(eq(fuelingTable.id, id)).returning();
    if (!fueling) { res.status(404).json({ message: "Registro não encontrado" }); return; }
    const machine = await db.select().from(machinesTable).where(eq(machinesTable.id, fueling.machineId)).limit(1);
    res.json({ ...fueling, machineName: machine[0]?.name ?? null, liters: Number(fueling.liters) });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(fuelingTable).where(eq(fuelingTable.id, id));
  res.json({ message: "Registro removido" });
});

export default router;
