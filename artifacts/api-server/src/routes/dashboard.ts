import { Router } from "express";
import { authenticate } from "../lib/auth.js";

const router = Router();

// Dados Mockados para o Protótipo
const DEMO_DASHBOARD = {
  totalHarvestSacks: 48320,
  totalHarvestHectares: 1240,
  totalTransportTons: 2890,
  totalFuelingLiters: 34780,
  activeMachines: 8,
  activeTrucks: 4,
  lowStockProducts: 3,
  harvestByCulture: [
    { culture: "soja", totalSacks: 31200, totalHectares: 800 },
    { culture: "milho", totalSacks: 12800, totalHectares: 340 },
    { culture: "feijao", totalSacks: 4320, totalHectares: 100 },
  ],
  fuelingByMachine: [
    { machineName: "John Deere S790", totalLiters: 9800 },
    { machineName: "New Holland TC5.90", totalLiters: 8320 },
    { machineName: "Massey 7245", totalLiters: 7100 },
    { machineName: "Case IH 9250", totalLiters: 6200 },
    { machineName: "Stara Estrela 32", totalLiters: 3360 },
  ],
  recentHarvests: [
    { id: 1, date: "2026-03-10", culture: "soja", area: "Talhão A1", areaHectares: 20, quantitySacks: 1240, productivity: 62.0, machineId: 1, machineName: "John Deere S790", driverName: "Carlos Mendes", createdAt: "2026-03-10T08:00:00Z" },
    { id: 2, date: "2026-03-09", culture: "milho", area: "Talhão B3", areaHectares: 20, quantitySacks: 980, productivity: 49.0, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-09T08:00:00Z" },
  ],
  recentTransports: [
    { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", createdAt: "2026-03-11T10:00:00Z" },
    { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", createdAt: "2026-03-10T10:00:00Z" },
  ],
};

router.get("/summary", authenticate, async (_req, res) => {
  res.json(DEMO_DASHBOARD);
});

export default router;
