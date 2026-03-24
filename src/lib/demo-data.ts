import type {
  DashboardSummary,
  HarvestRecord,
  TransportRecord,
  Machine,
  Product,
  Truck,
  User,
  UserRole,
} from "@workspace/api-client-react";

export interface ExtendedMachine extends Omit<Machine, 'id'> {
  id: number;
  purchase_cost?: number;
  safraId?: number;
  talhaoId?: number;
}

export interface Safra {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "ativo" | "inativo";
}

export interface Talhao {
  id: number;
  name: string;
  property?: string;
  areaHectares: number;
  cultureId?: number;
  status: "ativo" | "inativo";
  createdAt: string;
  safraId?: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  reason?: string;
  safra?: string;
  safraId?: number;
  talhao?: string;
  talhaoId?: number;
  createdAt: string;
}

export interface ExtendedUser extends Omit<User, 'id'> {
  id: number;
  status?: string;
}

export interface FuelingRecord {
  id: number;
  date: string;
  machineId: number;
  machineName: string;
  liters: number;
  operatorName: string;
  talhao?: string;
  talhaoId?: number;
  safraId?: number;
  servico?: string;
  responsavelId?: number;
  responsavelName?: string;
  pump?: string;
  notes?: string;
  createdAt: string;
}

export interface DieselTransaction {
  id: number;
  date: string;
  type: "entrada" | "saida";
  category: string;
  value: number;
  liters: number;
  nfNumber?: string;
  hasAttachment?: boolean;
  description: string;
  createdAt: string;
  safraId?: number;
  talhaoId?: number;
}

export const DEMO_SAFRAS: Safra[] = [
  { id: 4, name: "Safra 2025/2026", startDate: "2025-09-01", endDate: "2026-06-30", status: "ativo" },
  { id: 1, name: "Safra 2023/2024", startDate: "2023-09-01", endDate: "2024-03-31", status: "ativo" },
  { id: 2, name: "Safrinha 2024", startDate: "2024-02-01", endDate: "2024-08-31", status: "ativo" },
  { id: 3, name: "Safra 2022/2023", startDate: "2022-09-01", endDate: "2023-03-31", status: "inativo" },
];

