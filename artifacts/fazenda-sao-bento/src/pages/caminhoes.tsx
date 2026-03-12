import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTrucks, useCreateTruck, useDeleteTruck, getListTrucksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

const schema = z.object({
  plate: z.string().min(7, "Placa inválida"),
  model: z.string().optional(),
  capacity: z.coerce.number().optional(),
  status: z.enum(["ativo", "manutencao", "inativo"]),
});

const STATUS_STYLES = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)]",
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

export default function Caminhoes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: records, isLoading } = useListTrucks();

  const createMutation = useCreateTruck({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
        toast({ title: "Caminhão cadastrado." });
        setIsOpen(false);
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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { plate: "", model: "", capacity: 35, status: "ativo" },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) deleteMutation.mutate({ id });
  };

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d }))} className="space-y-4">
        <FormField control={form.control} name="plate" render={({ field }) => (
          <FormItem><FormLabel>Placa</FormLabel><FormControl><Input placeholder="ABC-1234" className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="model" render={({ field }) => (
          <FormItem><FormLabel>Modelo / Marca</FormLabel><FormControl><Input placeholder="Scania R450" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="capacity" render={({ field }) => (
            <FormItem><FormLabel>Capacidade (ton)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={createMutation.isPending} className="flex-1">
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="w-7 h-7 text-[hsl(var(--info))]" />
            Caminhões Externos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de frota de transporte rodoviário.
          </p>
        </div>

        <div className="hidden sm:block">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Caminhão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Novo Caminhão</DialogTitle>
              </DialogHeader>
              <div className="mt-2">{FormContent}</div>
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
                <TableHead className="w-[52px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum caminhão cadastrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
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
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
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
              <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB mobile */}
      <div className="sm:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[5.5rem] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">Novo Caminhão</SheetTitle>
            </SheetHeader>
            {FormContent}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
