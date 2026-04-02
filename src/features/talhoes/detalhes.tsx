import { useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiUpdateTalhao, apiDeleteTalhao, FormContent, schema } from "./page";
import { DEMO_TALHOES, DEMO_CROPS, DEMO_HARVESTS, DEMO_STOCK_MOVEMENTS, DEMO_FUELINGS, DEMO_PRODUCTS, DEMO_TALHAO_CULTURAS } from "@/lib/demo-data";
import { useFarm } from "@/contexts/FarmContext";
import { Loader2, Map as MapIcon, ChevronRight, Sprout, Tractor, Package, Fuel, Activity, Box, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
    const fuelings = DEMO_FUELINGS.filter(f => f.talhao === talhao.name);
    
    let totalLiters = 0;
    fuelings.forEach(f => {
      totalLiters += f.liters;
    });

    return { totalLiters, fuelings };
  }, [talhao]);


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
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Talhão não encontrado</h2>
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
    <AppLayout title={talhao.name} showBack={true} backTo="/talhoes">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/talhoes" className="hover:text-primary transition-colors">Talhões</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">{talhao.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <MapIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{talhao.name}</h1>
              <Badge variant="outline" className={cn("font-semibold uppercase text-[10px] tracking-wider", STATUS_STYLES[talhao.status as string])}>
                {STATUS_LABELS[talhao.status] ?? talhao.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              Área total: <span className="text-slate-900 font-bold">{talhao.areaHectares} ha</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={openTalhaoEdit} className="hidden md:flex">
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={confirmTalhaoDelete} className="hidden md:flex text-destructive border-destructive/20 hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openTalhaoEdit}><Pencil className="w-4 h-4 mr-2"/> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={confirmTalhaoDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Sprout, label: "Cultura Atual", value: culture ? culture.name : "Nenhuma", unit: "", primary: true },
          { icon: Box, label: "Total Colhido na Área", value: harvestStats.totalSacks.toLocaleString(), unit: "sc" },
          { icon: Package, label: "Insumos (Tipos)", value: usedProducts.length, unit: "un" },
          { icon: Fuel, label: "Combustível Gasto", value: fuelingStats.totalLiters.toLocaleString(), unit: "L" },
        ].map((kpi, idx) => (
          <Card key={idx} className={cn("bg-white border-slate-200", kpi.primary && "border-primary/20 bg-primary/[0.02]")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <kpi.icon className={cn("w-3.5 h-3.5", kpi.primary ? "text-primary" : "text-slate-400")} /> {kpi.label}
              </div>
              <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
                {kpi.value} {kpi.unit && <span className="text-xs font-normal text-slate-500 uppercase tracking-tight">{kpi.unit}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs and Content Section */}
      <Tabs defaultValue="colheitas" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1 w-full justify-start gap-1 h-auto min-h-[44px] overflow-x-auto flex-nowrap">
          <TabsTrigger value="colheitas" className="px-6 py-2">Histórico de Colheitas</TabsTrigger>
          <TabsTrigger value="insumos" className="px-6 py-2">Insumos Aplicados</TabsTrigger>
          <TabsTrigger value="abastecimentos" className="px-6 py-2">Abastecimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="colheitas" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Tractor className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Colheitas Registradas - {talhao.name}</h2>
          </div>

          {harvestStats.harvests.length > 0 ? (
            <>
              {/* TABELA — desktop */}
              <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Safra</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Máquina</TableHead>
                      <TableHead className="text-right">Colhido (sc)</TableHead>
                      <TableHead className="text-right">Área (ha)</TableHead>
                      <TableHead className="text-right">Prod.(sc/ha)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {harvestStats.harvests.map((h: any, i: number) => (
                      <TableRow key={i} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/colheita`}>
                        <TableCell className="font-bold">Safra de {h.culture}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(h.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {h.machineName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{h.quantitySacks.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">{h.areaHectares.toLocaleString()} ha</TableCell>
                        <TableCell className="text-right font-bold text-[hsl(var(--success-text))]">{h.productivity.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARDS — mobile */}
              <div className="sm:hidden grid grid-cols-1 gap-4">
                {harvestStats.harvests.map((h: any, i: number) => (
                  <Card key={i} className="bg-white border-slate-200 hover:border-primary/30 transition-all cursor-pointer" onClick={() => window.location.href = `/colheita`}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-base font-bold text-slate-900 leading-tight">Safra de {h.culture}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{formatDate(h.date)}</div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {h.machineName}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Colhido (sc)</p>
                          <p className="font-bold text-slate-800">{h.quantitySacks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Área Colhida</p>
                          <p className="font-bold text-slate-800">{h.areaHectares.toLocaleString()} ha</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prod.(sc/ha)</p>
                          <p className="font-bold text-[hsl(var(--success-text))]">{h.productivity.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Tractor className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Nenhuma colheita registrada neste talhão.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Package className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Insumos Aplicados</h2>
          </div>
          
          {usedProducts.length > 0 ? (
            <>
              {/* TABELA — desktop */}
              <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Total Aplicado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usedProducts.map((p: any) => (
                      <TableRow key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/estoque/${p.id}`}>
                        <TableCell>
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Activity className="w-4 h-4" />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">{p.totalUsed}</span>
                          <span className="text-xs text-muted-foreground ml-1 uppercase">{p.unit}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARDS — mobile */}
              <div className="sm:hidden grid grid-cols-1 gap-4">
                {usedProducts.map((p: any) => (
                  <Card key={p.id} className="bg-white border-slate-200 hover:border-primary/30 transition-all cursor-pointer" onClick={() => window.location.href = `/estoque/${p.id}`}>
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
              <p className="text-slate-500 font-medium text-lg">Nenhum insumo aplicado especificamente neste talhão.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="abastecimentos" className="space-y-4">
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Fuel className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Abastecimentos Durante Serviços</h2>
          </div>
          
          {fuelingStats.fuelings.length > 0 ? (
            <>
              {/* TABELA — desktop */}
              <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Máquina</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead className="text-right">Litros Abast.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelingStats.fuelings.map((f: any) => (
                      <TableRow key={f.id} className="hover:bg-muted/30">
                        <TableCell className="font-bold">{f.machineName}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(f.date)}</TableCell>
                        <TableCell>{f.operatorName}</TableCell>
                        <TableCell className="text-right font-bold text-slate-800">{f.liters} L</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARDS — mobile */}
              <div className="sm:hidden grid grid-cols-1 gap-4">
                {fuelingStats.fuelings.map((f: any) => (
                  <Card key={f.id} className="bg-white border-slate-200">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-base font-bold text-slate-900 leading-tight">{f.machineName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{formatDate(f.date)}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Litros Abast.</p>
                          <p className="font-bold text-slate-800 text-lg">{f.liters} L</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Operador</p>
                          <p className="font-bold text-slate-800">{f.operatorName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Fuel className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Não houve abastecimentos registrados para este talhão.</p>
            </div>
          )}
        </TabsContent>
        
      </Tabs>

      <Sheet open={isTalhaoSheetOpen} onOpenChange={setIsTalhaoSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl sm:hidden">
          <SheetHeader><SheetTitle>Editar Talhão</SheetTitle></SheetHeader>
          <div className="mt-4"><FormContent form={talhaoForm} onSubmit={onUpdateTalhao} isPending={updateMutation.isPending} onClose={closeTalhaoForm} isEditing={true} uniqueProperties={uniqueProperties} /></div>
        </SheetContent>
      </Sheet>

      <Dialog open={isTalhaoDialogOpen} onOpenChange={setIsTalhaoDialogOpen}>
        <DialogContent className="sm:max-w-[400px] hidden sm:block">
          <DialogHeader><DialogTitle>Editar Talhão</DialogTitle></DialogHeader>
          <FormContent form={talhaoForm} onSubmit={onUpdateTalhao} isPending={updateMutation.isPending} onClose={closeTalhaoForm} isEditing={true} uniqueProperties={uniqueProperties} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
