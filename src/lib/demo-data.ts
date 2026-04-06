import { Machine, User, TransportRecord } from "@workspace/api-client";

export interface ExtendedMachine extends Omit<Machine, 'id'> {
  id: number;
  type: string;
  status: "ativo" | "manutencao" | "parado";
  horimeter: number;
  fuelLevel: number; // 0-100
  lastMaintenance: string;
  nextMaintenance: number; // horímetro
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
  date: string;
  type: "entrada" | "saida";
  quantity: number;
  unit: string;
  reason: string;
  user: string;
}

export interface ExtendedUser extends Omit<User, 'id'> {
  id: number;
  avatar?: string;
  role: "admin" | "operador" | "gerente";
  lastActive?: string;
}

export interface FuelingRecord {
  id: number;
  date: string;
  machineId: number;
  machineName: string;
  operatorId: number;
  operatorName: string;
  volumeLiters: number;
  fuelType: "Diesel S10" | "Diesel S500" | "Arla 32";
  costPerLiter: number;
  totalCost: number;
  talhaoId?: number;
  odometer?: number;
  horimeter?: number;
}

export interface DieselTransaction {
  id: number;
  date: string;
  type: "entrada" | "saída";
  volume: number;
  description: string;
  responsible: string;
  balanceAfter: number;
}

export interface BankAccount {
  id: number;
  name: string;
  icon: string; // "bb" | "cef" | "santander" | "sicoob" | "card" | "store" | "cash"
}

export interface FinancialRecord {
  id: number;
  date: string;
  type: "receita" | "despesa";
  category: string; // "Vendas", "Insumos", "Máquinas", "Administrativo", "Outros"
  description: string;
  value: number;
  status: "pago" | "aberto";
  bankAccountId: number;
  bankAccountName: string;
  safraId?: number;
  talhaoId?: number;
  machineId?: number;
  machineName?: string;
  supplier?: string;
  paymentMethod?: string;
  dueDate?: string;
  nfNumber?: string;
  createdAt: string;
}

export interface ActivityRecord {
  id: number;
  date: string;
  type: "Plantio" | "Pulverização" | "Adubação" | "Incorporação" | "Outro";
  talhaoId: number;
  talhaoName: string;
  safraId: number;
  machineId: number;
  machineName: string;
  operatorId: number;
  operatorName: string;
  products: { productId?: number; name: string; quantity: number; unit: string }[];
  areaHectares: number;
  notes?: string;
  createdAt: string;
}

export const DEMO_SAFRAS: Safra[] = [
  { id: 4, name: "Safra 2025/2026", startDate: "2025-09-01", endDate: "2026-06-30", status: "ativo" },
  { id: 1, name: "Safra 2023/2024", startDate: "2023-09-01", endDate: "2024-03-31", status: "ativo" },
  { id: 2, name: "Safrinha 2024", startDate: "2024-02-01", endDate: "2024-08-31", status: "ativo" },
  { id: 3, name: "Safra 2022/2023", startDate: "2022-09-01", endDate: "2023-03-31", status: "inativo" },
];

export interface DashboardSummary {
  totalHarvestSacks: number;
  totalHarvestHectares: number;
  totalRevenue: number;
  totalExpenses: number;
  cashBalance: number;
  upcomingPayments: number;
}

export const DEMO_DASHBOARD: DashboardSummary = {
  totalHarvestSacks: 48320,
  totalHarvestHectares: 1240,
  totalRevenue: 2450000,
  totalExpenses: 1120000,
  cashBalance: 1330000,
  upcomingPayments: 45600,
};

