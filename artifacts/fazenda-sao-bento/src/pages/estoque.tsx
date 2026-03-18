import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListProducts,
  useListStockMovements,
  useCreateProduct,
  useCreateStockMovement,
  getListProductsQueryKey,
  getListStockMovementsQueryKey,
} from "@workspace/api-client-react";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Package, ArrowDownRight, ArrowUpRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isMovementSheetOpen, setIsMovementSheetOpen] = useState(false);

  const closeProduct = () => { setIsProductDialogOpen(false); setIsProductSheetOpen(false); };
  const closeMovement = () => { setIsMovementDialogOpen(false); setIsMovementSheetOpen(false); };

  const { data: apiProducts, isLoading: isLoadingProducts } = useListProducts();
  const { data: movements, isLoading: isLoadingMovements } = useListStockMovements();
  const products = apiProducts ?? DEMO_PRODUCTS;

  const createProductMut = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Produto cadastrado." });
        closeProduct();
        productForm.reset();
      },
    },
  });

  const createMovementMut = useCreateStockMovement({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStockMovementsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Movimentação registrada." });
        closeMovement();
        movementForm.reset();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", category: "Sementes", unit: "KG", currentStock: 0, minStock: 0 },
  });

  const movementForm = useForm<z.infer<typeof movementSchema>>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: "entrada", quantity: 0, date: new Date().toISOString().split("T")[0], reason: "" },
  });

  const ProductForm = (
    <Form {...productForm}>
      <form onSubmit={productForm.handleSubmit((d) => createProductMut.mutate({ data: d }))} className="space-y-4">
        <FormField control={productForm.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={productForm.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={productForm.control} name="unit" render={({ field }) => (
            <FormItem><FormLabel>Unidade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="KG">Quilogramas (KG)</SelectItem>
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
            <FormItem><FormLabel>Estoque Inicial</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={productForm.control} name="minStock" render={({ field }) => (
            <FormItem><FormLabel>Estoque Mínimo</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={closeProduct} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={createProductMut.isPending} className="flex-1">Salvar</Button>
        </div>
      </form>
    </Form>
  );

  const MovementForm = (
    <Form {...movementForm}>
      <form onSubmit={movementForm.handleSubmit((d) => createMovementMut.mutate({ data: d }))} className="space-y-4">
        <FormField control={movementForm.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>Tipo de Movimento</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="entrada">Entrada (Compra)</SelectItem>
                <SelectItem value="saida">Saída (Aplicação/Uso)</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )} />
        <FormField control={movementForm.control} name="productId" render={({ field }) => (
          <FormItem><FormLabel>Produto</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger></FormControl>
              <SelectContent>
                {products?.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.unit})</SelectItem>)}
              </SelectContent>
            </Select>
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={movementForm.control} name="quantity" render={({ field }) => (
            <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={movementForm.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={movementForm.control} name="reason" render={({ field }) => (
          <FormItem><FormLabel>Motivo / Observação</FormLabel><FormControl><Input placeholder="Ex: NF 123 ou Talhão 2" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={closeMovement} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={createMovementMut.isPending} className="flex-1">Confirmar</Button>
        </div>
      </form>
    </Form>
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-secondary" />
            Estoque de Insumos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sementes, defensivos, fertilizantes e peças.
          </p>
        </div>

        <div className="hidden sm:flex gap-3">
          <Dialog open={isProductDialogOpen} onOpenChange={(open) => { if (!open) closeProduct(); else setIsProductDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 border-dashed">Cadastrar Produto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader><DialogTitle className="text-xl">Novo Produto</DialogTitle></DialogHeader>
              <div className="mt-2">{ProductForm}</div>
            </DialogContent>
          </Dialog>

          <Dialog open={isMovementDialogOpen} onOpenChange={(open) => { if (!open) closeMovement(); else setIsMovementDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Movimentar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader><DialogTitle className="text-xl">Movimentação de Estoque</DialogTitle></DialogHeader>
              <div className="mt-2">{MovementForm}</div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-5 bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="products" className="rounded-lg flex-1 sm:flex-none">Produtos</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg flex-1 sm:flex-none">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {/* TABELA — desktop */}
          <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
            {isLoadingProducts && !apiProducts ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
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
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
                  )}
                  {products?.map((p) => {
                    const isCritical = p.minStock !== undefined && p.currentStock <= p.minStock;
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30">
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell className={`text-right font-mono font-bold ${isCritical ? "text-destructive" : "text-foreground"}`}>
                          {p.currentStock} {p.unit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{p.minStock || 0} {p.unit}</TableCell>
                        <TableCell>
                          {isCritical ? (
                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Crítico
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)]">
                              Normal
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* CARDS — mobile */}
          <div className="sm:hidden space-y-3">
            {isLoadingProducts && !apiProducts && (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            )}
            {!isLoadingProducts && products?.length === 0 && (
              <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">Nenhum produto cadastrado.</div>
            )}
            {products?.map((p) => {
              const isCritical = p.minStock !== undefined && p.currentStock <= p.minStock;
              return (
                <div key={p.id} className="bg-card rounded-2xl border p-4 touch-card">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{p.category}</p>
                      <p className="font-bold text-foreground text-base leading-tight">{p.name}</p>
                    </div>
                    {isCritical ? (
                      <Badge variant="destructive" className="flex items-center gap-1 flex-shrink-0">
                        <AlertTriangle className="w-3 h-3" /> Crítico
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.3)] flex-shrink-0">
                        Normal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground">
                      Mín: {p.minStock || 0} {p.unit}
                    </span>
                    <span className={`font-mono font-bold text-lg leading-none ${isCritical ? "text-destructive" : "text-primary"}`}>
                      {p.currentStock} <span className="text-xs text-muted-foreground font-semibold">{p.unit}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          {/* TABELA — desktop */}
          <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
            {isLoadingMovements ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
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
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhuma movimentação.</TableCell></TableRow>
                  )}
                  {movements?.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{m.date ? format(new Date(m.date), "dd/MM/yyyy") : "—"}</TableCell>
                      <TableCell>
                        {m.type === "entrada" ? (
                          <span className="flex items-center text-[hsl(var(--success-text))] text-sm font-semibold">
                            <ArrowDownRight className="w-4 h-4 mr-1" /> Entrada
                          </span>
                        ) : (
                          <span className="flex items-center text-destructive text-sm font-semibold">
                            <ArrowUpRight className="w-4 h-4 mr-1" /> Saída
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">{m.productName}</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${m.type === "entrada" ? "text-[hsl(var(--success-text))]" : "text-destructive"}`}>
                        {m.type === "entrada" ? "+" : "-"}{m.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* CARDS — mobile */}
          <div className="sm:hidden space-y-3">
            {isLoadingMovements && (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            )}
            {!isLoadingMovements && movements?.length === 0 && (
              <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">Nenhuma movimentação.</div>
            )}
            {movements?.map((m) => (
              <div key={m.id} className="bg-card rounded-2xl border p-4 touch-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {m.type === "entrada" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--success-text))] bg-[hsl(var(--success-subtle))] px-2 py-0.5 rounded-full">
                          <ArrowDownRight className="w-3 h-3" /> Entrada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" /> Saída
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{m.date ? format(new Date(m.date), "dd/MM/yyyy") : "—"}</span>
                    </div>
                    <p className="font-bold text-foreground text-sm leading-tight truncate">{m.productName}</p>
                    {m.reason && <p className="text-xs text-muted-foreground mt-0.5">{m.reason}</p>}
                  </div>
                  <div className={`font-mono font-bold text-xl flex-shrink-0 ${m.type === "entrada" ? "text-[hsl(var(--success-text))]" : "text-destructive"}`}>
                    {m.type === "entrada" ? "+" : "-"}{m.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* FABs mobile — dois botões */}
      <div className="sm:hidden">
        <Sheet open={isMovementSheetOpen} onOpenChange={(open) => { if (!open) closeMovement(); else setIsMovementSheetOpen(true); }}>
          <button
            onClick={() => setIsMovementSheetOpen(true)}
            className="fixed bottom-[5.5rem] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            <ArrowUpRight className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">Movimentação de Estoque</SheetTitle>
            </SheetHeader>
            {MovementForm}
          </SheetContent>
        </Sheet>

        <Sheet open={isProductSheetOpen} onOpenChange={(open) => { if (!open) closeProduct(); else setIsProductSheetOpen(true); }}>
          <button
            onClick={() => setIsProductSheetOpen(true)}
            className="fixed bottom-[5.5rem] right-20 z-40 w-12 h-12 bg-card border border-border rounded-full shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">Novo Produto</SheetTitle>
            </SheetHeader>
            {ProductForm}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
