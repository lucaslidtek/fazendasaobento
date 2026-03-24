import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTrucks, useCreateTruck, useDeleteTruck, useUpdateTruck, getListTrucksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Truck, Loader2, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export const schema = z.object({
  plate: z.string().min(7, "Placa inválida"),
  model: z.string().optional(),
  capacity: z.coerce.number().optional(),
  status: z.enum(["ativo", "manutencao", "inativo"]),
});

const STATUS_STYLES = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  manutencao: "Manutenção",
  inativo: "Inativo",
};

const STATUS_DOT: Record<string, string> = {
  ativo: "bg-[hsl(var(--success))]",
  manutencao: "bg-[hsl(var(--warning))]",
  inativo: "bg-destructive",
};

export function FormContent({ form, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="plate" render={({ field }) => (
          <FormItem><FormLabel>Placa</FormLabel><FormControl><Input placeholder="ABC-1234" className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="model" render={({ field }) => (
          <FormItem><FormLabel>Modelo / Marca</FormLabel><FormControl><Input placeholder="Ex: Scania R450" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="capacity" render={({ field }) => (
            <FormItem><FormLabel>Capacidade (ton)</FormLabel><FormControl><Input type="number" placeholder="Ex: 35.5" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
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

export default function Caminhoes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const { data: apiRecords, isLoading } = useListTrucks();
  const records = apiRecords ?? [];

  const createMutation = useCreateTruck({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
        toast({ title: "Caminhão cadastrado." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteTruck({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
        toast({ title: "Caminhão excluído." });
      },
    },
  });

  const updateMutation = useUpdateTruck({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
        toast({ title: "Caminhão atualizado." });
        closeForm();
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { plate: "", model: "", capacity: 35, status: "ativo" },
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
      plate: record.plate,
      model: record.model ?? "",
      capacity: record.capacity ?? 35,
      status: record.status,
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

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="hidden sm:block w-7 h-7 text-[hsl(var(--info))]" />
            Caminhões Externos {records && <span className="text-muted-foreground/60 text-xl md:text-2xl">({records.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de frota de transporte rodoviário.
          </p>
        </div>

        <div className="hidden sm:block">
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Caminhão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Caminhão" : "Novo Caminhão"}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <FormContent {...formProps} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABELA — desktop */}
      <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="text-right">Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[88px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum caminhão cadastrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setLocation(`/caminhoes/${r.id}`)}>
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-1 rounded text-sm border font-bold tracking-widest">{r.plate}</span>
                  </TableCell>
                  <TableCell className="font-medium">{r.model || "—"}</TableCell>
                  <TableCell className="text-right">{r.capacity ? `${r.capacity} t` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[r.status] ?? ""}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
        {isLoading && (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        )}
        {!isLoading && records?.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            Nenhum caminhão cadastrado.
          </div>
        )}
        {records?.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card cursor-pointer" onClick={() => setLocation(`/caminhoes/${r.id}`)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[r.status] ?? "bg-muted"}`} />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm border font-bold tracking-widest inline-block">
                  {r.plate}
                </span>
                {r.model && <p className="text-sm text-muted-foreground mt-1">{r.model}</p>}
                {r.capacity && (
                  <p className="text-xs text-muted-foreground mt-0.5">Capacidade: {r.capacity} ton</p>
                )}
              </div>
              <div onClick={(e) => e.stopPropagation()}>
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
              <SheetTitle className="text-lg">{editingRecord ? "Editar Caminhão" : "Novo Caminhão"}</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
