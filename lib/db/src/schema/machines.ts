import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const machineTypeEnum = pgEnum("machine_type", ["trator", "colheitadeira", "caminhao", "equipamento"]);
export const machineStatusEnum = pgEnum("machine_status", ["ativo", "manutencao", "inativo"]);

export const machinesTable = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model"),
  type: machineTypeEnum("type").notNull(),
  location: text("location"),
  status: machineStatusEnum("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMachineSchema = createInsertSchema(machinesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machinesTable.$inferSelect;
