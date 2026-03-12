import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHarvest, useCreateHarvest, useDeleteHarvest, getListHarvestQueryKey, useListMachines } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Trash2, Wheat, Loader2 } from "lucide-react";
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
  driverName: z.string().min(1, "Nome do motorista é obrigatório"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  quantitySacks: z.coerce.number().min(0.1, "Quantidade inválida"),
  areaHectares: z.coerce.number().min(0.1, "Área inválida"),
  notes: z.string().optional(),
});

export default function Colheita() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

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
            <Button className="rounded-xl shadow-lg hover:-translate-y-0.5 transition-transform h-11 px-6">
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
                  <FormItem><FormLabel>Operador</FormLabel><FormControl><Input placeholder="Nome do operador" {...field} /></FormControl><FormMessage /></FormItem>
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

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cultura</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Hectares</TableHead>
                <TableHead>Sacas</TableHead>
                <TableHead>Produtividade</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(new Date(r.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${r.culture === 'soja' ? 'border-primary text-primary' : r.culture === 'milho' ? 'border-secondary text-secondary-foreground' : 'border-chart-3 text-chart-3'}`}>
                      {r.culture}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.area}</TableCell>
                  <TableCell>{r.areaHectares} ha</TableCell>
                  <TableCell className="font-bold">{r.quantitySacks} sc</TableCell>
                  <TableCell className="text-primary font-semibold">{r.productivity.toFixed(1)} sc/ha</TableCell>
                  <TableCell className="text-muted-foreground">{r.machineName}</TableCell>
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
