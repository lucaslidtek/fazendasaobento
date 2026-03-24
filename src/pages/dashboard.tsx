import { AppLayout } from "@/components/layout/AppLayout";
import { DEMO_HARVESTS, DEMO_TRANSPORTS, DEMO_FUELINGS, DEMO_MACHINES, DEMO_TRUCKS, DEMO_PRODUCTS } from "@/lib/demo-data";
import { Loader2, Tractor, Wheat, Truck, Droplet, CircleAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/auth";
import { getCultureChartColor } from "@/lib/colors";
import { useFarm } from "@/contexts/FarmContext";

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
  const totalFuelingLiters = fuelings.reduce((acc, f) => acc + (f.liters || 0), 0);
  
  const activeMachines = DEMO_MACHINES.filter(m => m.status === 'ativo').length;
  const activeTrucks = DEMO_TRUCKS.filter(t => t.status === 'ativo').length;
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

  const fuelingByMachineMap = fuelings.reduce((acc: any, f) => {
    if (!acc[f.machineName]) acc[f.machineName] = 0;
    acc[f.machineName] += f.liters || 0;
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
      colorClass: "text-[hsl(var(--accent))]",
      bgClass: "bg-[hsl(var(--accent)/0.12)]",
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
      colorClass: "text-[hsl(var(--info))]",
      bgClass: "bg-[hsl(var(--info)/0.1)]",
    },
    {
      title: "Diesel Consumido",
      value: (data.totalFuelingLiters ?? 0).toLocaleString("pt-BR"),
      unit: "litros",
      icon: Droplet,
      colorClass: "text-[hsl(var(--muted-foreground))]",
      bgClass: "bg-[hsl(var(--muted)/1)]",
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
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe os principais indicadores da fazenda.
          </p>
        </div>

        {/* Saudação mobile */}
        <div className="md:hidden">
          <p className="text-sm text-muted-foreground font-medium">
            Olá, {user?.name?.split(" ")[0]} 👋
          </p>
          <h2 className="text-xl font-bold text-foreground mt-0.5">
            Resumo da fazenda
          </h2>
        </div>

        {/* KPI Grid — 2 colunas no mobile, 3 no sm, 6 no xl */}
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
