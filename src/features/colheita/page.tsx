import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHarvest, useCreateHarvest, useDeleteHarvest, useUpdateHarvest, getListHarvestQueryKey, useListMachines } from "@workspace/api-client-react";
import { DEMO_HARVESTS, DEMO_MACHINES, DEMO_TRUCKS, DEMO_SILOS } from "@/lib/demo-data";
import { apiFetchCrops } from "@/lib/api-crops";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Wheat, Loader2, X, Filter, MoreHorizontal, Pencil, Trash2, Download, Truck, Printer, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCultureBadgeStyle as getBadgeStyle } from "@/lib/colors";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFarm } from "@/contexts/FarmContext";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  cultures: z.array(z.string()).min(1, "Selecione pelo menos uma cultura"),
  area: z.string().min(1, "Área é obrigatória"),
  driverName: z.string().min(1, "Nome do motorista é obrigatório"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  quantitySacks: z.coerce.number().min(0.1, "Quantidade inválida"),
  areaHectares: z.coerce.number().min(0.1, "Área inválida"),
  notes: z.string().optional(),
  truck: z.string().optional(),
  destination: z.string().optional(),
  weightGross: z.coerce.number().optional().or(z.literal("")),
  weightNet: z.coerce.number().optional().or(z.literal("")),
  moisture: z.coerce.number().optional().or(z.literal("")),
  impurity: z.coerce.number().optional().or(z.literal("")),
});



