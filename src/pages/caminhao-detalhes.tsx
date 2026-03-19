import { useMemo, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DEMO_TRANSPORTS, DEMO_TRUCKS } from "@/lib/demo-data";
import { 
  Truck, 
  Calendar, 
  BarChart3, 
  ChevronRight,
  TrendingUp,
  Map,
  Package,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip
} from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  tons: {
    label: "Toneladas",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const STATUS_STYLES: Record<string, string> = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CaminhaoDetalhes() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const truck = useMemo(() => {
    return DEMO_TRUCKS.find(t => t.id === Number(id));
  }, [id]);

  const stats = useMemo(() => {
    if (!truck) return null;

    let transports = DEMO_TRANSPORTS.filter(t => t.truckId === truck.id);

    if (selectedMonth !== "all") {
      const monthIndex = parseInt(selectedMonth);
      transports = transports.filter(t => new Date(t.date).getMonth() === monthIndex);
    }

    const totalTons = transports.reduce((acc, t) => acc + t.cargoTons, 0);
    const totalTrips = transports.length;

    const transportChartData = transports
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => ({
        date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tons: t.cargoTons,
      }));

    return {
      totalTons,
      totalTrips,
      truckTransports: transports,
      transportChartData
    };
  }, [truck, selectedMonth]);

  if (!truck) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Caminhão não encontrado</h2>
          <Button onClick={() => setLocation("/caminhoes")}>Voltar para Caminhões</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/caminhoes" className="hover:text-primary transition-colors">Caminhões</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">{truck.plate}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-mono tracking-widest text-slate-900 leading-tight">{truck.plate}</h1>
              <Badge variant="outline" className={cn("font-semibold uppercase tracking-wider text-[10px]", STATUS_STYLES[truck.status as string])}>
                {truck.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              {truck.model || "Modelo não informado"} · Capacidade {truck.capacity || "--"} ton
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="0">Janeiro</SelectItem>
              <SelectItem value="1">Fevereiro</SelectItem>
              <SelectItem value="2">Março</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Maio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Package, label: "Volume Total", value: stats?.totalTons.toFixed(1).replace('.', ','), unit: "ton" },
          { icon: Map, label: "Viagens Realizadas", value: stats?.totalTrips, unit: "viagens" },
          { icon: TrendingUp, label: "Média por Viagem", value: stats?.totalTrips ? (stats.totalTons / stats.totalTrips).toFixed(1).replace('.', ',') : "0", unit: "ton/viagem", primary: true },
        ].map((kpi, idx) => (
          <Card key={idx} className={cn("bg-white border-slate-200", kpi.primary && "border-primary/20 bg-primary/[0.02]")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <kpi.icon className={cn("w-3.5 h-3.5", kpi.primary ? "text-primary" : "text-slate-400")} /> {kpi.label}
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {kpi.value} <span className="text-xs font-normal text-slate-500 uppercase ml-1 tracking-tight">{kpi.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Lists Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1 w-full justify-start gap-1 h-auto min-h-[44px]">
          <TabsTrigger value="overview" className="px-6 py-2">Dashboard</TabsTrigger>
          <TabsTrigger value="transports" className="px-6 py-2">Histórico de Transportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-white border-slate-200 max-w-4xl">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Volume Diário de Transporte (ton)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                {stats?.transportChartData.length ? (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart data={stats.transportChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                      <YAxis fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                      <RechartsTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="tons" fill="var(--color-tons)" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <BarChart3 className="w-8 h-8 opacity-20" />
                    <span className="text-sm italic font-medium">Sem dados de transporte no período</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transports" className="space-y-4">
          {/* TABELA — desktop */}
          <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead className="text-right">Carga (t)</TableHead>
                  <TableHead className="text-right">Frete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.truckTransports?.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum transporte encontrado.</TableCell></TableRow>
                )}
                {stats?.truckTransports?.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{r.driverName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.origin} <span className="mx-1 text-border">→</span> {r.destination}
                    </TableCell>
                    <TableCell className="text-right font-bold">{r.cargoTons} t</TableCell>
                    <TableCell className="text-right text-[hsl(var(--success-text))] font-medium">
                      {r.freightValue ? `R$ ${(Number(r.freightValue) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* CARDS — mobile */}
          <div className="sm:hidden space-y-3">
            {stats?.truckTransports?.length === 0 && (
              <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
                Nenhum transporte encontrado.
              </div>
            )}
            {stats?.truckTransports?.map((r: any) => (
              <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] tracking-widest uppercase">
                      TR-{r.id.toString().padStart(4, '0')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-foreground text-sm">{r.origin}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-semibold text-foreground text-sm">{r.destination}</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{r.driverName}</p>
                  <div className="text-right">
                    <p className="font-bold text-[hsl(var(--info))] text-base leading-tight">{r.cargoTons} t</p>
                    {r.freightValue ? (
                      <p className="text-xs text-[hsl(var(--success-text))] font-semibold">
                        R$ {(Number(r.freightValue) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </AppLayout>
  );
}
