import { Router } from "express";
import { db, trucksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateTruckBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  const trucks = await db.select().from(trucksTable).orderBy(trucksTable.plate);
  res.json(trucks);
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateTruckBody.parse(req.body);
    const [truck] = await db.insert(trucksTable).values({
      plate: body.plate,
      model: body.model ?? null,
      capacity: body.capacity ? String(body.capacity) : null,
      status: body.status as any,
    }).returning();
    res.status(201).json({ ...truck, capacity: truck.capacity ? Number(truck.capacity) : null });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = CreateTruckBody.parse(req.body);
    const [truck] = await db.update(trucksTable).set({
      plate: body.plate,
      model: body.model ?? null,
      capacity: body.capacity ? String(body.capacity) : null,
      status: body.status as any,
    }).where(eq(trucksTable.id, id)).returning();
    if (!truck) { res.status(404).json({ message: "Caminhão não encontrado" }); return; }
    res.json({ ...truck, capacity: truck.capacity ? Number(truck.capacity) : null });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(trucksTable).where(eq(trucksTable.id, id));
  res.json({ message: "Caminhão removido" });
});

export default router;
