import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_TRANSPORTS = [
  { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", createdAt: "2026-03-11T10:00:00Z" },
  { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", createdAt: "2026-03-10T10:00:00Z" },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_TRANSPORTS);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

export default router;
