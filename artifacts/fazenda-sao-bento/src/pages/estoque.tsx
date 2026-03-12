import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useListProducts, 
  useListStockMovements, 
  useCreateProduct, 
  useCreateStockMovement,
  getListProductsQueryKey,
  getListStockMovementsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Package, ArrowDownRight, ArrowUpRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  category: z.string().min(2, "Categoria obrigatória"),
  unit: z.enum(["L", "KG", "UN", "SC"]),
  currentStock: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0).optional(),
});

const movementSchema = z.object({
  productId: z.coerce.number().min(1, "Selecione um produto"),
  type: z.enum(["entrada", "saida"]),
  quantity: z.coerce.number().min(0.1, "Quantidade inválida"),
  date: z.string(),
  reason: z.string().optional(),
});

export default function Estoque() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);

  const { data: products, isLoading: isLoadingProducts } = useListProducts();
  const { data: movements, isLoading: isLoadingMovements } = useListStockMovements();
  
  const createProductMut = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Produto cadastrado" });
        setIsProductOpen(false);
        productForm.reset();
      }
    }
  });

  const createMovementMut = useCreateStockMovement({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStockMovementsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Movimentação registrada" });
        setIsMovementOpen(false);
        movementForm.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message })
    }
  });

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", category: "Sementes", unit: "KG", currentStock: 0, minStock: 0 }
  });

  const movementForm = useForm<z.infer<typeof movementSchema>>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: "entrada", quantity: 0, date: new Date().toISOString().split('T')[0], reason: "" }
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-secondary" />
            Estoque de Insumos
          </h1>
          <p className="text-muted-foreground mt-1">Sementes, defensivos, fertilizantes e peças.</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isProductOpen} onOpenChange={setIsProductOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-11 border-dashed">Cadastrar Produto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit((d) => createProductMut.mutate({ data: d }))} className="space-y-4">
                  <FormField control={productForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={productForm.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={productForm.control} name="unit" render={({ field }) => (
                      <FormItem><FormLabel>Unidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="L">Litros (L)</SelectItem>
                            <SelectItem value="UN">Unidade (UN)</SelectItem>
                            <SelectItem value="SC">Sacas (SC)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={productForm.control} name="currentStock" render={({ field }) => (
                      <FormItem><FormLabel>Estoque Inicial</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={productForm.control} name="minStock" render={({ field }) => (
                      <FormItem><FormLabel>Estoque Mínimo</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  <DialogFooter><Button type="submit" disabled={createProductMut.isPending}>Salvar</Button></DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-11 px-6">
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Movimentar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader><DialogTitle>Movimentação de Estoque</DialogTitle></DialogHeader>
              <Form {...movementForm}>
                <form onSubmit={movementForm.handleSubmit((d) => createMovementMut.mutate({ data: d }))} className="space-y-4">
                  <FormField control={movementForm.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Tipo de Movimento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="entrada" className="text-emerald-600 font-medium">Entrada (Compra)</SelectItem>
                          <SelectItem value="saida" className="text-destructive font-medium">Saída (Aplicação/Uso)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={movementForm.control} name="productId" render={({ field }) => (
                    <FormItem><FormLabel>Produto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.unit})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={movementForm.control} name="quantity" render={({ field }) => (
                      <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={movementForm.control} name="date" render={({ field }) => (
                      <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  <FormField control={movementForm.control} name="reason" render={({ field }) => (
                    <FormItem><FormLabel>Motivo/Observação</FormLabel><FormControl><Input placeholder="Ex: NF 123 ou Talhão 2" {...field} /></FormControl></FormItem>
                  )} />
                  <DialogFooter><Button type="submit" disabled={createMovementMut.isPending}>Confirmar</Button></DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="products" className="rounded-lg">Produtos Cadastrados</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">Histórico de Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="bg-card rounded-2xl border overflow-hidden">
            {isLoadingProducts ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Estoque Atual</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
                  )}
                  {products?.map((p) => {
                    const isCritical = p.minStock !== undefined && p.currentStock <= p.minStock;
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30">
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell className={`text-right font-mono font-bold ${isCritical ? 'text-destructive' : 'text-foreground'}`}>
                          {p.currentStock} {p.unit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{p.minStock || 0} {p.unit}</TableCell>
                        <TableCell>
                          {isCritical ? (
                            <Badge variant="destructive" className="flex w-fit items-center gap-1"><AlertTriangle className="w-3 h-3"/> Crítico</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-card rounded-2xl border overflow-hidden">
            {isLoadingMovements ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma movimentação.</TableCell></TableRow>
                  )}
                  {movements?.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{format(new Date(m.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {m.type === 'entrada' ? (
                          <span className="flex items-center text-emerald-600 text-sm font-semibold"><ArrowDownRight className="w-4 h-4 mr-1"/> Entrada</span>
                        ) : (
                          <span className="flex items-center text-destructive text-sm font-semibold"><ArrowUpRight className="w-4 h-4 mr-1"/> Saída</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">{m.productName}</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${m.type === 'entrada' ? 'text-emerald-600' : 'text-destructive'}`}>
                        {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.reason || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
