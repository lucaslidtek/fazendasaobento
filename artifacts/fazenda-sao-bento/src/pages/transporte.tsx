import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTransport, useCreateTransport, useDeleteTransport, getListTransportQueryKey, useListTrucks } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Trash2, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  truckId: z.coerce.number().min(1, "Selecione um caminhão"),
  driverName: z.string().min(1, "Motorista é obrigatório"),
  origin: z.string().min(1, "Origem é obrigatória"),
  destination: z.string().min(1, "Destino é obrigatório"),
  cargoTons: z.coerce.number().min(0.1, "Peso inválido"),
  freightValue: z.coerce.number().optional(),
});

export default function Transporte() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: records, isLoading } = useListTransport();
  const { data: trucks } = useListTrucks();
  
  const createMutation = useCreateTransport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransportQueryKey() });
        toast({ title: "Sucesso", description: "Transporte registrado." });
        setIsOpen(false);
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message })
    }
  });

  const deleteMutation = useDeleteTransport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransportQueryKey() });
        toast({ title: "Removido", description: "Registro excluído." });
      }
    }
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      driverName: "",
      origin: "Fazenda São Bento",
      destination: "",
      cargoTons: 0,
      freightValue: 0
    }
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            Transporte e Fretes
          </h1>
          <p className="text-muted-foreground mt-1">Controle de escoamento da produção e cargas.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-5">
              <Plus className="w-5 h-5 mr-2" />
              Novo Transporte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Registrar Transporte</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d }))} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="truckId" render={({ field }) => (
                    <FormItem><FormLabel>Caminhão</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Placa/Modelo" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {trucks?.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()}>{t.plate} - {t.model}</SelectItem>
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
                    <FormItem><FormLabel>Valor Frete (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
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
                <TableHead>Caminhão</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Origem → Destino</TableHead>
                <TableHead className="text-right">Carga (t)</TableHead>
                <TableHead className="text-right">Frete</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{r.truckPlate}</span>
                  </TableCell>
                  <TableCell>{r.driverName}</TableCell>
                  <TableCell className="text-muted-foreground">{r.origin} <span className="mx-1 text-border">→</span> {r.destination}</TableCell>
                  <TableCell className="text-right font-bold text-foreground">{r.cargoTons} t</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    {r.freightValue ? `R$ ${r.freightValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '-'}
                  </TableCell>
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
