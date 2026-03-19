import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHarvest, useCreateHarvest, useDeleteHarvest, useUpdateHarvest, getListHarvestQueryKey, useListMachines } from "@workspace/api-client-react";
import { DEMO_HARVESTS, DEMO_MACHINES } from "@/lib/demo-data";
import { apiFetchCrops } from "@/lib/api-crops";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Wheat, Loader2, X, Filter, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
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
import { MobileListControls } from "@/components/ui/MobileListControls";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  cultures: z.array(z.string()).min(1, "Selecione pelo menos uma cultura"),
  area: z.string().min(1, "Área é obrigatória"),
  driverName: z.string().min(1, "Nome do operador é obrigatório"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  quantitySacks: z.coerce.number().min(0.1, "Quantidade inválida"),
  areaHectares: z.coerce.number().min(0.1, "Área inválida"),
  notes: z.string().optional(),
});



function FormContent({ form, machines, crops, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="area" render={({ field }) => (
            <FormItem><FormLabel>Talhão / Área</FormLabel><FormControl><Input placeholder="Ex: Talhão 5" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="machineId" render={({ field }) => (
            <FormItem><FormLabel>Máquina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="areaHectares" render={({ field }) => (
            <FormItem><FormLabel>Hectares (ha)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="quantitySacks" render={({ field }) => (
            <FormItem><FormLabel>Sacas</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="driverName" render={({ field }) => (
          <FormItem><FormLabel>Operador</FormLabel><FormControl><Input placeholder="Nome do operador" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Observações (opcional)</FormLabel><FormControl><Input placeholder="Ex: Área com solo úmido" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

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
  const [filterArea, setFilterArea] = useState(ALL);
  const [showFilters, setShowFilters] = useState(false);

  const { data: apiRecords, isLoading } = useListHarvest();
  const { data: apiMachines } = useListMachines();
  const { data: crops } = useQuery({ queryKey: ["/crops"], queryFn: apiFetchCrops });
  const records = apiRecords ?? DEMO_HARVESTS;
  const machines = apiMachines ?? DEMO_MACHINES;

  // Opções únicas
  const uniqueMachines = useMemo(() => {
    return [...new Set(records?.map(r => r.machineName).filter(Boolean) ?? [])].sort();
  }, [records]);

  const uniqueDrivers = useMemo(() => {
    return [...new Set(records?.map(r => r.driverName).filter(Boolean) ?? [])].sort();
  }, [records]);

  const uniqueAreas = useMemo(() => {
    return [...new Set(records?.map(r => r.area).filter(Boolean) ?? [])].sort();
  }, [records]);

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
    },
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (filterCulture !== ALL && (!r.cultures || !r.cultures.includes(filterCulture))) return false;
      if (filterMachine !== ALL && r.machineName !== filterMachine) return false;
      if (filterDriver !== ALL && r.driverName !== filterDriver) return false;
      if (filterArea !== ALL && r.area !== filterArea) return false;
      return true;
    });
  }, [records, filterCulture, filterMachine, filterDriver, filterArea]);

  const activeFilterCount = [
    filterCulture !== ALL,
    filterMachine !== ALL,
    filterDriver !== ALL,
    filterArea !== ALL,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCulture(ALL);
    setFilterMachine(ALL);
    setFilterDriver(ALL);
    setFilterArea(ALL);
  };

  const handleExport = () => {
    const headers = ["Data", "Culturas", "Máquina", "Operador", "Área", "Quantidade (sc)", "Produtividade (sc/ha)", "Hectares"];
    const rows = filteredRecords.map(r => [
      format(new Date(r.date), "dd/MM/yyyy"),
      r.cultures?.join(", ") ?? "",
      r.machineName ?? "",
      r.driverName ?? "",
      r.area ?? "",
      String(r.quantitySacks ?? ""),
      String(r.productivity ?? ""),
      String(r.areaHectares ?? ""),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

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
            Registro de Colheita {filteredRecords && <span className="text-muted-foreground/60 text-xl md:text-2xl">({filteredRecords.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os volumes colhidos por área e cultura.
          </p>
        </div>

        {/* Botão nova colheita — desktop via Dialog, mobile via Sheet */}
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="h-10 px-4 gap-2">
            <Download className="w-4 h-4" />
            Exportar
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
          <div className="grid grid-cols-4 gap-3">
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

            {/* Operador/Motorista */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Operador</label>
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
                <TableHead className="text-right">Hectares</TableHead>
                <TableHead className="text-right">Sacas</TableHead>
                <TableHead className="text-right">Produtividade</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead className="w-[88px]" aria-label="Ações" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    {activeFilterCount > 0 ? "Nenhum registro para os filtros aplicados." : "Nenhum registro de colheita ainda."}
                  </TableCell>
                </TableRow>
              )}
              {filteredRecords.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
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
                  <TableCell className="text-right">{r.areaHectares} ha</TableCell>
                  <TableCell className="text-right font-bold">{r.quantitySacks} sc</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{(Number(r.productivity) || 0).toFixed(1)} sc/ha</TableCell>
                  <TableCell className="text-muted-foreground">{r.driverName}</TableCell>
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
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Operador" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDrivers.map(d => (
                    <SelectItem key={d!} value={d!}>{d}</SelectItem>
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
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
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
                <p className="text-xs text-muted-foreground mt-0.5">{r.machineName} · {r.driverName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-lg leading-tight">{r.quantitySacks} sc</p>
                <p className="text-xs text-muted-foreground">{(Number(r.productivity) || 0).toFixed(1)} sc/ha</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{r.areaHectares} ha colhidos</span>
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
    </AppLayout>
  );
}
