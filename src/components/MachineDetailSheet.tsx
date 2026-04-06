import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_HARVESTS, DEMO_FUELINGS, DEMO_TRANSPORTS } from "@/lib/demo-data";
import { Tractor, Box, Fuel, Map, TrendingUp, Calendar, DollarSign, BarChart3, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  LineChart, 
  Line 
} from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface MachineDetailSheetProps {
  machine: any | null;
  onClose: () => void;
}

const chartConfig = {
  sacks: {
    label: "Sacos",
    color: "hsl(var(--primary))",
  },
  liters: {
    label: "Litros",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const STATUS_STYLES: Record<string, string> = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const TYPE_LABELS: Record<string, string> = {
  trator: "Trator",
  colheitadeira: "Colheitadeira",
  caminhao: "Caminhão",
  equipamento: "Equipamento",
};

export function MachineDetailSheet({ machine, onClose }: MachineDetailSheetProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const isOpen = !!machine;

  const stats = useMemo(() => {
    if (!machine) return null;

    let harvests = DEMO_HARVESTS.filter(h => h.machineId === machine.id);
    let fuelings = DEMO_FUELINGS.filter(f => f.machineId === machine.id);
    let transports = DEMO_TRANSPORTS.filter(t => t.machineId === machine.id);

    if (selectedMonth !== "all") {
      const monthIndex = parseInt(selectedMonth);
      harvests = harvests.filter(h => new Date(h.date).getMonth() === monthIndex);
      fuelings = fuelings.filter(f => new Date(f.date).getMonth() === monthIndex);
      transports = transports.filter(t => new Date(t.date).getMonth() === monthIndex);
    }

    const totalSacks = harvests.reduce((acc, h) => acc + h.quantitySacks, 0);
    const totalArea = harvests.reduce((acc, h) => acc + h.areaHectares, 0);
    const totalLiters = fuelings.reduce((acc, f) => acc + f.liters, 0);
    const totalTons = transports.reduce((acc, t) => acc + t.cargoTons, 0);
    const avgProductivity = totalArea > 0 ? (totalSacks / totalArea).toFixed(1) : "0";

    // Chart data: Harvests by date
    const harvestChartData = harvests
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(h => ({
        date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        sacks: h.quantitySacks,
      }));

    // Chart data: Fueling by date
    const fuelingChartData = fuelings
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(f => ({
        date: new Date(f.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        liters: f.liters,
      }));

    return {
      totalSacks,
      totalArea,
      totalLiters,
      totalTons,
      avgProductivity,
      machineHarvests: harvests,
      machineFuelings: fuelings,
      machineTransports: transports,
      harvestChartData,
      fuelingChartData
    };
  }, [machine, selectedMonth]);

  if (!machine) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto bg-muted/30">
        <SheetHeader className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Tractor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">{machine.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {TYPE_LABELS[machine.type as string]} · {machine.model}
                  </span>
                  <Badge variant="outline" className={cn("ml-2 font-semibold", STATUS_STYLES[machine.status as string])}>
                    {machine.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-[150px]">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-9 bg-card">
                  <SelectValue placeholder="Filtrar Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Meses</SelectItem>
                  <SelectItem value="0">Janeiro</SelectItem>
                  <SelectItem value="1">Fevereiro</SelectItem>
                  <SelectItem value="2">Março</SelectItem>
                  <SelectItem value="3">Abril</SelectItem>
                  <SelectItem value="4">Maio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            {machine.purchase_cost && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-3 py-2 rounded-lg border border-border">
                <DollarSign className="w-4 h-4 text-[hsl(var(--success-text))]" />
                Custo de Aquisição: 
                <span className="text-[hsl(var(--success-text))] font-bold ml-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(machine.purchase_cost)}
                </span>
              </div>
            )}
            {machine.location && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Localização: <span className="text-muted-foreground font-bold ml-1">{machine.location}</span>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1 uppercase font-bold tracking-wider">
                <Box className="w-3 h-3 text-primary" /> Produção
              </div>
              <div className="text-lg font-bold text-foreground">{stats?.totalSacks.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-tighter">sc</span></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1 uppercase font-bold tracking-wider">
                <Map className="w-3 h-3 text-primary" /> Área
              </div>
              <div className="text-lg font-bold text-foreground">{stats?.totalArea.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-tighter">ha</span></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1 uppercase font-bold tracking-wider">
                <Fuel className="w-3 h-3 text-primary" /> Combustível
              </div>
              <div className="text-lg font-bold text-foreground">{stats?.totalLiters.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-tighter">L</span></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1 uppercase font-bold tracking-wider">
                <Truck className="w-3 h-3 text-primary" /> Transporte
              </div>
              <div className="text-lg font-bold text-foreground">{stats?.totalTons.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-tighter">ton</span></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border lg:col-span-1 col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1 uppercase font-bold tracking-wider">
                <TrendingUp className="w-3 h-3 text-primary" /> Rendimento
              </div>
              <div className="text-lg font-bold text-foreground">{stats?.avgProductivity} <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-tighter">sc/ha</span></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted p-1 w-full justify-start gap-1 overflow-x-auto h-auto min-h-[44px]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-card px-4 py-2">Visão Geral</TabsTrigger>
            <TabsTrigger value="harvests" className="data-[state=active]:bg-card px-4 py-2">Colheitas</TabsTrigger>
            <TabsTrigger value="fuelings" className="data-[state=active]:bg-card px-4 py-2">Abastecimentos</TabsTrigger>
            <TabsTrigger value="transports" className="data-[state=active]:bg-card px-4 py-2">Transportes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Colheita por Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px] w-full">
                    {stats?.harvestChartData.length ? (
                      <ChartContainer config={chartConfig}>
                        <BarChart data={stats.harvestChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="sacks" fill="var(--color-sacks)" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                        Nenhuma colheita no período
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-primary" /> Trend de Combustível
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px] w-full">
                    {stats?.fuelingChartData.length ? (
                      <ChartContainer config={chartConfig}>
                        <LineChart data={stats.fuelingChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="liters" stroke="var(--color-liters)" strokeWidth={2} dot={{ r: 4, fill: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                        Sem dados de abastecimento
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="harvests" className="space-y-4 pt-2">
            {stats?.machineHarvests.length ? (
              <div className="space-y-3">
                {stats.machineHarvests.map((h: any) => (
                  <div key={h.id} className="bg-card p-4 rounded-xl border border-border transition-all hover:border-primary/30">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-bold text-foreground mb-1">{h.area}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(h.date).toLocaleDateString('pt-BR')} · {h.driverName}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-muted/40 uppercase text-[10px] font-bold tracking-tighter">
                        {h.culture}
                      </Badge>
                    </div>
                    <div className="flex gap-6 mt-3 pt-3 border-t border-border">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold leading-tight">Produção</div>
                        <div className="text-sm font-bold text-foreground">{h.quantitySacks} <span className="text-[10px] font-normal">sc</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold leading-tight">Área</div>
                        <div className="text-sm font-bold text-foreground">{h.areaHectares} <span className="text-[10px] font-normal">ha</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold leading-tight">Rendimento</div>
                        <div className="text-sm font-bold text-primary">{h.productivity} <span className="text-[10px] font-normal">sc/ha</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl bg-muted/30">
                Nenhuma colheita registrada para este período.
              </div>
            )}
          </TabsContent>

          <TabsContent value="fuelings" className="space-y-4 pt-2">
             {stats?.machineFuelings.length ? (
              <div className="space-y-3">
                {stats.machineFuelings.map((f: any) => (
                  <div key={f.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between transition-all hover:border-primary/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                        <Fuel className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-foreground">{f.liters} Litros</div>
                         <div className="text-xs text-muted-foreground flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" /> {new Date(f.date).toLocaleDateString('pt-BR')} · <span className="text-muted-foreground font-medium">{f.operatorName}</span>
                        </div>
                      </div>
                    </div>
                    {f.notes && (
                      <div className="text-[10px] bg-[hsl(var(--warning-subtle))] px-2 py-1 rounded text-[hsl(var(--warning-text))] max-w-[150px] truncate border border-[hsl(var(--warning)/0.2)]">
                        {f.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl bg-muted/30">
                Nenhum abastecimento registrado para este período.
              </div>
            )}
          </TabsContent>

          <TabsContent value="transports" className="space-y-4 pt-2">
             {stats?.machineTransports.length ? (
              <div className="space-y-3">
                {stats.machineTransports.map((t: any) => (
                  <div key={t.id} className="bg-card p-4 rounded-xl border border-border transition-all hover:border-primary/30">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--success-subtle))] flex items-center justify-center text-[hsl(var(--success-text))]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{t.cargoTons} Toneladas</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t.origin} → {t.destination}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-0.5">Placa</div>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0 h-4">{t.truckPlate}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                       <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString('pt-BR')}
                       </span>
                       <span className="font-medium text-muted-foreground">{t.driverName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl bg-muted/30">
                Nenhum transporte vinculado a esta unidade.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