function FormContent({ form, machines, crops, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-2">
        
        <div className="bg-muted/30 p-4 rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Wheat className="w-4 h-4 text-primary"/> Dados da Colheita</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cultures" render={() => (
                <FormItem>
                  <FormLabel>Culturas</FormLabel>
                  <div className="flex gap-4 flex-wrap mt-2">
                    {crops?.map((crop: any) => (
                      <FormField key={crop.id} control={form.control} name="cultures" render={({ field }) => (
                        <FormItem key={crop.id} className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(crop.name)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), crop.name])
                                  : field.onChange(field.value?.filter((v: string) => v !== crop.name))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer m-0 pb-0.5">{crop.name}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem><FormLabel>Talhão / Área</FormLabel><FormControl><Input placeholder="Ex: Talhão 5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="machineId" render={({ field }) => (
                <FormItem><FormLabel>Máquina</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione a máquina" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {machines?.filter((m: any) => m.type === "colheitadeira").map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                      {machines?.filter((m: any) => m.type !== "colheitadeira").map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name} ({m.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="areaHectares" render={({ field }) => (
                <FormItem><FormLabel>Hectares (ha)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 50.5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="quantitySacks" render={({ field }) => (
                <FormItem><FormLabel>Sacas</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="driverName" render={({ field }) => (
              <FormItem><FormLabel>Motorista</FormLabel><FormControl><Input placeholder="Nome completo do motorista" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Observações (opcional)</FormLabel><FormControl><Input placeholder="Ex: Área com solo úmido" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <div className="bg-[hsl(var(--warning-subtle))] p-4 rounded-xl border border-[hsl(var(--warning)/0.2)]">
          <h3 className="font-semibold text-[hsl(var(--warning-text))] mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-[hsl(var(--warning-text))]"/> Logística e Transporte (Opcional)</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="truck" render={({ field }) => (
                <FormItem>
                  <FormLabel>Caminhão / Placa</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? "" : v)} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o caminhão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {DEMO_TRUCKS.map(t => (
                        <SelectItem key={t.id} value={t.plate}>{t.plate} — {t.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="destination" render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino / Silo</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? "" : v)} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o destino" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {DEMO_SILOS.filter(s => s.status === "ativo").map(s => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="weightGross" render={({ field }) => (
                <FormItem><FormLabel>Peso Bruto (kg)</FormLabel><FormControl><Input type="number" placeholder="Ex: 35000" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="weightNet" render={({ field }) => (
                <FormItem><FormLabel>Peso Líquido (kg)</FormLabel><FormControl><Input type="number" placeholder="Ex: 27000" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="moisture" render={({ field }) => (
                <FormItem><FormLabel>Umidade (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 14.5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="impurity" render={({ field }) => (
                <FormItem><FormLabel>Impureza (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 1.2" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Registrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Colheita() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const ALL = "__all__";
  const [filterCulture, setFilterCulture] = useState(ALL);
  const [filterMachine, setFilterMachine] = useState(ALL);
  const [filterDriver, setFilterDriver] = useState(ALL);
  const [filterArea, setFilterArea] = useState<string>(ALL);
  const [filterTruck, setFilterTruck] = useState<string>(ALL);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("colheitas");

  const { data: apiRecords, isLoading } = useListHarvest();
  const { data: apiMachines } = useListMachines();
  const { data: crops } = useQuery({ queryKey: ["/crops"], queryFn: apiFetchCrops });
  const { selectedSafraId, selectedTalhaoId } = useFarm();
  
  const records = apiRecords ?? DEMO_HARVESTS;
  const machines = apiMachines ?? DEMO_MACHINES;

  // Opções únicas
  const uniqueMachines = useMemo(() => [...new Set(records?.map(r => r.machineName))].filter(Boolean).sort(), [records]);
  const uniqueDrivers = useMemo(() => [...new Set(records?.map(r => r.driverName))].filter(Boolean).sort(), [records]);
  const uniqueTrucks = useMemo(() => [...new Set(records?.map(r => r.truck))].filter(Boolean).sort(), [records]);
  const uniqueAreas = useMemo(() => [...new Set(records?.map(r => r.area))].filter(Boolean).sort(), [records]);

  const createMutation = useCreateHarvest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHarvestQueryKey() });
        toast({ title: "Colheita registrada com sucesso." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteHarvest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHarvestQueryKey() });
        toast({ title: "Registro excluído." });
      },
    },
  });

  const updateMutation = useUpdateHarvest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHarvestQueryKey() });
        toast({ title: "Colheita atualizada com sucesso." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      cultures: [],
      area: "",
      driverName: "",
      machineId: 0,
      quantitySacks: 0,
      areaHectares: 0,
      notes: "",
      truck: "",
      destination: "",
      weightGross: "",
      weightNet: "",
      moisture: "",
      impurity: "",
    },
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r: any) => {
      if (selectedSafraId && r.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && r.talhaoId !== selectedTalhaoId) return false;

      if (filterCulture !== ALL && (!r.cultures || !r.cultures.some((c: string) => c.toLowerCase() === filterCulture.toLowerCase()))) return false;
      if (filterMachine !== ALL && r.machineName !== filterMachine) return false;
      const matchesDriver = filterDriver === ALL || r.driverName === filterDriver;
      const matchesArea = filterArea === ALL || r.area === filterArea;
      const matchesTruck = filterTruck === ALL || r.truck === filterTruck;
      
      return matchesDriver && matchesArea && matchesTruck;
    });
  }, [records, filterCulture, filterMachine, filterDriver, filterArea, filterTruck]);

  const activeFilterCount = [
    (filterCulture !== ALL ? 1 : 0) +
    (filterMachine !== ALL ? 1 : 0) +
    (filterDriver !== ALL ? 1 : 0) +
    (filterTruck !== ALL ? 1 : 0) +
    (filterArea !== ALL ? 1 : 0)
  ].filter(Boolean).length;

  // Silo stock computed from harvest records
  const siloStock = useMemo(() => {
    const stock: Record<string, { siloName: string; cultures: Record<string, { sacks: number; weightKg: number; entries: number }> }> = {};
    (records || []).forEach((r: any) => {
      if (!r.destination) return;
      if (!stock[r.destination]) {
        stock[r.destination] = { siloName: r.destination, cultures: {} };
      }
      (r.cultures || []).forEach((culture: string) => {
        if (!stock[r.destination].cultures[culture]) {
          stock[r.destination].cultures[culture] = { sacks: 0, weightKg: 0, entries: 0 };
        }
        stock[r.destination].cultures[culture].sacks += Number(r.quantitySacks) || 0;
        stock[r.destination].cultures[culture].weightKg += Number(r.weightNet) || Number(r.weightGross) || 0;
        stock[r.destination].cultures[culture].entries += 1;
      });
    });
    return Object.values(stock).map(s => {
      const silo = DEMO_SILOS.find(ds => ds.name === s.siloName);
      const totalSacks = Object.values(s.cultures).reduce((acc, c) => acc + c.sacks, 0);
      const totalWeight = Object.values(s.cultures).reduce((acc, c) => acc + c.weightKg, 0);
      const totalEntries = Object.values(s.cultures).reduce((acc, c) => acc + c.entries, 0);
      return {
        ...s,
        location: silo?.location || "—",
        capacityTons: silo?.capacityTons || 0,
        totalSacks,
        totalWeight,
        totalEntries,
      };
    });
  }, [records]);

  const clearFilters = () => {
    setFilterCulture(ALL);
    setFilterMachine(ALL);
    setFilterDriver(ALL);
    setFilterTruck(ALL);
    setFilterArea(ALL);
  };

  const handleExport = () => {
    const rows = filteredRecords.map(r => [
      format(new Date(r.date), "dd/MM/yyyy"),
      r.cultures?.join(", "),
      r.area,
      r.driverName,
      r.truck || "",
      r.destination || "",
      r.weightGross || "",
      r.weightNet || "",
      r.moisture || "",
      r.impurity || "",
      r.quantitySacks,
      r.productivity,
      r.machineName
    ]);

    const csvContent = [
      ["Data", "Culturas", "Area", "Motorista", "Caminhao", "Destino", "Peso Bruto", "Peso Liquido", "Umidade", "Impureza", "Sacas", "Produtividade", "Maquina"].join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `colheitas_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Relatório exportado com sucesso!" });
  };

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEditOpen = (record: any, isMobile: boolean) => {
    setEditingRecord(record);
    form.reset({
      date: record.date?.split("T")[0] ?? record.date,
      cultures: record.cultures || [],
      area: record.area,
      driverName: record.driverName,
      machineId: record.machineId,
      quantitySacks: record.quantitySacks,
      areaHectares: record.areaHectares,
      notes: record.notes ?? "",
      truck: record.truck ?? "",
      destination: record.destination ?? "",
      weightGross: record.weightGross ?? "",
      weightNet: record.weightNet ?? "",
      moisture: record.moisture ?? "",
      impurity: record.impurity ?? ""
    });
    if (isMobile) {
      setIsSheetOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = (d: any) => {
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data: d });
    } else {
      createMutation.mutate({ data: d });
    }
  };

  const formProps = {
    form,
    machines,
    crops,
    onSubmit: handleSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    onClose: closeForm,
    isEditing: !!editingRecord,
  };

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wheat className="hidden sm:block w-7 h-7 text-primary" />
            Colheita & Armazenagem
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os volumes colhidos e acompanhe o estoque dos silos.
          </p>
        </div>

        {/* Botão nova colheita — desktop via Dialog, mobile via Sheet */}
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary">
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </Button>
          <Button variant="outline" onClick={handleExport} className="h-10 px-4 gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(v => !v)}
            className="h-10 px-4 gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{activeFilterCount}</Badge>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Nova Colheita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Colheita" : "Registrar Colheita"}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <FormContent {...formProps} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-11 mb-4">
          <TabsTrigger value="colheitas" className="rounded-lg px-6">Colheitas ({filteredRecords.length})</TabsTrigger>
          <TabsTrigger value="silos" className="rounded-lg px-6">Silos ({siloStock.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="colheitas" className="mt-0">

      {/* Painel de Filtros — desktop */}
      {showFilters && (
        <div className="hidden sm:block bg-card border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Filtros</span>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
                Limpar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Cultura */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Cultura</label>
              <Select value={filterCulture} onValueChange={setFilterCulture}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {crops?.map((c: any) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Máquina */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Máquina</label>
              <Select value={filterMachine} onValueChange={setFilterMachine}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueMachines.map(m => (
                    <SelectItem key={m!} value={m!}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Motorista */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Motorista</label>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDrivers.map(d => (
                    <SelectItem key={d!} value={d!}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Caminhão */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Caminhão</label>
              <Select value={filterTruck} onValueChange={setFilterTruck}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueTrucks.map(t => (
                    <SelectItem key={t!} value={t!}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Área */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Área/Talhão</label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueAreas.map(a => (
                    <SelectItem key={a!} value={a!}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Resumo da filtragem */}
      {activeFilterCount > 0 && (
        <div className="hidden sm:flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <span>Exibindo <strong className="text-foreground">{filteredRecords.length}</strong> de <strong className="text-foreground">{records?.length ?? 0}</strong> registros</span>
        </div>
      )}

      {/* TABELA — apenas desktop (sm+) */}
      <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
        {isLoading && !apiRecords ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cultura</TableHead>
                <TableHead>Área / Talhão</TableHead>
                <TableHead className="text-right">Peso Bruto</TableHead>
                <TableHead className="text-right">Peso Líquido</TableHead>
                <TableHead className="text-right">Sacas</TableHead>
                <TableHead className="text-right">Umidade</TableHead>
                <TableHead className="text-right">Impureza</TableHead>
                <TableHead className="text-right">Produtividade</TableHead>
                <TableHead>Logística</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead className="w-[88px]" aria-label="Ações" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                    {activeFilterCount > 0 ? "Nenhum registro para os filtros aplicados." : "Nenhum registro de colheita ainda."}
                  </TableCell>
                </TableRow>
              )}
              {filteredRecords.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleEditOpen(r, false)}>
                  <TableCell className="font-medium">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {r.cultures?.map((c: string) => (
                        <Badge key={c} variant="outline" className={`capitalize ${getBadgeStyle(c)}`}>
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{r.area}</TableCell>
                  <TableCell className="text-right">{r.weightGross ? `${Number(r.weightGross).toLocaleString()} kg` : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{r.weightNet ? `${Number(r.weightNet).toLocaleString()} kg` : "—"}</TableCell>
                  <TableCell className="text-right font-bold">{r.quantitySacks} sc</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">{r.moisture ? `${r.moisture}%` : "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">{r.impurity ? `${r.impurity}%` : "—"}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{(Number(r.productivity) || 0).toFixed(1)} sc/ha</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {r.truck && (
                        <Badge variant="outline" className="font-mono text-[10px] bg-muted/40 w-fit">
                          <Truck className="w-3 h-3 mr-1 inline text-[hsl(var(--warning-text))]"/> {r.truck}
                        </Badge>
                      )}
                      {r.destination && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-1 leading-none">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" /> {r.destination}
                        </span>
                      )}
                      {!r.truck && !r.destination && <span className="text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.machineName}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditOpen(r, false)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* CARDS — apenas mobile */}
      <div className="sm:hidden space-y-3">
        {/* Controles mobile */}
        <MobileListControls 
          onFilterClick={() => setShowFilters(v => !v)} 
          onExportClick={handleExport} 
          activeFilterCount={activeFilterCount} 
        />

        {/* Painel de filtros mobile */}
        {showFilters && (
          <div className="bg-card border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filtros</span>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 gap-1 text-xs text-muted-foreground">
                  <X className="w-3 h-3" /> Limpar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={filterCulture} onValueChange={setFilterCulture}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Cultura" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {crops?.map((c: any) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterMachine} onValueChange={setFilterMachine}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Máquina" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueMachines.map(m => (
                    <SelectItem key={m!} value={m!}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Motorista" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDrivers.map(d => (
                    <SelectItem key={d!} value={d!}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTruck} onValueChange={setFilterTruck}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Caminhão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueTrucks.map(t => (
                    <SelectItem key={t!} value={t!}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Área" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueAreas.map(a => (
                    <SelectItem key={a!} value={a!}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {activeFilterCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {filteredRecords.length} de {records?.length ?? 0} registros
              </p>
            )}
          </div>
        )}

        {isLoading && !apiRecords && (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        )}
        {!isLoading && filteredRecords.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            {activeFilterCount > 0 ? "Nenhum registro para os filtros aplicados." : "Nenhum registro ainda."}
          </div>
        )}
        {filteredRecords.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card cursor-pointer" onClick={() => handleEditOpen(r, true)}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1 flex-wrap">
                  {r.cultures?.map((c: string) => (
                    <Badge key={c} variant="outline" className={`capitalize text-xs ${getBadgeStyle(c)}`}>
                      {c}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {format(new Date(r.date), "dd/MM/yyyy")}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0 text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditOpen(r, true)} className="gap-2 cursor-pointer">
                    <Pencil className="w-4 h-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-base leading-tight">{r.area}</p>
                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                    {r.machineName}
                  </p>
                  {(r.truck || r.destination) && (
                    <p className="text-[10px] text-[hsl(var(--warning-text))] font-medium flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {r.truck || "S/ Placa"} {r.destination && `→ ${r.destination}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-lg leading-tight">{r.quantitySacks} sc</p>
                <p className="text-xs text-muted-foreground">{(Number(r.productivity) || 0).toFixed(1)} sc/ha</p>
              </div>
            </div>

            {(r.weightGross || r.weightNet) && (
              <div className="mt-3 grid grid-cols-2 gap-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Peso Bruto</p>
                  <p className="text-xs font-mono font-bold text-foreground">{r.weightGross ? `${Number(r.weightGross).toLocaleString()} kg` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Peso Líquido</p>
                  <p className="text-xs font-mono font-bold text-foreground">{r.weightNet ? `${Number(r.weightNet).toLocaleString()} kg` : "—"}</p>
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>{r.areaHectares} ha colhidos</span>
              {r.moisture && <span>Umid: {r.moisture}%</span>}
            </div>
          </div>
        ))}
      </div>

      {/* FAB mobile */}
      <div className="sm:hidden">
        <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsSheetOpen(true); }}>
          <button
            onClick={() => setIsSheetOpen(true)}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">{editingRecord ? "Editar Colheita" : "Registrar Colheita"}</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
        </TabsContent>

        {/* ===== TAB: SILOS ===== */}
        <TabsContent value="silos" className="mt-0">
          {siloStock.length === 0 ? (
            <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
              Nenhuma colheita foi destinada a um silo ainda.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Silo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Culturas Armazenadas</TableHead>
                      <TableHead className="text-right">Sacas</TableHead>
                      <TableHead className="text-right">Peso (kg)</TableHead>
                      <TableHead className="text-right">Entradas</TableHead>
                      <TableHead className="text-right">Capacidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siloStock.map(silo => (
                      <TableRow key={silo.siloName} className="hover:bg-muted/30">
                        <TableCell className="font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Warehouse className="w-4 h-4" />
                            </div>
                            {silo.siloName}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{silo.location}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(silo.cultures).map(([culture, data]) => (
                              <Badge key={culture} variant="outline" className={`capitalize text-[10px] ${getBadgeStyle(culture)}`}>
                                {culture} ({data.sacks} sc)
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">{silo.totalSacks.toLocaleString()} sc</TableCell>
                        <TableCell className="text-right font-medium">{silo.totalWeight.toLocaleString()} kg</TableCell>
                        <TableCell className="text-right text-muted-foreground">{silo.totalEntries}</TableCell>
                        <TableCell className="text-right">
                          {silo.capacityTons > 0 ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground">{silo.capacityTons.toLocaleString()} t</span>
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    (silo.totalWeight / (silo.capacityTons * 1000)) > 0.8
                                      ? 'bg-destructive'
                                      : (silo.totalWeight / (silo.capacityTons * 1000)) > 0.5
                                        ? 'bg-[hsl(var(--warning))]'
                                        : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(100, (silo.totalWeight / (silo.capacityTons * 1000)) * 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {siloStock.map(silo => (
                  <Card key={silo.siloName} className="rounded-2xl border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Warehouse className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{silo.siloName}</p>
                            <p className="text-[10px] text-muted-foreground">{silo.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg leading-tight">{silo.totalSacks.toLocaleString()} sc</p>
                          <p className="text-[10px] text-muted-foreground">{silo.totalEntries} entradas</p>
                        </div>
                      </div>

                      {/* Culture breakdown */}
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {Object.entries(silo.cultures).map(([culture, data]) => (
                          <Badge key={culture} variant="outline" className={`capitalize text-xs ${getBadgeStyle(culture)}`}>
                            {culture}: {data.sacks} sc
                          </Badge>
                        ))}
                      </div>

                      {/* Capacity bar */}
                      {silo.capacityTons > 0 && (
                        <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Capacidade</span>
                            <span className="text-xs font-mono font-bold text-foreground">
                              {silo.totalWeight.toLocaleString()} / {(silo.capacityTons * 1000).toLocaleString()} kg
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                (silo.totalWeight / (silo.capacityTons * 1000)) > 0.8
                                  ? 'bg-destructive'
                                  : (silo.totalWeight / (silo.capacityTons * 1000)) > 0.5
                                    ? 'bg-[hsl(var(--warning))]'
                                    : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(100, (silo.totalWeight / (silo.capacityTons * 1000)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
