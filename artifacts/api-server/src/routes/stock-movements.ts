import { Router } from "express";
import { db, stockMovementsTable, productsTable } from "@workspace/db";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateStockMovementBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { productId, type, startDate, endDate } = req.query;
  const conditions = [];
  if (productId) conditions.push(eq(stockMovementsTable.productId, parseInt(productId as string)));
  if (type) conditions.push(eq(stockMovementsTable.type, type as any));
  if (startDate) conditions.push(gte(stockMovementsTable.date, startDate as string));
  if (endDate) conditions.push(lte(stockMovementsTable.date, endDate as string));

  const rows = await db
    .select({
      id: stockMovementsTable.id,
      productId: stockMovementsTable.productId,
      productName: productsTable.name,
      type: stockMovementsTable.type,
      quantity: stockMovementsTable.quantity,
      reason: stockMovementsTable.reason,
      culture: stockMovementsTable.culture,
      operatorName: stockMovementsTable.operatorName,
      date: stockMovementsTable.date,
      notes: stockMovementsTable.notes,
      createdAt: stockMovementsTable.createdAt,
    })
    .from(stockMovementsTable)
    .leftJoin(productsTable, eq(stockMovementsTable.productId, productsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${stockMovementsTable.date} DESC`);

  res.json(rows.map(r => ({ ...r, quantity: Number(r.quantity) })));
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateStockMovementBody.parse(req.body);

    const products = await db.select().from(productsTable).where(eq(productsTable.id, body.productId)).limit(1);
    const product = products[0];
    if (!product) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    const currentStock = Number(product.currentStock);
    const qty = Number(body.quantity);

    if (body.type === "saida" && currentStock < qty) {
      res.status(400).json({ message: "Estoque insuficiente. Estoque atual: " + currentStock + " " + product.unit });
      return;
    }

    const newStock = body.type === "entrada" ? currentStock + qty : currentStock - qty;
    await db.update(productsTable).set({ currentStock: String(newStock) }).where(eq(productsTable.id, body.productId));

    const [movement] = await db.insert(stockMovementsTable).values({
      productId: body.productId,
      type: body.type as any,
      quantity: String(body.quantity),
      reason: body.reason ?? null,
      culture: body.culture ?? null,
      operatorName: body.operatorName ?? null,
      date: body.date,
      notes: body.notes ?? null,
    }).returning();

    res.status(201).json({ ...movement, productName: product.name, quantity: Number(movement.quantity) });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(stockMovementsTable).where(eq(stockMovementsTable.id, id));
  res.json({ message: "Movimentação removida" });
});

export default router;
