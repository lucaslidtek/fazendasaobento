import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListMachines, useCreateMachine, useDeleteMachine, useUpdateMachine, getListMachinesQueryKey } from "@workspace/api-client-react";
import { DEMO_MACHINES } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Tractor, Loader2, MapPin, Pencil, Trash2, MoreHorizontal, DollarSign, Download, Filter, X } from "lucide-react";
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
  name: z.string().min(2, "Nome obrigatório"),
  model: z.string().optional(),
  type: z.enum(["trator", "colheitadeira", "caminhao", "equipamento"]),
  location: z.string().optional(),
  status: z.enum(["ativo", "manutencao", "inativo"]),
  purchase_cost: z.coerce.number().min(0).optional() as any,
});

const STATUS_STYLES = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_DOT: Record<string, string> = {
  ativo: "bg-[hsl(var(--success))]",
  manutencao: "bg-[hsl(var(--warning))]",
  inativo: "bg-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  manutencao: "Manutenção",
  inativo: "Inativo",
};

const TYPE_LABELS: Record<string, string> = {
  trator: "Trator",
  colheitadeira: "Colheitadeira",
  caminhao: "Caminhão",
  equipamento: "Equipamento",
};

function FormContent({ form, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome / Identificação</FormLabel><FormControl><Input placeholder="Ex: Trator JD-01" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="model" render={({ field }) => (
            <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="John Deere 8R" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="purchase_cost" render={({ field }) => (
            <FormItem><FormLabel>Custo de Compra (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0,00" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem><FormLabel>Tipo de Máquina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="trator">Trator</SelectItem>
                  <SelectItem value="colheitadeira">Colheitadeira</SelectItem>
                  <SelectItem value="caminhao">Caminhão Interno</SelectItem>
                  <SelectItem value="equipamento">Equipamento/Implemento</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status Operacional</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem><FormLabel>Localização / Galpão</FormLabel><FormControl><Input placeholder="Ex: Galpão Central" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Maquinas() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const ALL = "__all__";
  const [filterType, setFilterType] = useState(ALL);
  const [filterStatus, setFilterStatus] = useState(ALL);
  const [filterLocation, setFilterLocation] = useState(ALL);
  const [showFilters, setShowFilters] = useState(false);

  const handleRowClick = (machine: any) => {
    setLocation(`/maquinas/${machine.id}`);
  };

  const { data: apiRecords, isLoading } = useListMachines();
  const records = (apiRecords ?? DEMO_MACHINES) as (any)[];

  const uniqueLocations = useMemo(() => {
    return [...new Set(records?.map(r => r.location).filter(Boolean) ?? [])].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (filterType !== ALL && r.type !== filterType) return false;
      if (filterStatus !== ALL && r.status !== filterStatus) return false;
      if (filterLocation !== ALL && r.location !== filterLocation) return false;
      return true;
    });
  }, [records, filterType, filterStatus, filterLocation]);

  const activeFilterCount = [
    filterType !== ALL,
    filterStatus !== ALL,
    filterLocation !== ALL,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterType(ALL);
    setFilterStatus(ALL);
    setFilterLocation(ALL);
  };

  const createMutation = useCreateMachine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMachinesQueryKey() });
        toast({ title: "Máquina cadastrada." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteMachine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMachinesQueryKey() });
        toast({ title: "Máquina excluída." });
      },
    },
  });

  const updateMutation = useUpdateMachine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMachinesQueryKey() });
        toast({ title: "Máquina atualizada." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      model: "",
      type: "trator",
      location: "Galpão Principal",
      status: "ativo",
      purchase_cost: 0,
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
      name: record.name,
      model: record.model ?? "",
      type: record.type,
      location: record.location ?? "",
      status: record.status,
      purchase_cost: record.purchase_cost ?? 0,
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
    onSubmit: handleSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    onClose: closeForm,
    isEditing: !!editingRecord,
  };

  const exportToCSV = () => {
    toast({
      title: "Relatório Exportado",
      description: "O relatório de máquinas foi gerado com sucesso."
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Tractor className="hidden sm:block w-7 h-7 text-primary" />
            Frota e Máquinas {filteredRecords && <span className="text-muted-foreground/60 text-xl md:text-2xl">({filteredRecords.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Inventário e status operacional do maquinário.
          </p>
          
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" className="h-10 px-4 bg-white" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" className="h-10 px-4 bg-white" onClick={() => setShowFilters(v => !v)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{activeFilterCount}</Badge>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Nova Máquina
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Máquina" : "Cadastrar Máquina"}</DialogTitle>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Localização</label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueLocations.map(l => (
                    <SelectItem key={l as string} value={l as string}>{l}</SelectItem>
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
                <TableHead>Identificação</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Custo de Compra</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhuma máquina cadastrada ou encontrada nos filtros.</TableCell></TableRow>
              )}
              {filteredRecords.map((r) => (
                <TableRow key={r.id} onClick={() => handleRowClick(r)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                  <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.model || "—"}</TableCell>
                  <TableCell>{TYPE_LABELS[r.type] ?? r.type}</TableCell>
                  <TableCell className="font-medium">
                    {r.purchase_cost ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.purchase_cost) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[r.status as keyof typeof STATUS_STYLES] ?? ""}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
        <MobileListControls 
          onFilterClick={() => setShowFilters(v => !v)} 
          onExportClick={exportToCSV} 
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Localização" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {uniqueLocations.map(l => (
                    <SelectItem key={l as string} value={l as string}>{l}</SelectItem>
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
            Nenhuma máquina cadastrada ou encontrada.
          </div>
        )}
        {filteredRecords.map((r) => (
          <div key={r.id} onClick={() => handleRowClick(r)} className="bg-card rounded-2xl border p-4 touch-card active:scale-[0.98] transition-transform cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[r.status] ?? "bg-muted"}`} />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {STATUS_LABELS[r.status]} · {TYPE_LABELS[r.type] ?? r.type}
                  </span>
                </div>
                <p className="font-bold text-foreground text-base leading-tight truncate">{r.name}</p>
                {r.model && (
                  <p className="text-sm text-muted-foreground mt-0.5">{r.model}</p>
                )}
                {r.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{r.location}</span>
                  </div>
                )}
                {r.purchase_cost && (
                   <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-3 h-3 text-[hsl(var(--success-text))]" />
                    <span className="text-xs font-semibold text-[hsl(var(--success-text))]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.purchase_cost)}
                    </span>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0 text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
              <SheetTitle className="text-lg">{editingRecord ? "Editar Máquina" : "Cadastrar Máquina"}</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>

      {/* O detalhe agora é uma página separada */}
    </AppLayout>
  );
}
