import { Router } from "express";
import { db, harvestTable, transportTable, fuelingTable, machinesTable, trucksTable, productsTable } from "@workspace/db";
import { eq, sql, lte } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/summary", authenticate, async (_req, res) => {
  const [harvestStats] = await db.select({
    totalSacks: sql<number>`COALESCE(SUM(CAST(${harvestTable.quantitySacks} AS NUMERIC)), 0)`,
    totalHectares: sql<number>`COALESCE(SUM(CAST(${harvestTable.areaHectares} AS NUMERIC)), 0)`,
  }).from(harvestTable);

  const [transportStats] = await db.select({
    totalTons: sql<number>`COALESCE(SUM(CAST(${transportTable.cargoTons} AS NUMERIC)), 0)`,
  }).from(transportTable);

  const [fuelingStats] = await db.select({
    totalLiters: sql<number>`COALESCE(SUM(CAST(${fuelingTable.liters} AS NUMERIC)), 0)`,
  }).from(fuelingTable);

  const [activeMachinesCount] = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(machinesTable).where(eq(machinesTable.status, "ativo"));

  const [activeTrucksCount] = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(trucksTable).where(eq(trucksTable.status, "ativo"));

  const [lowStockCount] = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(productsTable).where(
    sql`CAST(${productsTable.currentStock} AS NUMERIC) <= CAST(COALESCE(${productsTable.minStock}, '0') AS NUMERIC)`
  );

  const recentHarvests = await db
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
    .orderBy(sql`${harvestTable.date} DESC`)
    .limit(5);

  const recentTransports = await db
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
    .orderBy(sql`${transportTable.date} DESC`)
    .limit(5);

  const harvestByCulture = await db
    .select({
      culture: harvestTable.culture,
      totalSacks: sql<number>`COALESCE(SUM(CAST(${harvestTable.quantitySacks} AS NUMERIC)), 0)`,
      totalHectares: sql<number>`COALESCE(SUM(CAST(${harvestTable.areaHectares} AS NUMERIC)), 0)`,
    })
    .from(harvestTable)
    .groupBy(harvestTable.culture);

  const fuelingByMachine = await db
    .select({
      machineName: machinesTable.name,
      totalLiters: sql<number>`COALESCE(SUM(CAST(${fuelingTable.liters} AS NUMERIC)), 0)`,
    })
    .from(fuelingTable)
    .leftJoin(machinesTable, eq(fuelingTable.machineId, machinesTable.id))
    .groupBy(machinesTable.name)
    .orderBy(sql`COALESCE(SUM(CAST(${fuelingTable.liters} AS NUMERIC)), 0) DESC`)
    .limit(10);

  res.json({
    totalHarvestSacks: Number(harvestStats?.totalSacks ?? 0),
    totalHarvestHectares: Number(harvestStats?.totalHectares ?? 0),
    totalTransportTons: Number(transportStats?.totalTons ?? 0),
    totalFuelingLiters: Number(fuelingStats?.totalLiters ?? 0),
    activeMachines: Number(activeMachinesCount?.count ?? 0),
    activeTrucks: Number(activeTrucksCount?.count ?? 0),
    lowStockProducts: Number(lowStockCount?.count ?? 0),
    recentHarvests: recentHarvests.map(r => ({
      ...r,
      quantitySacks: Number(r.quantitySacks),
      areaHectares: Number(r.areaHectares),
      productivity: Number(r.areaHectares) > 0 ? Number(r.quantitySacks) / Number(r.areaHectares) : 0,
    })),
    recentTransports: recentTransports.map(r => ({
      ...r,
      cargoTons: Number(r.cargoTons),
      freightValue: r.freightValue ? Number(r.freightValue) : null,
    })),
    harvestByCulture: harvestByCulture.map(r => ({
      culture: r.culture,
      totalSacks: Number(r.totalSacks),
      totalHectares: Number(r.totalHectares),
    })),
    fuelingByMachine: fuelingByMachine.map(r => ({
      machineName: r.machineName ?? "Desconhecida",
      totalLiters: Number(r.totalLiters),
    })),
  });
});

export default router;
