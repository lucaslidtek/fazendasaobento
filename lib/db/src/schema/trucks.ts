import { pgTable, serial, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const truckStatusEnum = pgEnum("truck_status", ["ativo", "manutencao", "inativo"]);

export const trucksTable = pgTable("trucks", {
  id: serial("id").primaryKey(),
  plate: text("plate").notNull().unique(),
  model: text("model"),
  capacity: numeric("capacity", { precision: 10, scale: 2 }),
  status: truckStatusEnum("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTruckSchema = createInsertSchema(trucksTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Truck = typeof trucksTable.$inferSelect;
