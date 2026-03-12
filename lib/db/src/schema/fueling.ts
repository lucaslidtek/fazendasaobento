import { pgTable, serial, text, timestamp, numeric, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { machinesTable } from "./machines";

export const fuelingTable = pgTable("fueling", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  machineId: integer("machine_id").notNull().references(() => machinesTable.id),
  operatorName: text("operator_name").notNull(),
  pump: text("pump"),
  liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFuelingSchema = createInsertSchema(fuelingTable).omit({
  id: true,
  createdAt: true,
});

export type InsertFueling = z.infer<typeof insertFuelingSchema>;
export type Fueling = typeof fuelingTable.$inferSelect;
