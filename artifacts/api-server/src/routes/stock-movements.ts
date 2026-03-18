import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  res.json([]);
});

router.post("/", authenticate, async (req, res) => {
  res.status(201).json({ ...req.body, id: Math.floor(Math.random() * 1000) });
});

export default router;
