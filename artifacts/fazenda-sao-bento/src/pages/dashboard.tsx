import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { DEMO_DASHBOARD } from "@/lib/demo-data";
import { Loader2, Tractor, Wheat, Truck, Droplet, CircleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: apiData, isLoading } = useGetDashboardSummary();
  const data = apiData ?? DEMO_DASHBOARD;

  if (isLoading && !apiData) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const kpis = [
    { title: "Total Colhido (sc)", value: data.totalHarvestSacks.toLocaleString('pt-BR'), icon: Wheat, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Área Colhida (ha)", value: data.totalHarvestHectares.toLocaleString('pt-BR'), icon: Wheat, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Transportado (ton)", value: data.totalTransportTons.toLocaleString('pt-BR'), icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Diesel Consumido (L)", value: data.totalFuelingLiters.toLocaleString('pt-BR'), icon: Droplet, color: "text-slate-500", bg: "bg-slate-500/10" },
    { title: "Máquinas Ativas", value: data.activeMachines, icon: Tractor, color: "text-primary", bg: "bg-primary/10" },
    { title: "Estoque Crítico", value: data.lowStockProducts, icon: CircleAlert, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">Acompanhe os principais indicadores da fazenda.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="card-interactive">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Colheita por Cultura (Sacas)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.harvestByCulture} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="culture" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} style={{ textTransform: 'capitalize' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="totalSacks" radius={[6, 6, 0, 0]}>
                    {data.harvestByCulture.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.culture === 'soja' ? 'hsl(var(--primary))' : entry.culture === 'milho' ? 'hsl(var(--secondary))' : 'hsl(var(--chart-3))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Consumo de Diesel por Máquina (L)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.fuelingByMachine} layout="vertical" margin={{ top: 10, right: 30, left: 50, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="machineName" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="totalLiters" fill="hsl(var(--chart-5))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Últimas Colheitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentHarvests.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma colheita recente.</p>
                ) : (
                  data.recentHarvests.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-semibold text-foreground capitalize">{h.culture} - {h.area}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(h.date), "dd 'de' MMM, yyyy", { locale: ptBR })} • {h.machineName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{h.quantitySacks} sc</p>
                        <p className="text-xs text-muted-foreground">{h.productivity.toFixed(1)} sc/ha</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Últimos Transportes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentTransports.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">Nenhum transporte recente.</p>
                ) : (
                  data.recentTransports.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-semibold text-foreground">{t.destination}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(t.date), "dd 'de' MMM, yyyy", { locale: ptBR })} • {t.truckPlate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{t.cargoTons} ton</p>
                        <p className="text-xs text-muted-foreground">Origem: {t.origin}</p>
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
