import { useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiUpdateTalhao, apiDeleteTalhao, FormContent, schema } from "./page";
import { DEMO_TALHOES, DEMO_CROPS, DEMO_HARVESTS, DEMO_STOCK_MOVEMENTS, DEMO_FUELINGS, DEMO_PRODUCTS, DEMO_TALHAO_CULTURAS, DEMO_ACTIVITIES } from "@/lib/demo-data";
import { useFarm } from "@/contexts/FarmContext";
import { Loader2, Map as MapIcon, ChevronRight, Sprout, Tractor, Package, Fuel, Activity, Box, Pencil, Trash2, MoreHorizontal, History, Calendar, User as UserIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, string> = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

// Simulated mock fetch to be consistent with other pages
const fetchTalhaoById = async (id: number) => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      const t = DEMO_TALHOES.find(talhao => talhao.id === id);
      if (t) resolve(t);
      else reject(new Error("Talhão não encontrado"));
    }, 400);
  });
};

export default function TalhaoDetalhes() {
  const [, params] = useRoute("/talhoes/:id");
  const talhaoId = parseInt(params?.id || "0", 10);
  const { selectedSafraId } = useFarm();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTalhaoDialogOpen, setIsTalhaoDialogOpen] = useState(false);
  const [isTalhaoSheetOpen, setIsTalhaoSheetOpen] = useState(false);

  const talhaoForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", property: "", areaHectares: 0, cultureId: "none", status: "ativo" },
  });

  const updateMutation = useMutation({
    mutationFn: apiUpdateTalhao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/talhao"] });
      toast({ title: "Talhão atualizado com sucesso." });
      closeTalhaoForm();
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteTalhao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/talhao"] });
      toast({ title: "Talhão excluído com sucesso." });
      window.location.href = "/talhoes";
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
  });

  const openTalhaoEdit = () => {
    if (talhao) {
      const mapping = selectedSafraId ? DEMO_TALHAO_CULTURAS.find(c => c.talhaoId === talhao.id && c.safraId === selectedSafraId) : null;
      talhaoForm.reset({
        name: talhao.name,
        property: talhao.property,
        areaHectares: talhao.areaHectares,
        cultureId: mapping ? String(mapping.cultureId) as any : "none",
        status: talhao.status as "ativo"|"inativo",
      });
      if (window.innerWidth < 640) setIsTalhaoSheetOpen(true);
      else setIsTalhaoDialogOpen(true);
    }
  };

  const closeTalhaoForm = () => {
    setIsTalhaoDialogOpen(false);
    setIsTalhaoSheetOpen(false);
    talhaoForm.reset();
  };

  const onUpdateTalhao = (data: z.infer<typeof schema>) => {
    const formattedData = {
      ...data,
      cultureId: (data.cultureId === undefined || data.cultureId === "" || data.cultureId === "none") 
        ? undefined 
        : Number(data.cultureId)
    };
    updateMutation.mutate({ id: talhao!.id, data: formattedData as any });
  };

  const confirmTalhaoDelete = () => {
    if (confirm("Tem certeza que deseja excluir pste talhão?")) {
      deleteMutation.mutate(talhao!.id);
    }
  };

  const uniqueProperties = useMemo(() => {
    return Array.from(new Set(DEMO_TALHOES.map(t => t.property)));
  }, []);

  const { data: talhao, isLoading, isError } = useQuery({
    queryKey: ["/talhao", talhaoId],
    queryFn: () => fetchTalhaoById(talhaoId),
    enabled: !!talhaoId,
  });

  const culture = useMemo(() => {
    if (!talhao || !selectedSafraId) return null;
    const mapping = DEMO_TALHAO_CULTURAS.find(c => c.talhaoId === talhao.id && c.safraId === selectedSafraId);
    if (!mapping) return null;
    return DEMO_CROPS.find(c => c.id === mapping.cultureId) || null;
  }, [talhao, selectedSafraId]);

  const harvestStats = useMemo(() => {
    if (!talhao) return { totalSacks: 0, productivityAvg: 0, harvests: [] };
    
    // Find harvests occurring on this talhao
    const harvests = DEMO_HARVESTS.filter(h => h.area === talhao.name);
    
    // Calculate total stats
    let sacks = 0;
    harvests.forEach(h => {
      sacks += h.quantitySacks;
    });
    
    const prod = talhao.areaHectares > 0 ? (sacks / talhao.areaHectares).toFixed(1) : 0;

    return { totalSacks: sacks, productivityAvg: prod, harvests };
  }, [talhao]);

  const usedProducts = useMemo(() => {
    if (!talhao) return [];
    
    // Find stock movements referencing this talhao
    const movements = DEMO_STOCK_MOVEMENTS.filter(m => 
      m.type === "saida" && m.talhao === talhao.name
    );

    const summary: Record<number, { id: number, name: string, category: string, unit: string, totalUsed: number }> = {};
    
    movements.forEach(m => {
      const p = DEMO_PRODUCTS.find(prod => prod.id === m.productId);
      if (!p) return;
      if (!summary[p.id]) summary[p.id] = { id: p.id, name: p.name, category: p.category, unit: p.unit, totalUsed: 0 };
      summary[p.id].totalUsed += m.quantity;
    });

    return Object.values(summary).sort((a, b) => b.totalUsed - a.totalUsed);
  }, [talhao]);

  const fuelingStats = useMemo(() => {
    if (!talhao) return { totalLiters: 0, fuelings: [] };

    // Find fuelings referencing this talhao
    const fuelings = DEMO_FUELINGS.filter((f: any) => f.talhaoId === talhao.id);
    
    let totalLiters = 0;
    fuelings.forEach((f: any) => {
      totalLiters += f.volumeLiters;
    });

    return { totalLiters, fuelings };
  }, [talhao]);

  const timelineEvents = useMemo(() => {
    if (!talhao) return [];

    const activities = DEMO_ACTIVITIES.filter(a => a.talhaoId === talhao.id).map(a => ({
      id: `act-${a.id}`,
      date: a.date,
      type: "atividades",
      title: a.type,
      description: a.notes || `${a.areaHectares} ha operacionalizados`,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      machine: a.machineName,
      operator: a.operatorName,
      details: a.products.map(p => `${p.name} (${p.quantity}${p.unit})`).join(", ")
    }));

    const harvests = harvestStats.harvests.map((h: any) => ({
      id: `har-${h.id}`,
      date: h.date,
      type: "colheitas",
      title: "Colheita Realizada",
      description: `${h.quantitySacks} sc colhidas (${h.productivity.toFixed(1)} sc/ha)`,
      icon: Tractor,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      machine: h.machineName,
      operator: h.driverName,
      details: `Destino: ${h.destination || "Silo"}`
    }));

    const fuelings = fuelingStats.fuelings.map((f: any) => ({
      id: `fue-${f.id}`,
      date: f.date,
      type: "abastecimentos",
      title: "Abastecimento em Campo",
      description: `${f.volumeLiters} Litros consumidos`,
      icon: Fuel,
      color: "text-red-600",
      bgColor: "bg-red-50",
      machine: f.machineName,
      operator: f.operatorName,
      details: `Tipo: ${f.fuelType || "Diesel"}`
    }));

    return [...activities, ...harvests, ...fuelings].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [talhao, harvestStats, fuelingStats]);


  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Carregando detalhes do talhão...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !talhao) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Talhão não encontrado</h2>
          <Button onClick={() => window.location.href = "/talhoes"}>Voltar para Talhões</Button>
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
      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/talhoes" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <MapIcon className="w-3.5 h-3.5" /> Talhões
        </Link>
        <ChevronRight className="w-4 h-4 opacity-40" />
        <span className="font-medium text-foreground">{talhao.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
            <MapIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-display text-foreground leading-tight">{talhao.name}</h1>
              <Badge variant="outline" className={cn("rounded-lg h-6 px-2 text-[10px] uppercase font-black tracking-tight", STATUS_STYLES[talhao.status as string])}>
                {STATUS_LABELS[talhao.status] ?? talhao.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <span className="text-foreground/80">{talhao.property}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Área Total: <span className="text-foreground font-bold">{talhao.areaHectares} ha</span></span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={openTalhaoEdit} className="hidden md:flex rounded-xl h-9">
            <Pencil className="w-4 h-4 mr-2" /> Editar Área
          </Button>
          <Button variant="outline" size="sm" onClick={confirmTalhaoDelete} className="hidden md:flex text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl h-9">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden flex-shrink-0 rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={openTalhaoEdit} className="gap-2"><Pencil className="w-4 h-4"/> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={confirmTalhaoDelete} className="text-destructive gap-2"><Trash2 className="w-4 h-4"/> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Sprout, label: "Cultura Atual", value: culture ? culture.name : "Vazio", unit: "", color: "text-secondary", primary: true },
          { icon: Box, label: "Colheita Total", value: harvestStats.totalSacks.toLocaleString(), unit: "sc", color: "text-amber-600" },
          { icon: Package, label: "Insumos (Tipos)", value: usedProducts.length, unit: "un", color: "text-indigo-600" },
          { icon: Fuel, label: "Diesel Gasto", value: fuelingStats.totalLiters.toLocaleString(), unit: "L", color: "text-red-600" },
        ].map((kpi, idx) => (
          <Card key={idx} className={cn("bg-card border-border shadow-sm overflow-hidden", kpi.primary && "border-primary/20 bg-primary/[0.02]")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <kpi.icon className={cn("w-3.5 h-3.5", kpi.color)} /> {kpi.label}
              </div>
              <div className="text-2xl font-bold text-foreground flex items-baseline gap-1">
                {kpi.value} {kpi.unit && <span className="text-xs font-normal text-muted-foreground uppercase opacity-70 ml-0.5">{kpi.unit}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs and Content Section */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="bg-muted p-1 w-full justify-start gap-1 h-auto min-h-[44px] overflow-x-auto flex-nowrap rounded-xl">
          <TabsTrigger value="timeline" className="px-6 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm flex items-center gap-2">
            <History className="w-4 h-4" /> Linha do Tempo
          </TabsTrigger>
          <TabsTrigger value="colheitas" className="px-6 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Histórico de Colheitas</TabsTrigger>
          <TabsTrigger value="insumos" className="px-6 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Insumos Aplicados</TabsTrigger>
          <TabsTrigger value="abastecimentos" className="px-6 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Abastecimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-0 focus-visible:ring-0">
          <div className="relative pl-8 pt-4 pb-12 before:absolute before:left-[15px] before:top-4 before:bottom-0 before:w-px before:bg-border">
            {timelineEvents.length > 0 ? (
              timelineEvents.map((event, idx) => (
                <div key={event.id} className="relative mb-10 last:mb-0">
                  {/* Dot */}
                  <div className={cn("absolute -left-[31px] top-1.5 w-8 h-8 rounded-full border border-background shadow-sm flex items-center justify-center z-10", event.bgColor)}>
                    <event.icon className={cn("w-4 h-4", event.color)} />
                  </div>
                  
                  {/* Content */}
                  <div className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground">{event.title}</span>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground/60 h-5">
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 bg-muted/50 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        <span className="text-[11px] font-medium">{formatDate(event.date)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <Tractor className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">Máquina</span>
                          <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{event.machine}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">Responsável</span>
                          <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{event.operator}</span>
                        </div>
                      </div>
                      {event.details && (
                        <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">Detalhes</span>
                            <span className="text-xs font-semibold text-foreground line-clamp-1">{event.details}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20 -ml-8">
                <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum evento registrado na linha do tempo deste talhão.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="colheitas" className="space-y-4 focus-visible:ring-0">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Tractor className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Colheitas Registradas</h2>
          </div>

          {harvestStats.harvests.length > 0 ? (
            <>
              {/* TABELA — desktop */}
              <div className="hidden md:block bg-card rounded-2xl border overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40 font-display">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Safra/Cultura</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Máquina</TableHead>
                      <TableHead className="text-right">Colhido (sc)</TableHead>
                      <TableHead className="text-right">Área (ha)</TableHead>
                      <TableHead className="text-right">Prod.(sc/ha)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {harvestStats.harvests.map((h: any, i: number) => (
                      <TableRow key={i} className="hover:bg-muted/30 cursor-pointer group" onClick={() => window.location.href = `/colheita`}>
                        <TableCell className="font-bold text-foreground">Safra de {h.culture}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(h.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50 border-none text-[10px] uppercase font-bold text-muted-foreground px-2">
                            {h.machineName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">{h.quantitySacks.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground text-xs">{h.areaHectares.toLocaleString()} ha</TableCell>
                        <TableCell className="text-right font-mono font-black text-[hsl(var(--success-text))] text-lg">
                          {h.productivity.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARDS — mobile */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {harvestStats.harvests.map((h: any, i: number) => (
                  <Card key={i} className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer shadow-sm rounded-2xl" onClick={() => window.location.href = `/colheita`}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-base font-bold text-foreground leading-tight">Safra de {h.culture}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 font-medium">{formatDate(h.date)}</div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 rounded-lg">
                          {h.machineName}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-border/60">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Colhido</p>
                          <p className="font-bold text-foreground font-mono">{h.quantitySacks.toLocaleString()} <span className="text-[8px] uppercase">sc</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Área</p>
                          <p className="font-bold text-foreground font-mono">{h.areaHectares.toLocaleString()} <span className="text-[8px] uppercase">ha</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Prod.</p>
                          <p className="font-bold text-[hsl(var(--success-text))] font-mono text-base leading-none">{h.productivity.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <Tractor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhuma colheita registrada neste talhão.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4 focus-visible:ring-0">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Insumos Aplicados</h2>
          </div>
          
          {usedProducts.length > 0 ? (
            <>
              {/* TABELA — desktop */}
              <div className="hidden md:block bg-card rounded-2xl border overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40 font-display">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Total Aplicado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usedProducts.map((p: any) => (
                      <TableRow key={p.id} className="hover:bg-muted/30 cursor-pointer group" onClick={() => window.location.href = `/estoque/${p.id}`}>
                        <TableCell>
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                            <Activity className="w-4 h-4" />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50 border-none text-[10px] uppercase font-bold text-muted-foreground px-2">
                             {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary text-base font-mono">{p.totalUsed}</span>
                          <span className="text-xs text-muted-foreground ml-1 uppercase opacity-70">{p.unit}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARDS — mobile */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {usedProducts.map((p: any) => (
                  <Card key={p.id} className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer shadow-sm rounded-2xl" onClick={() => window.location.href = `/estoque/${p.id}`}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="text-base font-bold text-foreground leading-tight">{p.name}</div>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2 opacity-70">{p.category}</div>
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="text-xl font-bold font-mono tracking-tight leading-none">{p.totalUsed}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-md">{p.unit}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum insumo aplicado detectado nas movimentações.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="abastecimentos" className="space-y-4 focus-visible:ring-0">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Fuel className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Abastecimentos em Serviço</h2>
          </div>
          
          {fuelingStats.fuelings.length > 0 ? (
            <>
              {/* TABELA — desktop */}
              <div className="hidden md:block bg-card rounded-2xl border overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40 font-display">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Máquina / Equipamento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Operador Responsável</TableHead>
                      <TableHead className="text-right">Volume (Litros)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelingStats.fuelings.map((f: any) => (
                      <TableRow key={f.id} className="hover:bg-muted/30">
                        <TableCell className="font-bold text-foreground">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                               <Tractor className="w-4 h-4" />
                             </div>
                             {f.machineName}
                           </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(f.date)}</TableCell>
                        <TableCell className="font-medium">{f.operatorName}</TableCell>
                        <TableCell className="text-right font-bold text-foreground">{f.volumeLiters} L</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARDS — mobile */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {fuelingStats.fuelings.map((f: any) => (
                  <Card key={f.id} className="bg-card border-border shadow-sm rounded-2xl">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                            <Fuel className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-base font-bold text-foreground leading-tight">{f.machineName}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 font-medium">{formatDate(f.date)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border/60">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Volume</p>
                          <p className="font-bold text-foreground text-lg">{f.volumeLiters} L</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Operador</p>
                          <p className="font-bold text-foreground">{f.operatorName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <Fuel className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Não houve abastecimentos registrados para este talhão.</p>
            </div>
          )}
        </TabsContent>
        
      </Tabs>

      <Sheet open={isTalhaoSheetOpen} onOpenChange={setIsTalhaoSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl sm:hidden px-4 pb-8 max-h-[92vh] overflow-y-auto">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="text-xl">Editar Talhão</SheetTitle>
          </SheetHeader>
          <div className="text-left">
            <FormContent form={talhaoForm} onSubmit={onUpdateTalhao} isPending={updateMutation.isPending} onClose={closeTalhaoForm} isEditing={true} uniqueProperties={uniqueProperties} />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isTalhaoDialogOpen} onOpenChange={setIsTalhaoDialogOpen}>
        <DialogContent className="sm:max-w-[400px] hidden sm:block rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl">Editar Talhão</DialogTitle></DialogHeader>
          <div className="mt-2 text-left">
            <FormContent form={talhaoForm} onSubmit={onUpdateTalhao} isPending={updateMutation.isPending} onClose={closeTalhaoForm} isEditing={true} uniqueProperties={uniqueProperties} />
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
