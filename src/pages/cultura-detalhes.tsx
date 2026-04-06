import { useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { DEMO_CROPS, DEMO_HARVESTS, DEMO_STOCK_MOVEMENTS, DEMO_PRODUCTS } from "@/lib/demo-data";
import { Loader2, Sprout, ChevronRight, TrendingUp, Tractor, Box, Map, Package, Activity, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiUpdateCrop, apiDeleteCrop } from "@/lib/api-crops";
import { FormContent, schema, type CropFormData } from "./culturas";
import { useState } from "react";
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

// Simulated mock fetch to be consistent with other pages
const fetchCulturaById = async (id: number) => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      const c = DEMO_CROPS.find(crop => crop.id === id);
      if (c) resolve(c);
      else reject(new Error("Cultura não encontrada"));
    }, 400);
  });
};

export default function CulturaDetalhes() {
  const [, params] = useRoute("/culturas/:id");
  const culturaId = parseInt(params?.id || "0", 10);

  const { data: cultura, isLoading, isError } = useQuery({
    queryKey: ["/cultura", culturaId],
    queryFn: () => fetchCulturaById(culturaId),
    enabled: !!culturaId,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: apiUpdateCrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/cultura", culturaId] });
      queryClient.invalidateQueries({ queryKey: ["/crops"] });
      toast({ title: "Cultura atualizada." });
      closeForm();
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteCrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/crops"] });
      toast({ title: "Cultura excluída." });
      window.location.href = "/culturas";
    },
  });

  const form = useForm<CropFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", description: "", status: "ativo" },
  });

  const openEdit = () => {
    if (cultura) {
      form.reset({
        name: cultura.name,
        description: cultura.description ?? "",
        status: cultura.status,
      });
      if (window.innerWidth < 640) setIsSheetOpen(true);
      else setIsDialogOpen(true);
    }
  };

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    form.reset();
  };

  const onUpdate = (data: CropFormData) => {
    updateMutation.mutate({ id: culturaId, data });
  };

  const confirmDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta cultura?")) {
      deleteMutation.mutate(culturaId);
    }
  };

  const harvestStats = useMemo(() => {
    if (!cultura) return { totalSacks: 0, totalArea: 0, productivityAvg: 0, harvests: [] };
    
    // Exact or partial name match on demo harvests
    const harvests = DEMO_HARVESTS.filter(h => h.culture.toLowerCase() === cultura.name.toLowerCase());
    
    // Calculate total stats
    let sacks = 0;
    let area = 0;
    harvests.forEach(h => {
      sacks += h.quantitySacks;
      area += h.areaHectares;
    });
    
    const prod = area > 0 ? (sacks / area).toFixed(1) : 0;

    return { totalSacks: sacks, totalArea: area, productivityAvg: prod, harvests };
  }, [cultura]);

  const usedProducts = useMemo(() => {
    if (!cultura) return [];
    
    // Simulate finding products used when "reason" or "talhao" indicates this culture.
    // In our mock, there's no direct foreign key for 'culture' in stock movements,
    // so we'll match by name string in the reason field (e.g., 'Aplicação soja')
    const movements = DEMO_STOCK_MOVEMENTS.filter(m => 
      m.type === "saida" && 
      (m.reason?.toLowerCase().includes(cultura.name.toLowerCase()))
    );

    const summary: Record<number, { id: number, name: string, category: string, unit: string, totalUsed: number }> = {};
    
    movements.forEach(m => {
      const p = DEMO_PRODUCTS.find(prod => prod.id === m.productId);
      if (!p) return;
      if (!summary[p.id]) summary[p.id] = { id: p.id, name: p.name, category: p.category, unit: p.unit, totalUsed: 0 };
      summary[p.id].totalUsed += m.quantity;
    });

    return Object.values(summary).sort((a, b) => b.totalUsed - a.totalUsed);
  }, [cultura]);


  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Carregando detalhes da cultura...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !cultura) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Cultura não encontrada</h2>
          <Button onClick={() => window.location.href = "/culturas"}>Voltar para Culturas</Button>
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
    <AppLayout title={cultura.name} showBack={true} backTo="/culturas">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/culturas" className="hover:text-primary transition-colors">Culturas</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">{cultura.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[hsl(var(--success-subtle))] rounded-2xl border border-emerald-200">
            <Sprout className="w-8 h-8 text-[hsl(var(--success-text))]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-display text-foreground leading-tight">{cultura.name}</h1>
              <Badge variant="outline" className={cn("font-semibold uppercase text-[10px] tracking-wider", STATUS_STYLES[cultura.status as string])}>
                {STATUS_LABELS[cultura.status] ?? cultura.status}
              </Badge>
            </div>
            {cultura.description && (
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                {cultura.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={openEdit} className="hidden md:flex">
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={confirmDelete} className="hidden md:flex text-destructive border-destructive/20 hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openEdit}><Pencil className="w-4 h-4 mr-2"/> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={confirmDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Box, label: "Total Colhido", value: harvestStats.totalSacks.toLocaleString(), unit: "sc" },
          { icon: Map, label: "Área de Plantio", value: harvestStats.totalArea.toLocaleString(), unit: "ha" },
          { icon: TrendingUp, label: "Média Produt.", value: harvestStats.productivityAvg, unit: "sc/ha", primary: true },
          { icon: Package, label: "Insumos (Tipos)", value: usedProducts.length, unit: "un" },
        ].map((kpi, idx) => (
          <Card key={idx} className={cn("bg-card border", kpi.primary && "border-primary/20 bg-primary/[0.02]")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <kpi.icon className={cn("w-3.5 h-3.5", kpi.primary ? "text-primary" : "text-muted-foreground")} /> {kpi.label}
              </div>
              <div className="text-2xl font-bold text-foreground flex items-baseline gap-1">
                {kpi.value} <span className="text-xs font-normal text-muted-foreground uppercase tracking-tight">{kpi.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs and Content Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 w-full justify-start gap-1 h-auto min-h-[44px] overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="px-6 py-2">Dashboard</TabsTrigger>
          <TabsTrigger value="colheitas" className="px-6 py-2">Histórico de Colheitas</TabsTrigger>
          <TabsTrigger value="insumos" className="px-6 py-2">Insumos Aplicados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="w-full xl:w-2/3">
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-base font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Resumo Geral
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/40 transition-colors gap-2">
                       <p className="text-sm font-bold text-foreground">Total Produzido na Fazenda</p>
                       <p className="text-2xl font-bold text-primary">{harvestStats.totalSacks.toLocaleString()} <span className="text-sm text-muted-foreground uppercase">sc</span></p>
                    </div>
                    <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/40 transition-colors gap-2">
                       <p className="text-sm font-bold text-foreground">Total Destinado em Área</p>
                       <p className="text-2xl font-bold text-[hsl(var(--success-text))]">{harvestStats.totalArea.toLocaleString()} <span className="text-sm text-muted-foreground uppercase">ha</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colheitas" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Tractor className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Histórico de Colheitas - {cultura.name}</h2>
          </div>

          {harvestStats.harvests.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Talhão</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Máquina</TableHead>
                      <TableHead className="text-right">Área</TableHead>
                      <TableHead className="text-right">Total Colhido</TableHead>
                      <TableHead className="text-right">Produtividade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {harvestStats.harvests.map((h: any, i: number) => (
                      <TableRow key={h.id || i} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/colheita`}>
                        <TableCell className="font-bold text-foreground">{h.area}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(h.date)}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{h.machineName}</Badge></TableCell>
                        <TableCell className="text-right font-medium">{h.areaHectares.toLocaleString()} <span className="text-xs text-muted-foreground">ha</span></TableCell>
                        <TableCell className="text-right font-bold text-[hsl(var(--success-text))]">{h.quantitySacks.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">sc</span></TableCell>
                        <TableCell className="text-right font-medium">{h.productivity.toFixed(1)} <span className="text-xs text-muted-foreground">sc/ha</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {harvestStats.harvests.map((h: any, i: number) => (
                  <Card key={h.id || i} className="bg-card border hover:border-primary/30 transition-all cursor-pointer touch-card" onClick={() => window.location.href = `/colheita`}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-base font-bold text-foreground leading-tight">{h.area}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{formatDate(h.date)}</div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {h.machineName}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-border">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Colhido (sc)</p>
                          <p className="font-bold text-foreground">{h.quantitySacks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Área (ha)</p>
                          <p className="font-bold text-foreground">{h.areaHectares.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Prod. (sc/ha)</p>
                          <p className="font-bold text-[hsl(var(--success-text))]">{h.productivity.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <Tractor className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium text-lg">Nenhuma colheita registrada para esta cultura.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Insumos Aplicados nesta Cultura</h2>
          </div>
          
          {usedProducts.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border bg-card overflow-hidden">
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
                            <span className="font-bold text-foreground">{p.name}</span>
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
                  <Card key={p.id} className="bg-card border hover:border-primary/30 transition-all cursor-pointer touch-card" onClick={() => window.location.href = `/estoque/${p.id}`}>
                    <CardContent className="p-5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="text-base font-bold text-foreground leading-tight">{p.name}</div>
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
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium text-lg">Nenhum insumo aplicado especificamente para questa cultura de forma documentada no estoque.</p>
            </div>
          )}
        </TabsContent>
        
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl sm:hidden">
          <SheetHeader><SheetTitle>Editar Cultura</SheetTitle></SheetHeader>
          <div className="mt-4"><FormContent form={form} onSubmit={onUpdate} isPending={updateMutation.isPending} onClose={closeForm} isEditing={true} /></div>
        </SheetContent>
      </Sheet>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] hidden sm:block">
          <DialogHeader><DialogTitle>Editar Cultura</DialogTitle></DialogHeader>
          <FormContent form={form} onSubmit={onUpdate} isPending={updateMutation.isPending} onClose={closeForm} isEditing={true} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
