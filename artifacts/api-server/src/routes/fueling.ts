import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_FUELINGS = [
  { id: 1, date: "2026-03-11", machineId: 1, machineName: "John Deere S790", liters: 320, operatorName: "Carlos Mendes", createdAt: "2026-03-11T07:00:00Z" },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_FUELINGS);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

export default router;
