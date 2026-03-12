import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListFueling, useCreateFueling, useDeleteFueling, getListFuelingQueryKey, useListMachines } from "@workspace/api-client-react";
import { DEMO_FUELINGS, DEMO_MACHINES } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Trash2, Fuel, Loader2, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  operatorName: z.string().min(1, "Nome do operador é obrigatório"),
  pump: z.string().optional(),
  liters: z.coerce.number().min(1, "Quantidade inválida"),
  notes: z.string().optional(),
});

function FormContent({ form, machines, onSubmit, isPending, onClose }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="machineId" render={({ field }) => (
            <FormItem><FormLabel>Máquina</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  {machines?.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="operatorName" render={({ field }) => (
          <FormItem><FormLabel>Operador Responsável</FormLabel><FormControl><Input placeholder="Nome" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="liters" render={({ field }) => (
            <FormItem><FormLabel>Volume (Litros)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="pump" render={({ field }) => (
            <FormItem><FormLabel>Bomba/Tanque</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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

export default function Abastecimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: apiRecords, isLoading } = useListFueling();
  const { data: apiMachines } = useListMachines();
  const records = apiRecords ?? DEMO_FUELINGS;
  const machines = apiMachines ?? DEMO_MACHINES;

  const createMutation = useCreateFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Abastecimento registrado." });
        setIsOpen(false);
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Registro excluído." });
      },
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      operatorName: "",
      pump: "Bomba Principal",
      liters: 0,
      notes: "",
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) deleteMutation.mutate({ id });
  };

  const formProps = {
    form,
    machines,
    onSubmit: (d: any) => createMutation.mutate({ data: d }),
    isPending: createMutation.isPending,
    onClose: () => setIsOpen(false),
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Fuel className="w-7 h-7 text-muted-foreground" />
            Controle de Diesel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registro de abastecimento do maquinário.
          </p>
        </div>

        <div className="hidden sm:block">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Novo Abastecimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Registrar Abastecimento</DialogTitle>
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
                <TableHead>Data</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Bomba</TableHead>
                <TableHead className="text-right">Volume (L)</TableHead>
                <TableHead className="w-[52px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum abastecimento registrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-bold text-foreground">{r.machineName}</TableCell>
                  <TableCell>{r.operatorName}</TableCell>
                  <TableCell className="text-muted-foreground">{r.pump || "—"}</TableCell>
                  <TableCell className="text-right font-bold font-mono text-foreground">{r.liters} L</TableCell>
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
            Nenhum abastecimento registrado.
          </div>
        )}
        {records?.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {format(new Date(r.date), "dd/MM/yyyy")}
                  {r.pump && ` · ${r.pump}`}
                </p>
                <p className="font-bold text-foreground text-base leading-tight truncate">{r.machineName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{r.operatorName}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1.5 mt-1">
                  <Droplets className="w-4 h-4 text-[hsl(var(--info))]" />
                  <span className="font-bold text-lg text-foreground font-mono">{r.liters}</span>
                  <span className="text-xs text-muted-foreground font-semibold">L</span>
                </div>
              </div>
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
              <SheetTitle className="text-lg">Registrar Abastecimento</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
