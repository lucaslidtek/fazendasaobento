import { Router } from "express";
import { db, transportTable, trucksTable } from "@workspace/db";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateTransportBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { startDate, endDate } = req.query;
  const conditions: any[] = [];
  if (startDate) conditions.push(gte(transportTable.date, startDate as string));
  if (endDate) conditions.push(lte(transportTable.date, endDate as string));

  const rows = await db
    .select({
      id: transportTable.id,
      date: transportTable.date,
      truckId: transportTable.truckId,
      truckPlate: trucksTable.plate,
      driverName: transportTable.driverName,
      origin: transportTable.origin,
      destination: transportTable.destination,
      cargoTons: transportTable.cargoTons,
      freightValue: transportTable.freightValue,
      harvestId: transportTable.harvestId,
      notes: transportTable.notes,
      createdAt: transportTable.createdAt,
    })
    .from(transportTable)
    .leftJoin(trucksTable, eq(transportTable.truckId, trucksTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${transportTable.date} DESC`);

  res.json(rows.map(r => ({
    ...r,
    cargoTons: Number(r.cargoTons),
    freightValue: r.freightValue ? Number(r.freightValue) : null,
  })));
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateTransportBody.parse(req.body);
    const [transport] = await db.insert(transportTable).values({
      date: body.date.toISOString().split('T')[0],
      truckId: body.truckId,
      driverName: body.driverName,
      origin: body.origin,
      destination: body.destination,
      cargoTons: String(body.cargoTons),
      freightValue: body.freightValue ? String(body.freightValue) : null,
      harvestId: body.harvestId ?? null,
      notes: body.notes ?? null,
    }).returning();
    const truck = await db.select().from(trucksTable).where(eq(trucksTable.id, transport.truckId)).limit(1);
    res.status(201).json({
      ...transport,
      truckPlate: truck[0]?.plate ?? null,
      cargoTons: Number(transport.cargoTons),
      freightValue: transport.freightValue ? Number(transport.freightValue) : null,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = CreateTransportBody.parse(req.body);
    const [transport] = await db.update(transportTable).set({
      date: body.date.toISOString().split('T')[0],
      truckId: body.truckId,
      driverName: body.driverName,
      origin: body.origin,
      destination: body.destination,
      cargoTons: String(body.cargoTons),
      freightValue: body.freightValue ? String(body.freightValue) : null,
      harvestId: body.harvestId ?? null,
      notes: body.notes ?? null,
    }).where(eq(transportTable.id, id)).returning();
    if (!transport) { res.status(404).json({ message: "Registro não encontrado" }); return; }
    const truck = await db.select().from(trucksTable).where(eq(trucksTable.id, transport.truckId)).limit(1);
    res.json({
      ...transport,
      truckPlate: truck[0]?.plate ?? null,
      cargoTons: Number(transport.cargoTons),
      freightValue: transport.freightValue ? Number(transport.freightValue) : null,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(transportTable).where(eq(transportTable.id, id));
  res.json({ message: "Registro removido" });
});

export default router;
