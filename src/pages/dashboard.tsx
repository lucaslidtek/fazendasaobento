import { AppLayout } from "@/components/layout/AppLayout";
import { DEMO_HARVESTS, DEMO_TRANSPORTS, DEMO_FUELINGS, DEMO_MACHINES, DEMO_TRUCKS, DEMO_PRODUCTS, type FuelingRecord } from "@/lib/demo-data";
import { Tractor, Wheat, Truck, Droplet, CircleAlert, TrendingUp, TrendingDown, Minus, Printer, RefreshCw, DollarSign, BarChart3, Sprout, Beef, Coffee, Leaf, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/auth";
import { getCultureChartColor } from "@/lib/colors";
import { useFarm } from "@/contexts/FarmContext";
import { cn } from "@/lib/utils";

// ─── Cotações do Dia — dados mock (CEPEA/ESALQ + Google Finance) ────────────
interface MarketTileData {
  code: string;
  label: string;
  icon: any;
  iconColor: string;
  value: string;
  change: number;
  direction: "up" | "down" | "neutral";
  prefix?: string;
  suffix?: string;
  highlighted?: boolean;
}

const MARKET_TILES: MarketTileData[] = [
  { code: "soja",    label: "Soja",      icon: Sprout,    iconColor: "text-emerald-600", value: "136,50", change: +0.82, direction: "up",      prefix: "R$ ", suffix: "/sc",   highlighted: true  },
  { code: "milho",   label: "Milho",     icon: Leaf,      iconColor: "text-yellow-600",  value: "62,40",  change: -0.31, direction: "down",    prefix: "R$ ", suffix: "/sc",   highlighted: true  },
  { code: "USD",     label: "Dólar",     icon: DollarSign,iconColor: "text-emerald-600", value: "5,2240", change: +0.14, direction: "up",      prefix: "R$ "                                     },
  { code: "IBOV",   label: "Ibovespa",  icon: BarChart3, iconColor: "text-amber-600",   value: "129.847",change: +0.56, direction: "up",      suffix: " pts"                                    },
  { code: "boi",     label: "Boi Gordo", icon: Beef,      iconColor: "text-red-700",     value: "321,80", change: -0.20, direction: "down",    prefix: "R$ ", suffix: "/@"                       },
  { code: "cafe",    label: "Café",      icon: Coffee,    iconColor: "text-amber-800",   value: "1.284,00",change:+1.05, direction: "up",     prefix: "R$ ", suffix: "/sc"                       },
];

function MarketTile({ tile, highlighted }: { tile: MarketTileData; highlighted?: boolean }) {
  const Icon = tile.icon;
  return (
    <div className={cn(
      "group flex flex-col justify-between rounded-xl border px-3 py-2.5 transition-all duration-200 min-h-[72px]",
      highlighted
        ? "bg-primary/5 border-primary/20 hover:bg-primary/8"
        : "bg-background border-border/40 hover:bg-muted/20 hover:border-border/60"
    )}>
      {/* Header: icon + label + badge */}
      <div className="flex w-full items-start justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="shrink-0 p-1 rounded-md bg-muted/20 group-hover:bg-muted/30 transition-colors">
            <Icon className={cn("h-3.5 w-3.5", tile.iconColor)} />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate mt-px">
            {tile.label}
          </p>
        </div>
        <span className={cn(
          "inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-px rounded border tabular-nums whitespace-nowrap shrink-0",
          tile.direction === "up"      && "text-emerald-700 bg-emerald-50 border-emerald-200/50",
          tile.direction === "down"    && "text-red-600 bg-red-50 border-red-200/50",
          tile.direction === "neutral" && "text-muted-foreground bg-muted/20 border-border/30"
        )}>
          {tile.direction === "up"   && <TrendingUp className="h-2 w-2" />}
          {tile.direction === "down" && <TrendingDown className="h-2 w-2" />}
          {tile.direction === "neutral" && <Minus className="h-2 w-2" />}
          {tile.change > 0 ? "+" : ""}{tile.change.toFixed(2)}%
        </span>
      </div>
      {/* Value */}
      <p className="text-sm font-bold text-foreground tabular-nums leading-tight truncate">
        {tile.prefix}{tile.value}{tile.suffix}
      </p>
    </div>
  );
}



export default function Dashboard() {
  const { user } = useAuth();
  const { selectedSafraId, selectedTalhaoId } = useFarm();

  const harvests = DEMO_HARVESTS.filter(h => 
    (!selectedSafraId || h.safraId === selectedSafraId) && 
    (!selectedTalhaoId || h.talhaoId === selectedTalhaoId)
  );
  
  const transports = DEMO_TRANSPORTS.filter((t: any) => 
    (!selectedSafraId || t.safraId === selectedSafraId) && 
    (!selectedTalhaoId || t.talhaoId === selectedTalhaoId)
  );

  const fuelings = DEMO_FUELINGS.filter((f: any) => 
    (!selectedSafraId || f.safraId === selectedSafraId) && 
    (!selectedTalhaoId || f.talhaoId === selectedTalhaoId)
  );

  const totalHarvestSacks = harvests.reduce((acc, h) => acc + (h.quantitySacks || 0), 0);
  const totalHarvestHectares = harvests.reduce((acc, h) => acc + (h.areaHectares || 0), 0);
  const totalTransportTons = transports.reduce((acc, t) => acc + (t.cargoTons || 0), 0);
  const totalFuelingLiters = fuelings.reduce((acc, f: FuelingRecord) => acc + (f.volumeLiters || 0), 0);
  
  const activeMachines = DEMO_MACHINES.filter(m => m.status === 'ativo').length;
  const activeTrucks = (DEMO_TRUCKS as any[]).filter(t => t.status === 'ativo').length;
  const lowStockProducts = DEMO_PRODUCTS.filter(p => p.currentStock <= (p.minStock || 0)).length;

  const harvestByCultureMap = harvests.reduce((acc: any, h) => {
    h.cultures?.forEach((c: string) => {
      if (!acc[c]) acc[c] = { totalSacks: 0, totalHectares: 0 };
      acc[c].totalSacks += h.quantitySacks || 0;
      acc[c].totalHectares += h.areaHectares || 0;
    });
    return acc;
  }, {});
  const harvestByCulture = Object.entries(harvestByCultureMap).map(([culture, vals]: any) => ({ culture, ...vals }));

  const fuelingByMachineMap = fuelings.reduce((acc: any, f: FuelingRecord) => {
    if (!acc[f.machineName]) acc[f.machineName] = 0;
    acc[f.machineName] += f.volumeLiters || 0;
    return acc;
  }, {});
  const fuelingByMachine = Object.entries(fuelingByMachineMap).map(([machineName, totalLiters]) => ({ machineName, totalLiters }));

  const data = {
    totalHarvestSacks,
    totalHarvestHectares,
    totalTransportTons,
    totalFuelingLiters,
    activeMachines,
    activeTrucks,
    lowStockProducts,
    harvestByCulture,
    fuelingByMachine,
    recentHarvests: harvests.slice(0, 5),
    recentTransports: transports.slice(0, 5)
  };

  if (!data) return null;

  const kpis = [
    {
      title: "Total Colhido",
      value: (data.totalHarvestSacks ?? 0).toLocaleString("pt-BR"),
      unit: "sacas",
      icon: Wheat,
      colorClass: "text-[hsl(var(--success-text))]",
      bgClass: "bg-[hsl(var(--success-subtle))]",
    },
    {
      title: "Área Colhida",
      value: (data.totalHarvestHectares ?? 0).toLocaleString("pt-BR"),
      unit: "hectares",
      icon: TrendingUp,
      colorClass: "text-[hsl(var(--primary))]",
      bgClass: "bg-[hsl(var(--primary)/0.1)]",
    },
    {
      title: "Transportado",
      value: (data.totalTransportTons ?? 0).toLocaleString("pt-BR"),
      unit: "toneladas",
      icon: Truck,
      colorClass: "text-[hsl(var(--info-text))]",
      bgClass: "bg-[hsl(var(--info-subtle))]",
    },
    {
      title: "Diesel Consumido",
      value: (data.totalFuelingLiters ?? 0).toLocaleString("pt-BR"),
      unit: "litros",
      icon: Droplet,
      colorClass: "text-[hsl(var(--warning-text))]",
      bgClass: "bg-[hsl(var(--warning-subtle))]",
    },
    {
      title: "Máquinas Ativas",
      value: String(data.activeMachines),
      unit: "unidades",
      icon: Tractor,
      colorClass: "text-[hsl(var(--primary))]",
      bgClass: "bg-[hsl(var(--primary)/0.1)]",
    },
    {
      title: "Estoque Crítico",
      value: String(data.lowStockProducts),
      unit: "produtos",
      icon: CircleAlert,
      colorClass: "text-[hsl(var(--destructive))]",
      bgClass: "bg-[hsl(var(--destructive)/0.1)]",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Cabeçalho — visível apenas no desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Visão Geral</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe os principais indicadores da fazenda.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl overflow-hidden">
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </Button>
        </div>

        {/* Saudação mobile */}
        <div className="md:hidden no-print">
          <p className="text-sm text-muted-foreground font-medium">
            Olá, {user?.name?.split(" ")[0]} 👋
          </p>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <h2 className="text-xl font-bold text-foreground">
              Resumo da fazenda
            </h2>
          </div>
        </div>

        {/* ─── Cotações do Dia (estilo GQB) ─────────────────────────────────── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4 md:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Wheat className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Cotações do Dia</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" />
                {format(new Date(), "HH:mm", { locale: ptBR })}
              </span>
              <span className="text-[8px] text-muted-foreground/40 hidden md:inline">CEPEA/ESALQ · Google Finance</span>
            </div>
          </div>

          {/* Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {MARKET_TILES.map((tile) => (
              <MarketTile key={tile.code} tile={tile} highlighted={tile.highlighted} />
            ))}
          </div>
        </div>

        {/* ─── KPIs operacionais (linha compacta) ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="card-interactive border-card-border">
              <CardContent className="p-4 md:p-5">
                <div className={`inline-flex p-2 rounded-xl mb-3 ${kpi.bgClass}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.colorClass}`} />
                </div>
                <p className="text-xs font-semibold text-muted-foreground leading-tight mb-1">
                  {kpi.title}
                </p>
                <p className="text-xl md:text-2xl font-bold text-foreground leading-none">
                  {kpi.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">
                  {kpi.unit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">
                Colheita por Cultura (Sacas)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[240px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.harvestByCulture ?? []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="culture"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    dy={10}
                    style={{ textTransform: "capitalize" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="totalSacks" radius={[6, 6, 0, 0]}>
                    {(data.harvestByCulture ?? []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCultureChartColor(entry.culture)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">
                Consumo de Diesel por Máquina (L)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[240px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.fuelingByMachine ?? []}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="machineName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                    dx={-8}
                    width={70}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="totalLiters"
                    fill="hsl(var(--chart-5))"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Listas recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Últimas Colheitas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(data.recentHarvests ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    Nenhuma colheita recente.
                  </p>
                ) : (
                  (data.recentHarvests ?? []).map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground capitalize text-sm truncate">
                          {h.cultures?.join(", ") ?? "—"} — {h.area}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(h.date), "dd 'de' MMM, yyyy", {
                            locale: ptBR,
                          })}{" "}
                          · {h.machineName}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary text-sm">
                          {h.quantitySacks} sc
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {h.productivity.toFixed(1)} sc/ha
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Últimos Transportes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(data.recentTransports ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    Nenhum transporte recente.
                  </p>
                ) : (
                  (data.recentTransports ?? []).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {t.destination}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(t.date), "dd 'de' MMM, yyyy", {
                            locale: ptBR,
                          })}{" "}
                          · {t.truckPlate}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[hsl(var(--info))] text-sm">
                          {t.cargoTons} ton
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.origin}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
