import { useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiFetchSafraById } from "./safras";
import { DEMO_STOCK_MOVEMENTS, DEMO_PRODUCTS, DEMO_HARVESTS } from "@/lib/demo-data";
import { Loader2, CalendarDays, Sprout, TrendingUp, DollarSign, Tractor, ChevronRight, MapPin, Box, Map, Package, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export default function SafraDetalhes() {
  const [, params] = useRoute("/safras/:id");
  const safraId = parseInt(params?.id || "0", 10);

  const { data: safra, isLoading, isError } = useQuery({
    queryKey: ["/safra", safraId],
    queryFn: () => apiFetchSafraById(safraId),
    enabled: !!safraId,
  });

  const usedProducts = useMemo(() => {
    if (!safra) return [];
    
    // Tentar encontrar movimentações onde a safra bate parcialmente com o nome da safra atual
    const safraYearStr = safra.name.replace("Safra ", "").trim();
    
    const movements = DEMO_STOCK_MOVEMENTS.filter(m => 
      m.type === "saida" && 
      (m.safra === safra.name || m.safra === safraYearStr || (m.safra && safra.name.includes(m.safra)))
    );

    const summary: Record<number, { id: number, name: string, category: string, unit: string, totalUsed: number }> = {};
    
    // Se não encontrou nenhuma movimentação com o nome exato (pois os mocks podem divergir), 
    // incluímos alguns dados "fakes" de saída apenas p/ a visualização do design system.
    if (movements.length === 0 && DEMO_STOCK_MOVEMENTS.length > 0) {
      const fallbackMovements = DEMO_STOCK_MOVEMENTS.filter(m => m.type === "saida").slice(0, 3);
      fallbackMovements.forEach(m => {
        const p = DEMO_PRODUCTS.find(prod => prod.id === m.productId);
        if (!p) return;
        if (!summary[p.id]) summary[p.id] = { id: p.id, name: p.name, category: p.category, unit: p.unit, totalUsed: 0 };
        summary[p.id].totalUsed += m.quantity;
      });
      return Object.values(summary).sort((a, b) => b.totalUsed - a.totalUsed);
    }

    movements.forEach(m => {
      const p = DEMO_PRODUCTS.find(prod => prod.id === m.productId);
      if (!p) return;
      if (!summary[p.id]) summary[p.id] = { id: p.id, name: p.name, category: p.category, unit: p.unit, totalUsed: 0 };
      summary[p.id].totalUsed += m.quantity;
    });

    return Object.values(summary).sort((a, b) => b.totalUsed - a.totalUsed);
  }, [safra]);

  const plantedAreaAndCultures = useMemo(() => {
    if (!safra) return { totalArea: 0, culturas: [], totalSacks: 0 };
    
    // Filtra colheitas que batem com as datas da safra.
    const start = new Date(safra.startDate).getTime();
    const end = new Date(safra.endDate).getTime();
    
    let harvests = DEMO_HARVESTS;
    if (safra.startDate && safra.endDate) {
      harvests = DEMO_HARVESTS.filter(h => {
        const hDate = new Date(h.date).getTime();
        return hDate >= start && hDate <= end;
      });
    }

    // Fallback pra demo se não houver cruzamento exato
    if (harvests.length === 0) harvests = DEMO_HARVESTS.slice(0, 4);

    const summary: Record<string, { culture: string; totalArea: number; totalSacks: number }> = {};
    let totalArea = 0;

    harvests.forEach(h => {
      const cultureList = h.cultures ?? [];
      cultureList.forEach(culture => {
        const key = culture.toLowerCase();
        if (!summary[key]) summary[key] = { culture, totalArea: 0, totalSacks: 0 };
        summary[key].totalArea += h.areaHectares;
        summary[key].totalSacks += h.quantitySacks;
      });
      totalArea += h.areaHectares;
    });

    const culturas = Object.values(summary).sort((a, b) => b.totalArea - a.totalArea);
    return { totalArea, culturas, totalSacks: harvests.reduce((acc, h) => acc + h.quantitySacks, 0) };
  }, [safra]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Carregando detalhes da safra...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !safra) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Safra não encontrada</h2>
          <Button onClick={() => window.location.href = "/safras"}>Voltar para Safras</Button>
        </div>
      </AppLayout>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(d);
  };

  return (
    <AppLayout>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/safras" className="hover:text-primary transition-colors">Safras</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">{safra.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{safra.name}</h1>
              <Badge variant="outline" className={cn("font-semibold uppercase text-[10px] tracking-wider", STATUS_STYLES[safra.status as string])}>
                {STATUS_LABELS[safra.status] ?? safra.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              Período de Operação
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                {formatDate(safra.startDate)} a {formatDate(safra.endDate)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Map, label: "Área Plantada", value: plantedAreaAndCultures.totalArea.toLocaleString(), unit: "ha" },
          { icon: Tractor, label: "Maquinário", value: "1.2M", unit: "BRL" },
          { icon: Box, label: "Estimativa Colheita", value: plantedAreaAndCultures.totalSacks.toLocaleString(), unit: "sc" },
          { icon: TrendingUp, label: "Receita Est.", value: "28M", unit: "BRL", primary: true },
        ].map((kpi, idx) => (
          <Card key={idx} className={cn("bg-white border-slate-200", kpi.primary && "border-primary/20 bg-primary/[0.02]")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <kpi.icon className={cn("w-3.5 h-3.5", kpi.primary ? "text-primary" : "text-slate-400")} /> {kpi.label}
              </div>
              <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
                {kpi.value} <span className="text-xs font-normal text-slate-500 uppercase tracking-tight">{kpi.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs and Content Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1 w-full justify-start gap-1 h-auto min-h-[44px] overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="px-6 py-2">Dashboard</TabsTrigger>
          <TabsTrigger value="culturas" className="px-6 py-2">Culturas Plantadas</TabsTrigger>
          <TabsTrigger value="insumos" className="px-6 py-2">Estoque Aplicado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="w-full xl:w-2/3">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-primary" /> Divisão de Culturas
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plantedAreaAndCultures.culturas.map((c: any, i: number) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--success-subtle))] flex items-center justify-center text-[hsl(var(--success-text))] font-bold border border-emerald-200 uppercase text-xs flex-shrink-0">
                          {c.culture.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 capitalize">{c.culture}</p>
                          <p className="text-xs font-medium text-slate-500">Colhido: {c.totalSacks.toLocaleString()} sc</p>
                        </div>
                      </div>
                      <div className="sm:text-right bg-white p-3 rounded-lg border border-slate-100 shadow-sm sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none w-full sm:w-auto">
                        <p className="font-bold text-slate-800">{c.totalArea.toLocaleString()} ha</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Área Destinada</p>
                      </div>
                    </div>
                  ))}
                  
                  {plantedAreaAndCultures.culturas.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                      <Sprout className="w-8 h-8 text-slate-300 mb-2" />
                      Nenhuma cultura plantada nesta safra.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="culturas" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Sprout className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Culturas Plantadas</h2>
          </div>

          {plantedAreaAndCultures.culturas.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Cultura</TableHead>
                      <TableHead className="text-right">Área Plantada</TableHead>
                      <TableHead className="text-right">Total Colhido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plantedAreaAndCultures.culturas.map((c: any, i: number) => (
                      <TableRow key={i} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/colheita`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--success-subtle))] flex items-center justify-center text-[hsl(var(--success-text))] font-bold uppercase text-xs">
                              {c.culture.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900 capitalize">{c.culture}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{c.totalArea.toLocaleString()} <span className="text-xs text-muted-foreground uppercase">ha</span></TableCell>
                        <TableCell className="text-right font-bold text-[hsl(var(--success-text))]">{c.totalSacks.toLocaleString()} <span className="text-xs font-normal text-muted-foreground uppercase">sc</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {plantedAreaAndCultures.culturas.map((c: any, i: number) => (
                  <Card key={i} className="bg-white border-slate-200 hover:border-primary/30 transition-all cursor-pointer touch-card" onClick={() => window.location.href = `/colheita`}>
                    <CardContent className="p-5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--success-subtle))] flex items-center justify-center text-[hsl(var(--success-text))] flex-shrink-0 uppercase font-bold text-lg">
                        {c.culture.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="text-base font-bold text-slate-900 leading-tight capitalize">{c.culture}</div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium mb-2">Total Colhido na Safra</div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-end gap-1 text-[hsl(var(--success-text))]">
                            <span className="text-xl font-bold font-mono tracking-tight">{c.totalSacks.toLocaleString()}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider mb-1">sc</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800 text-sm leading-tight">{c.totalArea.toLocaleString()} ha</p>
                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Área</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Nenhuma cultura atrelada a esta safra.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Package className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Insumos Retirados do Estoque</h2>
          </div>
          
          {usedProducts.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Total Aplicado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usedProducts.map((p: any) => (
                      <TableRow key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/estoque/${p.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              <Activity className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell className="text-right font-bold text-primary">{p.totalUsed} <span className="text-xs font-normal text-muted-foreground uppercase">{p.unit}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {usedProducts.map((p: any) => (
                  <Card key={p.id} className="bg-white border-slate-200 hover:border-primary/30 transition-all cursor-pointer touch-card" onClick={() => window.location.href = `/estoque/${p.id}`}>
                    <CardContent className="p-5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="text-base font-bold text-slate-900 leading-tight">{p.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium mb-2">{p.category}</div>
                        <div className="flex items-end gap-1 text-primary">
                          <span className="text-xl font-bold font-mono tracking-tight">{p.totalUsed}</span>
                          <span className="text-xs uppercase font-bold tracking-wider mb-1">{p.unit} Aplicados</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Nenhum insumo aplicado nesta safra até o momento.</p>
            </div>
          )}
        </TabsContent>
        
      </Tabs>
    </AppLayout>
  );
}
