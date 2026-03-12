import { pgTable, serial, text, timestamp, numeric, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { trucksTable } from "./trucks";
import { harvestTable } from "./harvest";

export const transportTable = pgTable("transport", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  truckId: integer("truck_id").notNull().references(() => trucksTable.id),
  driverName: text("driver_name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  cargoTons: numeric("cargo_tons", { precision: 10, scale: 2 }).notNull(),
  freightValue: numeric("freight_value", { precision: 12, scale: 2 }),
  harvestId: integer("harvest_id").references(() => harvestTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransportSchema = createInsertSchema(transportTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTransport = z.infer<typeof insertTransportSchema>;
export type Transport = typeof transportTable.$inferSelect;
