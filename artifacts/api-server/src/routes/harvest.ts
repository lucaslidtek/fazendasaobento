import { Router } from "express";
import { db, harvestTable, machinesTable } from "@workspace/db";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateHarvestBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { culture, startDate, endDate } = req.query;
  const conditions = [];
  if (culture) conditions.push(eq(harvestTable.culture, culture as any));
  if (startDate) conditions.push(gte(harvestTable.date, startDate as string));
  if (endDate) conditions.push(lte(harvestTable.date, endDate as string));

  const rows = await db
    .select({
      id: harvestTable.id,
      date: harvestTable.date,
      culture: harvestTable.culture,
      area: harvestTable.area,
      driverName: harvestTable.driverName,
      machineId: harvestTable.machineId,
      machineName: machinesTable.name,
      quantitySacks: harvestTable.quantitySacks,
      areaHectares: harvestTable.areaHectares,
      notes: harvestTable.notes,
      createdAt: harvestTable.createdAt,
    })
    .from(harvestTable)
    .leftJoin(machinesTable, eq(harvestTable.machineId, machinesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${harvestTable.date} DESC`);

  res.json(rows.map(r => ({
    ...r,
    quantitySacks: Number(r.quantitySacks),
    areaHectares: Number(r.areaHectares),
    productivity: Number(r.areaHectares) > 0 ? Number(r.quantitySacks) / Number(r.areaHectares) : 0,
  })));
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateHarvestBody.parse(req.body);
    const [harvest] = await db.insert(harvestTable).values({
      date: body.date,
      culture: body.culture as any,
      area: body.area,
      driverName: body.driverName,
      machineId: body.machineId,
      quantitySacks: String(body.quantitySacks),
      areaHectares: String(body.areaHectares),
      notes: body.notes ?? null,
    }).returning();

    const machine = await db.select().from(machinesTable).where(eq(machinesTable.id, harvest.machineId)).limit(1);
    const productivity = Number(harvest.areaHectares) > 0
      ? Number(harvest.quantitySacks) / Number(harvest.areaHectares)
      : 0;

    res.status(201).json({
      ...harvest,
      machineName: machine[0]?.name ?? null,
      quantitySacks: Number(harvest.quantitySacks),
      areaHectares: Number(harvest.areaHectares),
      productivity,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = CreateHarvestBody.parse(req.body);
    const [harvest] = await db.update(harvestTable).set({
      date: body.date,
      culture: body.culture as any,
      area: body.area,
      driverName: body.driverName,
      machineId: body.machineId,
      quantitySacks: String(body.quantitySacks),
      areaHectares: String(body.areaHectares),
      notes: body.notes ?? null,
    }).where(eq(harvestTable.id, id)).returning();

    if (!harvest) { res.status(404).json({ message: "Registro não encontrado" }); return; }
    const machine = await db.select().from(machinesTable).where(eq(machinesTable.id, harvest.machineId)).limit(1);
    const productivity = Number(harvest.areaHectares) > 0
      ? Number(harvest.quantitySacks) / Number(harvest.areaHectares)
      : 0;
    res.json({
      ...harvest,
      machineName: machine[0]?.name ?? null,
      quantitySacks: Number(harvest.quantitySacks),
      areaHectares: Number(harvest.areaHectares),
      productivity,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(harvestTable).where(eq(harvestTable.id, id));
  res.json({ message: "Registro removido" });
});

export default router;
