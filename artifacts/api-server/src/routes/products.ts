import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_PRODUCTS = [
  { id: 1, name: "Herbicida Glifosato 480", category: "Defensivo", unit: "L", currentStock: 1200, minStock: 500 },
  { id: 2, name: "Fungicida Fox Xpro", category: "Defensivo", unit: "L", currentStock: 85, minStock: 200 },
  { id: 3, name: "Inseticida Karate Zeon", category: "Defensivo", unit: "L", currentStock: 340, minStock: 150 },
  { id: 4, name: "Adubo MAP 12-52-00", category: "Fertilizante", unit: "KG", currentStock: 42000, minStock: 10000 },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_PRODUCTS);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

export default router;
