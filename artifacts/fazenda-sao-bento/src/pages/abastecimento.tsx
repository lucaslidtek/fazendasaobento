import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListFueling, useCreateFueling, useDeleteFueling, getListFuelingQueryKey, useListMachines } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Trash2, Fuel, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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

export default function Abastecimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: records, isLoading } = useListFueling();
  const { data: machines } = useListMachines();
  
  const createMutation = useCreateFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Sucesso", description: "Abastecimento registrado." });
        setIsOpen(false);
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message })
    }
  });

  const deleteMutation = useDeleteFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Removido", description: "Registro excluído." });
      }
    }
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      operatorName: "",
      pump: "Bomba Principal",
      liters: 0,
      notes: ""
    }
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Fuel className="w-8 h-8 text-slate-600" />
            Controle de Diesel
          </h1>
          <p className="text-muted-foreground mt-1">Registro de abastecimento do maquinário.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-5">
              <Plus className="w-5 h-5 mr-2" />
              Novo Abastecimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Registrar Abastecimento</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d }))} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="machineId" render={({ field }) => (
                    <FormItem><FormLabel>Máquina</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {machines?.map(m => (
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

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar Registro
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Bomba</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum abastecimento registrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-bold text-foreground">{r.machineName}</TableCell>
                  <TableCell>{r.operatorName}</TableCell>
                  <TableCell className="text-muted-foreground">{r.pump || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-slate-700">{r.liters} L</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir?")) {
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
