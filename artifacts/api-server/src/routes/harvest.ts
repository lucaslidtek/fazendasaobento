import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_HARVESTS = [
  { id: 1, date: "2026-03-10", culture: "soja", area: "Talhão A1", areaHectares: 20, quantitySacks: 1240, productivity: 62.0, machineId: 1, machineName: "John Deere S790", driverName: "Carlos Mendes", createdAt: "2026-03-10T08:00:00Z" },
  { id: 2, date: "2026-03-09", culture: "milho", area: "Talhão B3", areaHectares: 20, quantitySacks: 980, productivity: 49.0, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-09T08:00:00Z" },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_HARVESTS);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

export default router;
