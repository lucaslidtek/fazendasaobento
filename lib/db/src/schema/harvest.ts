import { pgTable, serial, text, timestamp, numeric, date, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { machinesTable } from "./machines";

export const cultureEnum = pgEnum("culture", ["soja", "feijao", "milho"]);

export const harvestTable = pgTable("harvest", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  culture: cultureEnum("culture").notNull(),
  area: text("area").notNull(),
  driverName: text("driver_name").notNull(),
  machineId: integer("machine_id").notNull().references(() => machinesTable.id),
  quantitySacks: numeric("quantity_sacks", { precision: 10, scale: 2 }).notNull(),
  areaHectares: numeric("area_hectares", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHarvestSchema = createInsertSchema(harvestTable).omit({
  id: true,
  createdAt: true,
});

export type InsertHarvest = z.infer<typeof insertHarvestSchema>;
export type Harvest = typeof harvestTable.$inferSelect;
