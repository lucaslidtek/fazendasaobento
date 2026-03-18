import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHarvest, useCreateHarvest, useDeleteHarvest, useUpdateHarvest, getListHarvestQueryKey, useListMachines } from "@workspace/api-client-react";
import { DEMO_HARVESTS, DEMO_MACHINES } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { Plus, Wheat, Loader2, Search, X, Filter, ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  culture: z.enum(["soja", "feijao", "milho"]),
  area: z.string().min(1, "Área é obrigatória"),
  driverName: z.string().min(1, "Nome do operador é obrigatório"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  quantitySacks: z.coerce.number().min(0.1, "Quantidade inválida"),
  areaHectares: z.coerce.number().min(0.1, "Área inválida"),
  notes: z.string().optional(),
});

const CULTURE_LABELS: Record<string, string> = { soja: "Soja", milho: "Milho", feijao: "Feijão" };
const CULTURE_COLORS: Record<string, string> = {
  soja: "border-primary/40 text-primary bg-primary/8",
  milho: "border-secondary/40 text-secondary bg-secondary/8",
  feijao: "border-chart-3/40 text-chart-3 bg-chart-3/8",
};

function FormContent({ form, machines, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="culture" render={({ field }) => (
            <FormItem><FormLabel>Cultura</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="soja">Soja</SelectItem>
                  <SelectItem value="milho">Milho</SelectItem>
                  <SelectItem value="feijao">Feijão</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
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
  const [showFilters, setShowFilters] = useState(false);

  const [filterCulture, setFilterCulture] = useState<string>("todas");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { data: apiRecords, isLoading } = useListHarvest();
  const { data: apiMachines } = useListMachines();
  const records = apiRecords ?? DEMO_HARVESTS;
  const machines = apiMachines ?? DEMO_MACHINES;

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
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      culture: "soja",
      area: "",
      driverName: "",
      quantitySacks: 0,
      areaHectares: 0,
      notes: "",
    },
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (filterCulture !== "todas" && r.culture !== filterCulture) return false;
      if (filterDateFrom) {
        try { if (new Date(r.date) < startOfDay(parseISO(filterDateFrom))) return false; } catch {}
      }
      if (filterDateTo) {
        try { if (new Date(r.date) > endOfDay(parseISO(filterDateTo))) return false; } catch {}
      }
      return true;
    });
  }, [records, filterCulture, filterDateFrom, filterDateTo]);

  const hasFilters = filterCulture !== "todas" || filterDateFrom !== "" || filterDateTo !== "";

  const clearFilters = () => {
    setFilterCulture("todas");
    setFilterDateFrom("");
    setFilterDateTo("");
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
      culture: record.culture,
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
    onSubmit: handleSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    onClose: closeForm,
    isEditing: !!editingRecord,
  };

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wheat className="w-7 h-7 text-primary" />
            Registro de Colheita
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os volumes colhidos por área e cultura.
          </p>
        </div>

        {/* Botão nova colheita — desktop via Dialog, mobile via Sheet */}
        <div className="hidden sm:block">
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

        <div className="sm:hidden flex items-center gap-2 w-full justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-xs text-muted-foreground">
            {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filtros — desktop sempre visível, mobile expansível */}
      <div className={`bg-card rounded-2xl border p-4 mb-4 ${showFilters ? "block" : "hidden sm:block"}`}>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cultura</label>
            <Select value={filterCulture} onValueChange={setFilterCulture}>
              <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="soja">Soja</SelectItem>
                <SelectItem value="milho">Milho</SelectItem>
                <SelectItem value="feijao">Feijão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:contents">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data inicial</label>
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data final</label>
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between sm:contents">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
                <X className="w-3.5 h-3.5" />
                Limpar
              </Button>
            )}
            <div className="hidden sm:block ml-auto text-sm text-muted-foreground">
              {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""}
              {hasFilters && records && ` de ${records.length}`}
            </div>
          </div>
        </div>
      </div>

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
                    {hasFilters ? "Nenhum registro para os filtros aplicados." : "Nenhum registro de colheita ainda."}
                  </TableCell>
                </TableRow>
              )}
              {filteredRecords.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${CULTURE_COLORS[r.culture] ?? ""}`}>
                      {CULTURE_LABELS[r.culture] ?? r.culture}
                    </Badge>
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
        {isLoading && !apiRecords && (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        )}
        {!isLoading && filteredRecords.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            {hasFilters ? "Nenhum registro para os filtros aplicados." : "Nenhum registro ainda."}
          </div>
        )}
        {filteredRecords.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`capitalize text-xs ${CULTURE_COLORS[r.culture] ?? ""}`}>
                  {CULTURE_LABELS[r.culture] ?? r.culture}
                </Badge>
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
            className="fixed bottom-[5.5rem] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
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
