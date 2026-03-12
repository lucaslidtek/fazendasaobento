import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListMachines, useCreateMachine, useDeleteMachine, getListMachinesQueryKey } from "@workspace/api-client-react";
import { DEMO_MACHINES } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Tractor, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  model: z.string().optional(),
  type: z.enum(["trator", "colheitadeira", "caminhao", "equipamento"]),
  location: z.string().optional(),
  status: z.enum(["ativo", "manutencao", "inativo"]),
});

const STATUS_STYLES = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.3)]",
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

function FormContent({ form, onSubmit, isPending, onClose }: any) {
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
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem><FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem><FormLabel>Localização</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status Operacional</FormLabel>
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
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Maquinas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: apiRecords, isLoading } = useListMachines();
  const records = apiRecords ?? DEMO_MACHINES;

  const createMutation = useCreateMachine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMachinesQueryKey() });
        toast({ title: "Máquina cadastrada." });
        setIsOpen(false);
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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      model: "",
      type: "trator",
      location: "Galpão Principal",
      status: "ativo",
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) deleteMutation.mutate({ id });
  };

  const formProps = {
    form,
    onSubmit: (d: any) => createMutation.mutate({ data: d }),
    isPending: createMutation.isPending,
    onClose: () => setIsOpen(false),
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Tractor className="w-7 h-7 text-primary" />
            Frota e Máquinas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Inventário e status operacional do maquinário.
          </p>
        </div>

        <div className="hidden sm:block">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Nova Máquina
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Cadastrar Máquina</DialogTitle>
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
        {isLoading && !apiRecords ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Identificação</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[52px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhuma máquina cadastrada.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-bold text-foreground">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.model || "—"}</TableCell>
                  <TableCell>{TYPE_LABELS[r.type] ?? r.type}</TableCell>
                  <TableCell className="text-muted-foreground">{r.location}</TableCell>
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
        {isLoading && !apiRecords && (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        )}
        {!isLoading && records?.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            Nenhuma máquina cadastrada.
          </div>
        )}
        {records?.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
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
              <SheetTitle className="text-lg">Cadastrar Máquina</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
