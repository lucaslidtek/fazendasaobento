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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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

export default function Caminhoes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (user?.role !== 'admin') {
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
        toast({ title: "Sucesso", description: "Caminhão cadastrado." });
        setIsOpen(false);
        form.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message })
    }
  });

  const deleteMutation = useDeleteTruck({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
        toast({ title: "Removido", description: "Caminhão excluído." });
      }
    }
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      plate: "",
      model: "",
      capacity: 35,
      status: "ativo"
    }
  });

  const statusColors = {
    ativo: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    manutencao: "bg-amber-500/10 text-amber-600 border-amber-200",
    inativo: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            Caminhões Externos
          </h1>
          <p className="text-muted-foreground mt-1">Gestão de frota de transporte rodoviário.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-transform h-11 px-6">
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Caminhão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Novo Caminhão</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d }))} className="space-y-4 mt-4">
                <FormField control={form.control} name="plate" render={({ field }) => (
                  <FormItem><FormLabel>Placa</FormLabel><FormControl><Input placeholder="ABC-1234" className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem><FormLabel>Modelo/Marca</FormLabel><FormControl><Input placeholder="Scania R450" {...field} /></FormControl><FormMessage /></FormItem>
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
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
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
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="text-right">Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum caminhão cadastrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-1 rounded text-sm border font-bold tracking-widest">{r.plate}</span>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">{r.model || '-'}</TableCell>
                  <TableCell className="text-right">{r.capacity ? `${r.capacity} t` : '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${statusColors[r.status]}`}>
                      {r.status}
                    </Badge>
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