export const DEMO_HARVESTS: any[] = [
  { id: 1, date: "2026-03-10", cultures: ["soja"], area: "Talhão A1", talhaoId: 1, safraId: 4, areaHectares: 20, quantitySacks: 1240, productivity: 62.0, machineId: 1, machineName: "John Deere S790", driverName: "Carlos Mendes", truck: "ABC-1234", destination: "Silo Principal", weightGross: 35000, weightNet: 28000, moisture: 13.5, impurity: 1.0, createdAt: "2026-03-10T08:00:00Z" },
  { id: 2, date: "2026-03-09", cultures: ["milho"], area: "Talhão B3", talhaoId: 5, safraId: 4, areaHectares: 20, quantitySacks: 980, productivity: 49.0, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", truck: "DEF-5678", destination: "Silo Norte", weightGross: 32000, weightNet: 26000, moisture: 14.0, impurity: 1.2, createdAt: "2026-03-09T08:00:00Z" },
  { id: 3, date: "2026-03-08", cultures: ["soja"], area: "Talhão C2", talhaoId: 7, safraId: 4, areaHectares: 24, quantitySacks: 1560, productivity: 65.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", truck: "GHI-9012", destination: "Cooperativa", weightGross: 42000, weightNet: 35000, moisture: 13.0, impurity: 0.8, createdAt: "2026-03-08T08:00:00Z" },
  { id: 4, date: "2026-03-07", cultures: ["soja"], area: "Talhão A2", talhaoId: 2, safraId: 4, areaHectares: 18, quantitySacks: 1100, productivity: 61.1, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", truck: "ABC-1234", destination: "Silo Principal", weightGross: 33000, weightNet: 27000, moisture: 13.8, impurity: 1.1, createdAt: "2026-03-07T08:00:00Z" },
  { id: 5, date: "2026-03-06", cultures: ["Trigo"], area: "Talhão D1", talhaoId: 8, safraId: 4, areaHectares: 15, quantitySacks: 720, productivity: 48.0, machineId: 1, machineName: "John Deere S790", driverName: "Ana Rodrigues", truck: "JKL-3456", destination: "Silo Sul", weightGross: 25000, weightNet: 20000, moisture: 12.5, impurity: 0.5, createdAt: "2026-03-06T08:00:00Z" },
  { id: 6, date: "2026-03-05", cultures: ["milho", "soja"], area: "Talhão B1", talhaoId: 4, safraId: 4, areaHectares: 22, quantitySacks: 1090, productivity: 49.5, machineId: 2, machineName: "New Holland TC5.90", driverName: "Paulo Andrade", truck: "MNO-7890", destination: "Silo Norte", weightGross: 34000, weightNet: 27500, moisture: 14.5, impurity: 1.5, createdAt: "2026-03-05T08:00:00Z" },
  { id: 7, date: "2026-03-04", cultures: ["soja"], area: "Talhão A3", talhaoId: 3, safraId: 4, areaHectares: 19, quantitySacks: 1178, productivity: 62.0, machineId: 4, machineName: "Case IH 9250", driverName: "José Silva", truck: "PQR-1234", destination: "Cooperativa", weightGross: 36000, weightNet: 30000, moisture: 13.2, impurity: 0.9, createdAt: "2026-03-04T08:00:00Z" },
  { id: 8, date: "2026-03-03", cultures: ["soja"], area: "Talhão C1", talhaoId: 6, safraId: 4, areaHectares: 21, quantitySacks: 1302, productivity: 62.0, machineId: 3, machineName: "Massey 7245", driverName: "Carlos Mendes", truck: "STU-5678", destination: "Silo Principal", weightGross: 38000, weightNet: 32000, moisture: 13.9, impurity: 1.2, createdAt: "2026-03-03T08:00:00Z" },
];

export const DEMO_TRANSPORTS: (TransportRecord & { machineId?: number; safraId?: number })[] = [
  { id: 1, date: "2026-03-11", origin: "Armazém Central", destination: "Cooperativa Agroinova", cargoTons: 45.2, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", machineId: 9, safraId: 4, createdAt: "2026-03-11T10:00:00Z" as any },
  { id: 2, date: "2026-03-10", origin: "Silo Norte", destination: "Terminal Cerealista", cargoTons: 38.0, truckId: 2, truckPlate: "DEF-5678", driverName: "Marcos Lima", machineId: 9, safraId: 4, createdAt: "2026-03-10T10:00:00Z" as any },
  { id: 3, date: "2026-03-09", origin: "Armazém Central", destination: "Bunge Alimentos", cargoTons: 52.1, truckId: 3, truckPlate: "GHI-9012", driverName: "Roberto Farias", machineId: 10, notes: "Carga urgente", safraId: 4, createdAt: "2026-03-09T10:00:00Z" as any },
  { id: 4, date: "2026-03-08", origin: "Armazém Central", destination: "Silo Sul", cargoTons: 41.5, truckId: 1, truckPlate: "QRS-2024", driverName: "Roberto Farias", machineId: 10, safraId: 4, createdAt: "2026-03-08T10:00:00Z" as any },
];

export const DEMO_MACHINES: ExtendedMachine[] = [
  { id: 1, name: "John Deere S790", type: "colheitadeira", status: "ativo", horimeter: 1240, fuelLevel: 85, lastMaintenance: "2026-01-15", nextMaintenance: 1500 },
  { id: 2, name: "New Holland TC5.90", type: "colheitadeira", status: "ativo", horimeter: 850, fuelLevel: 42, lastMaintenance: "2026-02-10", nextMaintenance: 1000 },
  { id: 3, name: "Massey Ferguson 7245", type: "colheitadeira", status: "manutencao", horimeter: 2100, fuelLevel: 12, lastMaintenance: "2026-03-05", nextMaintenance: 2200 },
  { id: 4, name: "Case IH Axial-Flow 9250", type: "colheitadeira", status: "ativo", horimeter: 450, fuelLevel: 98, lastMaintenance: "2026-02-28", nextMaintenance: 750 },
  { id: 5, name: "John Deere 8R 370", type: "trator", status: "ativo", horimeter: 620, fuelLevel: 65, lastMaintenance: "2026-01-20", nextMaintenance: 1000 },
  { id: 6, name: "TDP 12000", type: "pulverizador", status: "ativo", horimeter: 340, fuelLevel: 72, lastMaintenance: "2026-02-15", nextMaintenance: 500 },
  { id: 7, name: "Stara Imperador 4000", type: "pulverizador", status: "parado", horimeter: 890, fuelLevel: 5, lastMaintenance: "2026-01-05", nextMaintenance: 1000 },
  { id: 8, name: "Valtra BH 224", type: "trator", status: "ativo", horimeter: 4500, fuelLevel: 55, lastMaintenance: "2026-02-25", nextMaintenance: 4750 },
  { id: 9, name: "Caminhão Scania R540", type: "transporte", status: "ativo", horimeter: 75000, fuelLevel: 90, lastMaintenance: "2026-02-10", nextMaintenance: 85000 },
  { id: 10, name: "Caminhão Volvo FH 540", type: "transporte", status: "ativo", horimeter: 12000, fuelLevel: 60, lastMaintenance: "2026-01-30", nextMaintenance: 20000 },
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

export interface TalhaoCultura {
  talhaoId: number;
  safraId: number;
  cultureId: number;
}

export const DEMO_TALHAO_CULTURAS: TalhaoCultura[] = [
  { talhaoId: 1, safraId: 4, cultureId: 1 },
  { talhaoId: 2, safraId: 4, cultureId: 1 },
  { talhaoId: 3, safraId: 4, cultureId: 1 },
  { talhaoId: 4, safraId: 4, cultureId: 2 },
  { talhaoId: 5, safraId: 4, cultureId: 2 },
  { talhaoId: 6, safraId: 4, cultureId: 1 },
  { talhaoId: 7, safraId: 4, cultureId: 1 },
];

export const DEMO_USERS: ExtendedUser[] = [
  { id: 1, name: "Lucas Almeida", email: "lucas@fazenda.com.br", role: "admin", avatar: "/avatars/lucas.png", lastActive: "2 minutes ago" },
  { id: 2, name: "João Pedro", email: "joao@fazenda.com.br", role: "operador", avatar: "/avatars/joao.png", lastActive: "1 hour ago" },
  { id: 3, name: "Marcos Lima", email: "marcos@fazenda.com.br", role: "operador", avatar: "/avatars/marcos.png", lastActive: "Yesterday" },
  { id: 4, name: "Roberto Farias", email: "roberto@fazenda.com.br", role: "operador", lastActive: "3 hours ago" },
];

export const DEMO_BANK_ACCOUNTS: BankAccount[] = [
  { id: 1, name: "Banco do Brasil", icon: "bb" },
  { id: 2, name: "Sicoob", icon: "sicoob" },
  { id: 3, name: "Santander", icon: "santander" },
  { id: 4, name: "Caixa", icon: "cef" },
  { id: 5, name: "Dinheiro (Caixa)", icon: "cash" },
];

export const DEMO_FINANCIAL_RECORDS: FinancialRecord[] = [
  { id: 1, date: "2026-03-12", type: "despesa", category: "Insumos", description: "Compra de Fertilizante NPK", value: 45600, status: "pago", bankAccountId: 1, bankAccountName: "Banco do Brasil", supplier: "Agropecuária Central", paymentMethod: "Boleto", dueDate: "2026-04-12", nfNumber: "88901", createdAt: "2026-03-12T09:00:00Z" },
  { id: 2, date: "2026-03-11", type: "receita", category: "Vendas", description: "Venda Safra Soja - 500sc", value: 87500, status: "pago", bankAccountId: 2, bankAccountName: "Sicoob", supplier: "Cooperativa ABC", paymentMethod: "Pix", dueDate: "2026-03-11", nfNumber: "NF-992", createdAt: "2026-03-11T14:30:00Z" },
  { id: 3, date: "2026-03-11", type: "despesa", category: "Máquinas", description: "Manutenção Trator JD 8R", value: 3450, status: "pago", bankAccountId: 1, bankAccountName: "Banco do Brasil", supplier: "JD Peças", paymentMethod: "Cartão", dueDate: "2026-03-25", nfNumber: "12234", machineId: 5, machineName: "John Deere 8R 370", createdAt: "2026-03-11T10:00:00Z" },
  { id: 4, date: "2026-03-10", type: "despesa", category: "Combustível", description: "Abastecimento Diesel S10", value: 12500, status: "aberto", bankAccountId: 3, bankAccountName: "Santander", supplier: "Posto do Campo", paymentMethod: "Boleto", dueDate: "2026-03-30", createdAt: "2026-03-10T16:00:00Z" },
  { id: 5, date: "2026-03-10", type: "despesa", category: "Administrativo", description: "Energia Elétrica", value: 890, status: "pago", bankAccountId: 1, bankAccountName: "Banco do Brasil", supplier: "Copel", paymentMethod: "Débito Automático", dueDate: "2026-03-10", createdAt: "2026-03-10T08:00:00Z" },
  { id: 6, date: "2026-03-08", type: "despesa", category: "Máquinas", description: "Troca de Óleo - Colheitadeira", value: 1850, status: "pago", bankAccountId: 2, bankAccountName: "Sicoob", supplier: "Mecânica Agrícola", paymentMethod: "Pix", machineId: 1, machineName: "John Deere S790", createdAt: "2026-03-08T09:00:00Z" },
  { id: 7, date: "2026-03-05", type: "despesa", category: "Máquinas", description: "Reparo Barra de Corte", value: 4200, status: "pago", bankAccountId: 1, bankAccountName: "Banco do Brasil", supplier: "Peças & Cia", paymentMethod: "Boleto", machineId: 1, machineName: "John Deere S790", createdAt: "2026-03-05T15:00:00Z" },
];

export const DEMO_ACTIVITIES: ActivityRecord[] = [
  { 
    id: 1, date: "2026-03-12", type: "Plantio", talhaoId: 1, talhaoName: "Talhão A1", safraId: 4, machineId: 1, machineName: "John Deere 8R", operatorId: 1, operatorName: "Lucas Lima", areaHectares: 45, 
    products: [
      { productId: 1, name: "Semente Soja RR", quantity: 2.5, unit: "sc/ha" },
      { productId: 3, name: "NPK 04-14-08", quantity: 250, unit: "kg/ha" }
    ],
    createdAt: "2026-03-12T10:00:00Z" 
  },
  { 
    id: 2, date: "2026-03-11", type: "Pulverização", talhaoId: 1, talhaoName: "Talhão A1", safraId: 4, machineId: 6, machineName: "TDP 12000", operatorId: 2, operatorName: "Marcos Silva", areaHectares: 20, 
    products: [
      { productId: 2, name: "Glifosato 480", quantity: 3, unit: "L/ha" }
    ],
    notes: "Aplicação pré-emergente", 
    createdAt: "2026-03-11T16:00:00Z" 
  },
  { 
    id: 3, date: "2026-02-15", type: "Incorporação", talhaoId: 1, talhaoName: "Talhão A1", safraId: 4, machineId: 8, machineName: "Valtra BH 224", operatorId: 3, operatorName: "José Santos", areaHectares: 20, 
    products: [],
    notes: "Preparo de solo pós-chuva",
    createdAt: "2026-02-15T08:00:00Z" 
  },
  { 
    id: 4, date: "2026-01-20", type: "Adubação", talhaoId: 1, talhaoName: "Talhão A1", safraId: 4, machineId: 5, machineName: "John Deere 8R 370", operatorId: 1, operatorName: "Lucas Almeida", areaHectares: 20, 
    products: [
      { productId: 105, name: "Cloreto de Potássio", quantity: 120, unit: "kg/ha" }
    ],
    createdAt: "2026-01-20T08:00:00Z" 
  },
  { 
    id: 5, date: "2026-03-15", type: "Pulverização", talhaoId: 4, talhaoName: "Talhão B1", safraId: 4, machineId: 7, machineName: "Stara Imperador 4000", operatorId: 2, operatorName: "Marcos Lima", areaHectares: 22, 
    products: [
      { productId: 2, name: "Glifosato 480", quantity: 2.5, unit: "L/ha" }
    ],
    createdAt: "2026-03-15T14:00:00Z" 
  }
];

export const DEMO_PRODUCTS = [
  { id: 1, name: "Semente Soja RR", category: "Sementes", currentStock: 450, minStock: 100, unit: "SC" },
  { id: 2, name: "Glifosato 480", category: "Defensivos", currentStock: 120, minStock: 200, unit: "L" },
  { id: 3, name: "NPK 04-14-08", category: "Fertilizantes", currentStock: 12500, minStock: 5000, unit: "KG" },
  { id: 4, name: "Diesel S10", category: "Combustível", currentStock: 50, minStock: 1000, unit: "L" },
];

export const DEMO_CROPS = [
  { id: 1, name: "Soja", color: "#4CAF50" },
  { id: 2, name: "Milho", color: "#FFC107" },
  { id: 3, name: "Trigo", color: "#F44336" },
  { id: 4, name: "Cana-de-Açúcar", color: "#8BC34A" },
];

export const DEMO_STOCK_MOVEMENTS = [
  { id: 1, productId: 1, date: "2026-03-12T10:00:00Z", type: "saida", quantity: 50, unit: "SC", reason: "Plantio Talhão A1", safra: "2025/2026", talhao: "Talhão A1" },
  { id: 2, productId: 1, date: "2026-03-10T08:00:00Z", type: "entrada", quantity: 500, unit: "SC", reason: "Compra NF-1234", safra: "2025/2026" },
  { id: 3, productId: 2, date: "2026-03-11T16:00:00Z", type: "saida", quantity: 360, unit: "L", reason: "Dessecação Talhão B2", safra: "2025/2026", talhao: "Talhão B2" },
  { id: 4, productId: 2, date: "2026-03-05T09:00:00Z", type: "entrada", quantity: 480, unit: "L", reason: "Compra NF-1122", safra: "2024/2025" },
  { id: 5, productId: 4, date: "2026-03-12T17:30:00Z", type: "saida", quantity: 450, unit: "L", reason: "Abastecimento Frota", safra: "2025/2026" },
  { id: 6, productId: 3, date: "2026-03-08T14:00:00Z", type: "entrada", quantity: 2000, unit: "KG", reason: "Compra NF-1550", safra: "2025/2026" },
];

export const DEMO_DIESEL_MOVEMENTS: DieselTransaction[] = [
  { id: 1, date: "2026-03-12", type: "saída", volume: 450, description: "Abast. John Deere S790", responsible: "João Pedro", balanceAfter: 4550 },
  { id: 2, date: "2026-03-11", type: "entrada", volume: 5000, description: "Compra Trr", responsible: "Lucas Almeida", balanceAfter: 5000 },
];

export interface MachineMaintenance {
  id: number;
  machineId: number;
  description: string;
  cost: number;
  date: string;
  type: "preventiva" | "corretiva";
  category: "Peças" | "Serviço" | "Óleo/Lubrificantes" | "Pneus" | "Outros";
  providerName?: string;
  createdAt: string;
}

export const DEMO_MACHINE_MAINTENANCES: MachineMaintenance[] = [
  { id: 1, machineId: 1, description: "Troca de óleo do motor", cost: 1250, date: "2026-01-15", type: "preventiva", category: "Óleo/Lubrificantes", providerName: "Oficina Central", createdAt: "2026-01-15T10:00:00Z" },
  { id: 2, machineId: 2, description: "Revisão geral de colheita", cost: 4500, date: "2026-02-10", type: "preventiva", category: "Serviço", providerName: "AgroAssist", createdAt: "2026-02-10T10:00:00Z" },
];

export const DEMO_MACHINE_REVENUES = [
  { id: 1, machineId: 1, description: "Prestação de serviço colheita", value: 12500, date: "2026-03-12", type: "lucro", source: "Terceiros" },
  { id: 2, machineId: 2, description: "Venda de excedente diesel", value: 4500, date: "2026-03-11", type: "receita", source: "Venda Interna" },
];

export const DEMO_FUELINGS: FuelingRecord[] = [
  { id: 1, date: "2026-03-12", machineId: 1, machineName: "John Deere S790", operatorId: 2, operatorName: "João Pedro", volumeLiters: 450, fuelType: "Diesel S10", costPerLiter: 5.80, totalCost: 2610, talhaoId: 1, odometer: 1240, horimeter: 1240 },
  { id: 2, date: "2026-03-11", machineId: 2, machineName: "New Holland TC5.90", operatorId: 3, operatorName: "Marcos Lima", volumeLiters: 320, fuelType: "Diesel S10", costPerLiter: 5.85, totalCost: 1872, talhaoId: 5, odometer: 850, horimeter: 850 },
  { id: 3, date: "2026-03-10", machineId: 5, machineName: "John Deere 8R 370", operatorId: 1, operatorName: "Lucas Almeida", volumeLiters: 280, fuelType: "Diesel S10", costPerLiter: 5.80, totalCost: 1624, talhaoId: 1, odometer: 620, horimeter: 620 },
];