export const DEMO_DASHBOARD: DashboardSummary = {
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
    { culture: "trigo", totalSacks: 4320, totalHectares: 100 },
  ],
  fuelingByMachine: [
    { machineName: "John Deere S790", totalLiters: 9800 },
    { machineName: "New Holland TC5.90", totalLiters: 8320 },
    { machineName: "Massey 7245", totalLiters: 7100 },
    { machineName: "Case IH 9250", totalLiters: 6200 },
    { machineName: "Stara Estrela 32", totalLiters: 3360 },
  ],
  recentHarvests: [
    { id: 1, date: "2026-03-10", cultures: ["soja"], area: "Talhão A1", areaHectares: 20, quantitySacks: 1240, productivity: 62.0, machineId: 1, machineName: "John Deere S790", driverName: "Carlos Mendes", createdAt: "2026-03-10T08:00:00Z" as any },
    { id: 2, date: "2026-03-09", cultures: ["milho"], area: "Talhão B3", areaHectares: 20, quantitySacks: 980, productivity: 49.0, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-09T08:00:00Z" as any },
    { id: 3, date: "2026-03-08", cultures: ["soja"], area: "Talhão C2", areaHectares: 24, quantitySacks: 1560, productivity: 65.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", createdAt: "2026-03-08T08:00:00Z" as any },
    { id: 4, date: "2026-03-07", cultures: ["soja"], area: "Talhão A2", areaHectares: 18, quantitySacks: 1100, productivity: 61.1, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", createdAt: "2026-03-07T08:00:00Z" as any },
  ],
  recentTransports: [
    { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", createdAt: "2026-03-11T10:00:00Z" as any },
    { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", createdAt: "2026-03-10T10:00:00Z" as any },
    { id: 3, date: "2026-03-09", origin: "Armazém Central", destination: "Bunge Alimentos", cargoTons: 52.1, truckId: 3, truckPlate: "GHI-9012", driverName: "Roberto Farias", createdAt: "2026-03-09T10:00:00Z" as any },
  ],
};

export const DEMO_HARVESTS: any[] = [
  { id: 1, date: "2026-03-10", cultures: ["soja"], area: "Talhão A1", talhaoId: 1, safraId: 4, areaHectares: 20, quantitySacks: 1240, productivity: 62.0, machineId: 1, machineName: "John Deere S790", driverName: "Carlos Mendes", createdAt: "2026-03-10T08:00:00Z" },
  { id: 2, date: "2026-03-09", cultures: ["milho"], area: "Talhão B3", talhaoId: 5, safraId: 4, areaHectares: 20, quantitySacks: 980, productivity: 49.0, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-09T08:00:00Z" },
  { id: 3, date: "2026-03-08", cultures: ["soja"], area: "Talhão C2", talhaoId: 7, safraId: 4, areaHectares: 24, quantitySacks: 1560, productivity: 65.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", createdAt: "2026-03-08T08:00:00Z" },
  { id: 4, date: "2026-03-07", cultures: ["soja"], area: "Talhão A2", talhaoId: 2, safraId: 4, areaHectares: 18, quantitySacks: 1100, productivity: 61.1, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", createdAt: "2026-03-07T08:00:00Z" },
  { id: 5, date: "2026-03-06", cultures: ["Trigo"], area: "Talhão D1", talhaoId: 8, safraId: 4, areaHectares: 15, quantitySacks: 720, productivity: 48.0, machineId: 1, machineName: "John Deere S790", driverName: "Ana Rodrigues", createdAt: "2026-03-06T08:00:00Z" },
  { id: 6, date: "2026-03-05", cultures: ["milho", "soja"], area: "Talhão B1", talhaoId: 4, safraId: 4, areaHectares: 22, quantitySacks: 1090, productivity: 49.5, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", createdAt: "2026-03-05T08:00:00Z" },
  { id: 7, date: "2026-03-04", cultures: ["soja"], area: "Talhão A3", talhaoId: 3, safraId: 4, areaHectares: 19, quantitySacks: 1178, productivity: 62.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", createdAt: "2026-03-04T08:00:00Z" },
  { id: 8, date: "2026-03-03", cultures: ["soja"], area: "Talhão C1", talhaoId: 6, safraId: 4, areaHectares: 21, quantitySacks: 1302, productivity: 62.0, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", createdAt: "2026-03-03T08:00:00Z" },
];

export const DEMO_TRANSPORTS: (TransportRecord & { machineId?: number; safraId?: number })[] = [
  { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", machineId: 9, safraId: 4, createdAt: "2026-03-11T10:00:00Z" as any },
  { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", machineId: 9, safraId: 4, createdAt: "2026-03-10T10:00:00Z" as any },
  { id: 3, date: "2026-03-09", origin: "Armazém Central", destination: "Bunge Alimentos", cargoTons: 52.1, truckId: 3, truckPlate: "GHI-9012", driverName: "Roberto Farias", machineId: 10, notes: "Carga urgente", safraId: 4, createdAt: "2026-03-09T10:00:00Z" as any },
  { id: 4, date: "2026-03-08", origin: "Silo Sul", destination: "Cargill", cargoTons: 41.8, truckId: 1, truckPlate: "QRS-2024", driverName: "Marcos Lima", machineId: 9, safraId: 4, createdAt: "2026-03-08T10:00:00Z" as any },
  { id: 5, date: "2026-03-07", origin: "Armazém Central", destination: "ADM", cargoTons: 49.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Roberto Farias", machineId: 10, safraId: 4, createdAt: "2026-03-07T10:00:00Z" as any },
];

export const DEMO_MACHINES: ExtendedMachine[] = [
  { id: 1, name: "John Deere S790", type: "colheitadeira", model: "S790", status: "ativo", purchase_cost: 2850000, location: "Galpão Principal", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "New Holland TC5.90", type: "colheitadeira", model: "TC5.90", status: "ativo", purchase_cost: 1950000, location: "Galpão Principal", createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Massey Ferguson 7245", type: "trator", model: "7245", status: "ativo", purchase_cost: 450000, location: "Galpão Anexo 1", createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Case IH 9250", type: "colheitadeira", model: "9250", status: "ativo", purchase_cost: 3100000, location: "Galpão Principal", createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Stara Estrela 32", type: "equipamento", model: "Estrela 32", status: "ativo", purchase_cost: 850000, location: "Pátio Central", createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, name: "Valtra BM 110", type: "trator", model: "BM 110", status: "manutencao", purchase_cost: 280000, location: "Oficina", createdAt: "2024-01-01T00:00:00Z" },
  { id: 7, name: "John Deere 5090E", type: "trator", model: "5090E", status: "ativo", purchase_cost: 320000, location: "Galpão Anexo 2", createdAt: "2024-01-01T00:00:00Z" },
  { id: 8, name: "Becker Aton 24", type: "equipamento", model: "Aton 24", status: "inativo", purchase_cost: 120000, location: "Pátio Secundário", createdAt: "2024-01-01T00:00:00Z" },
  { id: 9, name: "Volvo FH 540 (Frota)", type: "caminhao", model: "FH 540", status: "ativo", purchase_cost: 650000, location: "Garagem Frota", createdAt: "2024-01-01T00:00:00Z" },
  { id: 10, name: "Scania R450 (Frota)", type: "caminhao", model: "R450", status: "ativo", purchase_cost: 580000, location: "Garagem Frota", createdAt: "2024-01-01T00:00:00Z" },
];

export const DEMO_FUELINGS: FuelingRecord[] = [
  { id: 1, date: "2026-03-11", machineId: 1, machineName: "John Deere S790", liters: 320, operatorName: "Carlos Mendes", talhao: "Talhão A1", talhaoId: 1, safraId: 4, servico: "Colheita", responsavelId: 1, responsavelName: "Carlos Mendes", createdAt: "2026-03-11T07:00:00Z" },
  { id: 2, date: "2026-03-11", machineId: 2, machineName: "New Holland TC5.90", liters: 280, operatorName: "Paulo Andrade", talhao: "Talhão B3", talhaoId: 5, safraId: 4, servico: "Colheita", responsavelId: 2, responsavelName: "Paulo Andrade", createdAt: "2026-03-11T07:30:00Z" },
  { id: 3, date: "2026-03-10", machineId: 3, machineName: "Massey Ferguson 7245", liters: 190, operatorName: "José Silva", talhao: "Talhão C2", talhaoId: 7, safraId: 4, servico: "Transporte", responsavelId: 3, responsavelName: "José Silva", createdAt: "2026-03-10T07:00:00Z" },
  { id: 4, date: "2026-03-10", machineId: 4, machineName: "Case IH 9250", liters: 350, operatorName: "Carlos Mendes", notes: "Colheita intensa", talhao: "Talhão A2", talhaoId: 2, safraId: 4, servico: "Colheita", responsavelId: 1, responsavelName: "Carlos Mendes", createdAt: "2026-03-10T07:30:00Z" },
  { id: 5, date: "2026-03-09", machineId: 1, machineName: "John Deere S790", liters: 310, operatorName: "Carlos Mendes", talhao: "Talhão A1", talhaoId: 1, safraId: 4, servico: "Colheita", responsavelId: 1, responsavelName: "Carlos Mendes", createdAt: "2026-03-09T07:00:00Z" },
  { id: 6, date: "2026-03-08", machineId: 5, machineName: "Stara Estrela 32", liters: 120, operatorName: "Ana Rodrigues", talhao: "Talhão D1", talhaoId: 8, safraId: 4, servico: "Plantio", responsavelId: 5, responsavelName: "Ana Rodrigues", createdAt: "2026-03-08T07:00:00Z" },
];

export const DEMO_DIESEL_TRANSACTIONS: DieselTransaction[] = [
  { id: 1, date: "2026-03-12", type: "entrada", category: "Compra", value: 45000, liters: 10000, nfNumber: "NF-12345", description: "Carga completa Posto Central", safraId: 4, createdAt: "2026-03-12T10:00:00Z" },
  { id: 2, date: "2026-03-01", type: "entrada", category: "Compra", value: 36000, liters: 8000, nfNumber: "NF-12210", description: "Abastecimento mensal", safraId: 4, createdAt: "2026-03-01T09:00:00Z" },
  { id: 3, date: "2026-03-15", type: "saida", category: "Ajuste", value: 0, liters: 50, description: "Limpeza de tanque", safraId: 4, createdAt: "2026-03-15T14:00:00Z" },
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
  { id: 1, plate: "QRS-2024", model: "Volvo FH 540", capacity: 45, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, plate: "DEF-5678", model: "Scania R450", capacity: 38, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, plate: "GHI-9012", model: "Mercedes Actros", capacity: 52, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, plate: "JKL-3456", model: "Iveco Stralis", capacity: 42, status: "manutencao", createdAt: "2024-01-01T00:00:00Z" },
];

export const DEMO_USERS: ExtendedUser[] = [
  { id: 1, name: "Carlos Mendes", email: "carlos@fazenda.com", role: "admin" as UserRole, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Paulo Andrade", email: "paulo@fazenda.com", role: "operador" as UserRole, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "José Silva", email: "jose@fazenda.com", role: "operador" as UserRole, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Ana Rodrigues", email: "ana@fazenda.com", role: "admin" as UserRole, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Lucas Admin", email: "lucas@fazenda.com", role: "admin" as UserRole, status: "ativo", createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, name: "Roberto Farias", email: "roberto@fazenda.com", role: "operador" as UserRole, status: "ativo", createdAt: "2024-02-15T00:00:00Z" },
  { id: 7, name: "Marcos Lima", email: "marcos@fazenda.com", role: "operador" as UserRole, status: "ativo", createdAt: "2024-02-18T00:00:00Z" },
];

export const DEMO_STOCK_MOVEMENTS: StockMovement[] = [
  { id: 1, productId: 1, productName: "Herbicida Glifosato 480", type: "entrada", quantity: 1000, date: "2026-03-01", reason: "Compra inicial", safra: "2025/2026", safraId: 4, createdAt: "2026-03-01T10:00:00Z" },
  { id: 2, productId: 1, productName: "Herbicida Glifosato 480", type: "saida", quantity: 150, date: "2026-03-05", reason: "Aplicação soja", safra: "2025/2026", safraId: 4, talhao: "Talhão A1", talhaoId: 1, createdAt: "2026-03-05T08:00:00Z" },
  { id: 3, productId: 1, productName: "Herbicida Glifosato 480", type: "saida", quantity: 200, date: "2026-03-10", reason: "Aplicação milho", safra: "2025/2026", safraId: 4, talhao: "Talhão B3", talhaoId: 5, createdAt: "2026-03-10T09:30:00Z" },
  { id: 4, productId: 1, productName: "Herbicida Glifosato 480", type: "entrada", quantity: 550, date: "2026-03-15", reason: "Reposição estoque", safra: "2025/2026", safraId: 4, createdAt: "2026-03-15T14:20:00Z" },
  
  { id: 5, productId: 2, productName: "Fungicida Fox Xpro", type: "entrada", quantity: 200, date: "2026-02-15", reason: "Compra NF 8832", safra: "2025/2026", safraId: 4, createdAt: "2026-02-15T11:00:00Z" },
  { id: 6, productId: 2, productName: "Fungicida Fox Xpro", type: "saida", quantity: 115, date: "2026-03-18", reason: "Prevenção ferrugem", safra: "2025/2026", safraId: 4, talhao: "Talhão C2", talhaoId: 7, createdAt: "2026-03-18T07:15:00Z" },
];

export const DEMO_CROPS = [
  { id: 1, name: "Soja", description: "Soja Intacta 2 Xtend", status: "ativo" },
  { id: 2, name: "Milho", description: "Milho Safrinha", status: "ativo" },
  { id: 3, name: "Trigo", description: "Trigo de Inverno", status: "ativo" },
];

export const DEMO_TALHOES: Talhao[] = [
  { id: 1, name: "Talhão A1", property: "Fazenda São Bento", areaHectares: 20, cultureId: 1, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Talhão A2", property: "Fazenda São Bento", areaHectares: 18, cultureId: 1, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Talhão A3", property: "Sítio Novo", areaHectares: 19, cultureId: 1, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Talhão B1", property: "Fazenda Progresso", areaHectares: 22, cultureId: 2, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Talhão B3", property: "Fazenda Progresso", areaHectares: 20, cultureId: 2, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, name: "Talhão C1", property: "Fazenda São Bento", areaHectares: 21, cultureId: 1, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 7, name: "Talhão C2", property: "Agrovila", areaHectares: 24, cultureId: 1, status: "ativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
  { id: 8, name: "Talhão D1", property: "Sítio Novo", areaHectares: 15, cultureId: undefined, status: "inativo", safraId: 4, createdAt: "2024-01-01T00:00:00Z" },
];

export interface MachineMaintenance {
  id: number;
  date: string;
  machineId: number;
  description: string;
  cost: number;
  type: "preventiva" | "corretiva";
  category: "Peças" | "Serviço" | "Óleo/Lubrificantes" | "Pneus" | "Outros";
  providerName?: string;
  createdAt: string;
}

export interface MachineRevenue {
  id: number;
  date: string;
  machineId: number;
  description: string;
  value: number;
  type: "receita" | "lucro";
  source: "Prestação de Serviço" | "Locação" | "Valor Agregado Interno" | "Outros";
  safraId?: number;
  talhaoId?: number;
  createdAt: string;
}

export const DEMO_MACHINE_REVENUES: MachineRevenue[] = [
  { id: 1, date: "2026-03-10", machineId: 1, description: "Colheita vizinho (Fazenda Alvorada)", value: 15000, type: "receita", source: "Prestação de Serviço", safraId: 4, createdAt: "2026-03-10T14:00:00Z" },
  { id: 2, date: "2026-03-05", machineId: 1, description: "Colheita interna (Milho Safra 26)", value: 45000, type: "lucro", source: "Valor Agregado Interno", safraId: 4, createdAt: "2026-03-05T10:00:00Z" },
  { id: 3, date: "2026-02-28", machineId: 2, description: "Serviço de colheita terceirizado", value: 12000, type: "receita", source: "Prestação de Serviço", safraId: 4, createdAt: "2026-02-28T09:00:00Z" },
  { id: 4, date: "2026-03-12", machineId: 9, description: "Frete Soja (Cooperativa)", value: 3800, type: "receita", source: "Prestação de Serviço", safraId: 4, createdAt: "2026-03-12T16:00:00Z" },
  { id: 5, date: "2026-03-01", machineId: 3, description: "Plantio interno - Valor Agregado", value: 8500, type: "lucro", source: "Valor Agregado Interno", safraId: 4, createdAt: "2026-03-01T08:00:00Z" },
];

export const DEMO_MACHINE_MAINTENANCES: MachineMaintenance[] = [
  { id: 1, date: "2026-03-15", machineId: 1, description: "Troca de óleo de motor e filtros", cost: 3500, type: "preventiva", category: "Óleo/Lubrificantes", providerName: "Torno Mecânico Silva", createdAt: "2026-03-15T10:00:00Z" },
  { id: 2, date: "2026-02-20", machineId: 1, description: "Substituição correia do elevador", cost: 1200, type: "corretiva", category: "Peças", createdAt: "2026-02-20T14:30:00Z" },
  { id: 3, date: "2026-03-02", machineId: 2, description: "Revisão de 500 horas", cost: 4800, type: "preventiva", category: "Serviço", providerName: "Concessionária Local", createdAt: "2026-03-02T08:00:00Z" },
  { id: 4, date: "2026-03-08", machineId: 9, description: "Troca de 2 pneus dianteiros", cost: 5600, type: "corretiva", category: "Pneus", providerName: "Borracharia do Trevo", createdAt: "2026-03-08T11:00:00Z" },
];
