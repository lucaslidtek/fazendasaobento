import type {
  DashboardSummary,
  HarvestRecord,
  TransportRecord,
  Machine,
  FuelingRecord,
  Product,
  Truck,
} from "@workspace/api-client-react";

export const DEMO_DASHBOARD: DashboardSummary = {
  totalHarvestSacks: 48320,
  totalHarvestHectares: 1240,
  totalTransportTons: 2890,
  totalFuelingLiters: 34780,
  activeMachines: 8,
  activeTrucks: 4,
  lowStockProducts: 3,
  harvestByCulture: [
    { culture: "soja", totalSacks: 31200 },
    { culture: "milho", totalSacks: 12800 },
    { culture: "feijao", totalSacks: 4320 },
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
    { id: 3, date: "2026-03-08", culture: "soja", area: "Talhão C2", areaHectares: 24, quantitySacks: 1560, productivity: 65.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", createdAt: "2026-03-08T08:00:00Z" },
    { id: 4, date: "2026-03-07", culture: "soja", area: "Talhão A2", areaHectares: 18, quantitySacks: 1100, productivity: 61.1, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", createdAt: "2026-03-07T08:00:00Z" },
  ],
  recentTransports: [
    { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", createdAt: "2026-03-11T10:00:00Z" },
    { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", createdAt: "2026-03-10T10:00:00Z" },
    { id: 3, date: "2026-03-09", origin: "Armazém Central", destination: "Bunge Alimentos", cargoTons: 52.1, truckId: 3, truckPlate: "GHI-9012", driverName: "Roberto Farias", createdAt: "2026-03-09T10:00:00Z" },
  ],
};

export const DEMO_HARVESTS: HarvestRecord[] = [
  { id: 1, date: "2026-03-10", culture: "soja", area: "Talhão A1", areaHectares: 20, quantitySacks: 1240, productivity: 62.0, machineId: 1, machineName: "John Deere S790", driverName: "Carlos Mendes", createdAt: "2026-03-10T08:00:00Z" },
  { id: 2, date: "2026-03-09", culture: "milho", area: "Talhão B3", areaHectares: 20, quantitySacks: 980, productivity: 49.0, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-09T08:00:00Z" },
  { id: 3, date: "2026-03-08", culture: "soja", area: "Talhão C2", areaHectares: 24, quantitySacks: 1560, productivity: 65.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", createdAt: "2026-03-08T08:00:00Z" },
  { id: 4, date: "2026-03-07", culture: "soja", area: "Talhão A2", areaHectares: 18, quantitySacks: 1100, productivity: 61.1, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", createdAt: "2026-03-07T08:00:00Z" },
  { id: 5, date: "2026-03-06", culture: "feijao", area: "Talhão D1", areaHectares: 15, quantitySacks: 720, productivity: 48.0, machineId: 1, machineName: "John Deere S790", driverName: "Ana Rodrigues", createdAt: "2026-03-06T08:00:00Z" },
  { id: 6, date: "2026-03-05", culture: "milho", area: "Talhão B1", areaHectares: 22, quantitySacks: 1090, productivity: 49.5, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-05T08:00:00Z" },
  { id: 7, date: "2026-03-04", culture: "soja", area: "Talhão A3", areaHectares: 19, quantitySacks: 1178, productivity: 62.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", createdAt: "2026-03-04T08:00:00Z" },
  { id: 8, date: "2026-03-03", culture: "soja", area: "Talhão C1", areaHectares: 21, quantitySacks: 1302, productivity: 62.0, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", createdAt: "2026-03-03T08:00:00Z" },
];

export const DEMO_TRANSPORTS: TransportRecord[] = [
  { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", createdAt: "2026-03-11T10:00:00Z" },
  { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", createdAt: "2026-03-10T10:00:00Z" },
  { id: 3, date: "2026-03-09", origin: "Armazém Central", destination: "Bunge Alimentos", cargoTons: 52.1, truckId: 3, truckPlate: "GHI-9012", driverName: "Roberto Farias", notes: "Carga urgente", createdAt: "2026-03-09T10:00:00Z" },
  { id: 4, date: "2026-03-08", origin: "Silo Sul", destination: "Cargill", cargoTons: 41.8, truckId: 1, truckPlate: "QRS-2024", driverName: "Marcos Lima", createdAt: "2026-03-08T10:00:00Z" },
  { id: 5, date: "2026-03-07", origin: "Armazém Central", destination: "ADM", cargoTons: 49.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Roberto Farias", createdAt: "2026-03-07T10:00:00Z" },
];

export const DEMO_MACHINES: Machine[] = [
  { id: 1, name: "John Deere S790", type: "colheitadeira", model: "S790", status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "New Holland TC5.90", type: "colheitadeira", model: "TC5.90", status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Massey Ferguson 7245", type: "trator", model: "7245", status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Case IH 9250", type: "colheitadeira", model: "9250", status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Stara Estrela 32", type: "equipamento", model: "Estrela 32", status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, name: "Valtra BM 110", type: "trator", model: "BM 110", status: "manutencao", createdAt: "2024-01-01T00:00:00Z" },
  { id: 7, name: "John Deere 5090E", type: "trator", model: "5090E", status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 8, name: "Becker Aton 24", type: "equipamento", model: "Aton 24", status: "inativo", createdAt: "2024-01-01T00:00:00Z" },
];

export const DEMO_FUELINGS: FuelingRecord[] = [
  { id: 1, date: "2026-03-11", machineId: 1, machineName: "John Deere S790", liters: 320, operatorName: "Carlos Mendes", createdAt: "2026-03-11T07:00:00Z" },
  { id: 2, date: "2026-03-11", machineId: 2, machineName: "New Holland TC5.90", liters: 280, operatorName: "Paulo Andrade", createdAt: "2026-03-11T07:30:00Z" },
  { id: 3, date: "2026-03-10", machineId: 3, machineName: "Massey Ferguson 7245", liters: 190, operatorName: "José Silva", createdAt: "2026-03-10T07:00:00Z" },
  { id: 4, date: "2026-03-10", machineId: 4, machineName: "Case IH 9250", liters: 350, operatorName: "Carlos Mendes", notes: "Colheita intensa", createdAt: "2026-03-10T07:30:00Z" },
  { id: 5, date: "2026-03-09", machineId: 1, machineName: "John Deere S790", liters: 310, operatorName: "Carlos Mendes", createdAt: "2026-03-09T07:00:00Z" },
  { id: 6, date: "2026-03-08", machineId: 5, machineName: "Stara Estrela 32", liters: 120, operatorName: "Ana Rodrigues", createdAt: "2026-03-08T07:00:00Z" },
];

export const DEMO_PRODUCTS: Product[] = [
  { id: 1, name: "Herbicida Glifosato 480", category: "Defensivo", unit: "L", currentStock: 1200, minStock: 500, createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Fungicida Fox Xpro", category: "Defensivo", unit: "L", currentStock: 85, minStock: 200, createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Inseticida Karate Zeon", category: "Defensivo", unit: "L", currentStock: 340, minStock: 150, createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Adubo MAP 12-52-00", category: "Fertilizante", unit: "KG", currentStock: 42000, minStock: 10000, createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Ureia 45%", category: "Fertilizante", unit: "KG", currentStock: 18500, minStock: 8000, createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, name: "Semente Soja M8349", category: "Semente", unit: "SC", currentStock: 420, minStock: 200, createdAt: "2024-01-01T00:00:00Z" },
  { id: 7, name: "Semente Milho DKB 390", category: "Semente", unit: "SC", currentStock: 38, minStock: 80, createdAt: "2024-01-01T00:00:00Z" },
  { id: 8, name: "Diesel S10 (tanque)", category: "Combustível", unit: "L", currentStock: 12400, minStock: 5000, createdAt: "2024-01-01T00:00:00Z" },
  { id: 9, name: "Óleo Hidráulico 68", category: "Lubrificante", unit: "L", currentStock: 180, minStock: 50, createdAt: "2024-01-01T00:00:00Z" },
  { id: 10, name: "Adubo KCl 60%", category: "Fertilizante", unit: "KG", currentStock: 3200, minStock: 5000, createdAt: "2024-01-01T00:00:00Z" },
];

export const DEMO_TRUCKS: Truck[] = [
  { id: 1, plate: "QRS-2024", model: "Volvo FH 540", capacity: 50, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, plate: "DEF-5678", model: "Scania R450", capacity: 45, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, plate: "GHI-9012", model: "Mercedes Actros", capacity: 48, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, plate: "JKL-3456", model: "Iveco Stralis", capacity: 42, status: "manutencao", createdAt: "2024-01-01T00:00:00Z" },
];
