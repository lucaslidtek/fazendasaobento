import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { CreateProductBody } from "@workspace/api-zod";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.name);
  res.json(products.map(p => ({
    ...p,
    currentStock: Number(p.currentStock),
    minStock: p.minStock ? Number(p.minStock) : null,
  })));
});

router.post("/", authenticate, async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [product] = await db.insert(productsTable).values({
      name: body.name,
      category: body.category,
      unit: body.unit as any,
      currentStock: String(body.currentStock),
      minStock: body.minStock != null ? String(body.minStock) : null,
    }).returning();
    res.status(201).json({ ...product, currentStock: Number(product.currentStock), minStock: product.minStock ? Number(product.minStock) : null });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const body = CreateProductBody.parse(req.body);
    const [product] = await db.update(productsTable).set({
      name: body.name,
      category: body.category,
      unit: body.unit as any,
      currentStock: String(body.currentStock),
      minStock: body.minStock != null ? String(body.minStock) : null,
    }).where(eq(productsTable.id, id)).returning();
    if (!product) { res.status(404).json({ message: "Produto não encontrado" }); return; }
    res.json({ ...product, currentStock: Number(product.currentStock), minStock: product.minStock ? Number(product.minStock) : null });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Produto removido" });
});

export default router;
