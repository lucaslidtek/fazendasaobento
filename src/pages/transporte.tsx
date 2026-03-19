import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTransport, useCreateTransport, useDeleteTransport, useUpdateTransport, getListTransportQueryKey, useListTrucks } from "@workspace/api-client-react";
import { DEMO_TRANSPORTS, DEMO_TRUCKS } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Truck, Loader2, ArrowRight, Pencil, Trash2, MoreHorizontal, Download, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  truckId: z.coerce.number().min(1, "Selecione um caminhão"),
  driverName: z.string().min(1, "Motorista é obrigatório"),
  origin: z.string().min(1, "Origem é obrigatória"),
  destination: z.string().min(1, "Destino é obrigatório"),
  cargoTons: z.coerce.number().min(0.1, "Peso inválido"),
  freightValue: z.coerce.number().optional(),
});

function FormContent({ form, trucks, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="truckId" render={({ field }) => (
            <FormItem><FormLabel>Caminhão</FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                <FormControl><SelectTrigger><SelectValue placeholder="Placa/Modelo" /></SelectTrigger></FormControl>
                <SelectContent>
                  {trucks?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.plate} — {t.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="driverName" render={({ field }) => (
          <FormItem><FormLabel>Motorista</FormLabel><FormControl><Input placeholder="Nome completo" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="origin" render={({ field }) => (
            <FormItem><FormLabel>Origem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="destination" render={({ field }) => (
            <FormItem><FormLabel>Destino</FormLabel><FormControl><Input placeholder="Ex: Silo Bunge" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="cargoTons" render={({ field }) => (
            <FormItem><FormLabel>Carga (Toneladas)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="freightValue" render={({ field }) => (
            <FormItem><FormLabel>Frete (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
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

const ALL = "__all__";

export default function Transporte() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // Filtros
  const [filterTruck, setFilterTruck] = useState(ALL);
  const [filterDriver, setFilterDriver] = useState(ALL);
  const [filterOrigin, setFilterOrigin] = useState(ALL);
  const [filterDestination, setFilterDestination] = useState(ALL);
  const [showFilters, setShowFilters] = useState(false);

  const { data: apiRecords, isLoading } = useListTransport();
  const { data: apiTrucks } = useListTrucks();
  const records = apiRecords ?? DEMO_TRANSPORTS;
  const trucks = apiTrucks ?? DEMO_TRUCKS;

  // Opções únicas para os filtros
  const uniqueTrucks = useMemo(() => {
    const seen = new Set<string>();
    return records?.filter(r => {
      if (!r.truckPlate || seen.has(r.truckPlate)) return false;
      seen.add(r.truckPlate);
      return true;
    }) ?? [];
  }, [records]);

  const uniqueDrivers = useMemo(() => {
    return [...new Set(records?.map(r => r.driverName).filter(Boolean) ?? [])].sort();
  }, [records]);

  const uniqueOrigins = useMemo(() => {
    return [...new Set(records?.map(r => r.origin).filter(Boolean) ?? [])].sort();
  }, [records]);

  const uniqueDestinations = useMemo(() => {
    return [...new Set(records?.map(r => r.destination).filter(Boolean) ?? [])].sort();
  }, [records]);

  // Registros filtrados
  const filteredRecords = useMemo(() => {
    return records?.filter(r => {
      if (filterTruck !== ALL && r.truckPlate !== filterTruck) return false;
      if (filterDriver !== ALL && r.driverName !== filterDriver) return false;
      if (filterOrigin !== ALL && r.origin !== filterOrigin) return false;
      if (filterDestination !== ALL && r.destination !== filterDestination) return false;
      return true;
    }) ?? [];
  }, [records, filterTruck, filterDriver, filterOrigin, filterDestination]);

  const activeFilterCount = [
    filterTruck !== ALL,
    filterDriver !== ALL,
    filterOrigin !== ALL,
    filterDestination !== ALL,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterTruck(ALL);
    setFilterDriver(ALL);
    setFilterOrigin(ALL);
    setFilterDestination(ALL);
  };

  // Exportação CSV
  const handleExport = () => {
    const headers = ["Data", "Caminhão", "Motorista", "Origem", "Destino", "Carga (t)", "Frete (R$)"];
    const rows = filteredRecords.map(r => [
      format(new Date(r.date), "dd/MM/yyyy"),
      r.truckPlate ?? "",
      r.driverName ?? "",
      r.origin ?? "",
      r.destination ?? "",
      String(r.cargoTons ?? ""),
      r.freightValue ? String(Number(r.freightValue).toFixed(2)) : "",
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transportes_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Relatório exportado com sucesso!" });
  };

  const createMutation = useCreateTransport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransportQueryKey() });
        toast({ title: "Transporte registrado." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteTransport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransportQueryKey() });
        toast({ title: "Registro excluído." });
      },
    },
  });

  const updateMutation = useUpdateTransport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransportQueryKey() });
        toast({ title: "Transporte atualizado." });
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
      driverName: "",
      origin: "Fazenda São Bento",
      destination: "",
      cargoTons: 0,
      freightValue: 0,
    },
  });

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) deleteMutation.mutate({ id });
  };

  const handleEditOpen = (record: any, isMobile: boolean) => {
    setEditingRecord(record);
    form.reset({
      date: record.date?.split("T")[0] ?? record.date,
      truckId: record.truckId,
      driverName: record.driverName,
      origin: record.origin,
      destination: record.destination,
      cargoTons: record.cargoTons,
      freightValue: record.freightValue ?? 0,
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const handleSubmit = (d: any) => {
    if (editingRecord) updateMutation.mutate({ id: editingRecord.id, data: d });
    else createMutation.mutate({ data: d });
  };

  const formProps = {
    form,
    trucks,
    onSubmit: handleSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    onClose: closeForm,
    isEditing: !!editingRecord,
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="hidden sm:block w-7 h-7 text-[hsl(var(--info))]" />
            Transporte e Fretes {filteredRecords && <span className="text-muted-foreground/60 text-xl md:text-2xl">({filteredRecords.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Controle de escoamento da produção e cargas.
          </p>
        </div>

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
                Novo Transporte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Transporte" : "Registrar Transporte"}</DialogTitle>
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
            {/* Caminhão */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Caminhão</label>
              <Select value={filterTruck} onValueChange={setFilterTruck}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueTrucks.map(r => (
                    <SelectItem key={r.truckPlate} value={r.truckPlate!}>{r.truckPlate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operador/Motorista */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Motorista</label>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDrivers.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Origem */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Origem</label>
              <Select value={filterOrigin} onValueChange={setFilterOrigin}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueOrigins.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destino */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Destino</label>
              <Select value={filterDestination} onValueChange={setFilterDestination}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDestinations.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
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

      {/* TABELA — desktop */}
      <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
        {isLoading && !apiRecords ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Caminhão</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead className="text-right">Carga (t)</TableHead>
                <TableHead className="text-right">Frete</TableHead>
                <TableHead className="w-[88px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords?.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
              )}
              {filteredRecords?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{r.truckPlate}</span>
                  </TableCell>
                  <TableCell>{r.driverName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.origin} <span className="mx-1 text-border">→</span> {r.destination}
                  </TableCell>
                  <TableCell className="text-right font-bold">{r.cargoTons} t</TableCell>
                  <TableCell className="text-right text-[hsl(var(--success-text))] font-medium">
                    {r.freightValue ? `R$ ${(Number(r.freightValue) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </TableCell>
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

      {/* CARDS — mobile */}
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
              <Select value={filterTruck} onValueChange={setFilterTruck}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Caminhão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueTrucks.map(r => (
                    <SelectItem key={r.truckPlate} value={r.truckPlate!}>{r.truckPlate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Motorista" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDrivers.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterOrigin} onValueChange={setFilterOrigin}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Origem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueOrigins.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDestination} onValueChange={setFilterDestination}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Destino" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {uniqueDestinations.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
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
        {!isLoading && filteredRecords?.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            Nenhum transporte encontrado.
          </div>
        )}
        {filteredRecords?.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold">
                  {r.truckPlate}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
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
                  <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <SheetTitle className="text-lg">{editingRecord ? "Editar Transporte" : "Registrar Transporte"}</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
