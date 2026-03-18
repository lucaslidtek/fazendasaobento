import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

const MOCK_TRUCKS = [
  { id: 1, plate: "QRS-2024", model: "Volvo FH 540", capacity: 50, status: "ativo" },
  { id: 2, plate: "DEF-5678", model: "Scania R450", capacity: 45, status: "ativo" },
  { id: 3, plate: "GHI-9012", model: "Mercedes Actros", capacity: 48, status: "ativo" },
];

router.get("/", authenticate, async (_req, res) => {
  res.json(MOCK_TRUCKS);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

export default router;
