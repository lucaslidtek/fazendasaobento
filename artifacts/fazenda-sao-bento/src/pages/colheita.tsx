import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHarvest, useCreateHarvest, useDeleteHarvest, getListHarvestQueryKey, useListMachines } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { Plus, Trash2, Wheat, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  soja: "border-primary text-primary",
  milho: "border-secondary text-secondary",
  feijao: "border-chart-3 text-chart-3",
};

export default function Colheita() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Filtros
  const [filterCulture, setFilterCulture] = useState<string>("todas");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { data: records, isLoading } = useListHarvest();
  const { data: machines } = useListMachines();

  const createMutation = useCreateHarvest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHarvestQueryKey() });
        toast({ title: "Sucesso", description: "Registro de colheita adicionado." });
        setIsOpen(false);
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message })
    }
  });

  const deleteMutation = useDeleteHarvest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHarvestQueryKey() });
        toast({ title: "Removido", description: "Registro excluído com sucesso." });
      }
    }
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      culture: "soja",
      area: "",
      driverName: "",
      quantitySacks: 0,
      areaHectares: 0,
      notes: ""
    }
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (filterCulture !== "todas" && r.culture !== filterCulture) return false;
      if (filterDateFrom) {
        try {
          if (new Date(r.date) < startOfDay(parseISO(filterDateFrom))) return false;
        } catch {}
      }
      if (filterDateTo) {
        try {
          if (new Date(r.date) > endOfDay(parseISO(filterDateTo))) return false;
        } catch {}
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

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wheat className="w-8 h-8 text-primary" />
            Registro de Colheita
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os volumes colhidos por área e cultura.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-5">
              <Plus className="w-5 h-5 mr-2" />
              Nova Colheita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Registrar Colheita</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d }))} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="culture" render={({ field }) => (
                    <FormItem><FormLabel>Cultura</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a colheitadeira" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {machines?.filter(m => m.type === 'colheitadeira').map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                          {machines?.filter(m => m.type !== 'colheitadeira').map(m => (
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
                    <FormItem><FormLabel>Quantidade (Sacas)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="driverName" render={({ field }) => (
                  <FormItem><FormLabel>Operador</FormLabel><FormControl><Input placeholder="Nome do operador da colheitadeira" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Observações (opcional)</FormLabel><FormControl><Input placeholder="Ex: Área com solo úmido" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar Registro
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de filtros */}
      <div className="bg-card rounded-2xl border p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cultura</label>
            <Select value={filterCulture} onValueChange={setFilterCulture}>
              <SelectTrigger className="h-9 w-[140px] text-sm">
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data inicial</label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="h-9 w-[160px] text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data final</label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="h-9 w-[160px] text-sm"
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredRecords.length} registro{filteredRecords.length !== 1 ? 's' : ''}
            {hasFilters && records && ` de ${records.length}`}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cultura</TableHead>
                <TableHead>Área / Talhão</TableHead>
                <TableHead className="text-right">Hectares</TableHead>
                <TableHead className="text-right">Sacas</TableHead>
                <TableHead className="text-right">Produtividade</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    {hasFilters ? "Nenhum registro encontrado para os filtros aplicados." : "Nenhum registro de colheita ainda."}
                  </TableCell>
                </TableRow>
              )}
              {filteredRecords.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${CULTURE_COLORS[r.culture] ?? ''}`}>
                      {CULTURE_LABELS[r.culture] ?? r.culture}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.area}</TableCell>
                  <TableCell className="text-right">{r.areaHectares} ha</TableCell>
                  <TableCell className="text-right font-bold">{r.quantitySacks} sc</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{r.productivity.toFixed(1)} sc/ha</TableCell>
                  <TableCell className="text-muted-foreground">{r.driverName}</TableCell>
                  <TableCell className="text-muted-foreground">{r.machineName}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este registro?")) {
                          deleteMutation.mutate({ id: r.id });
                        }
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AppLayout>
  );
}
