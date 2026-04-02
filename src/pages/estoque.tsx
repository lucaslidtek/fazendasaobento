import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListProducts,
  useCreateProduct,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  category: z.string().min(2, "Categoria obrigatória"),
  unit: z.enum(["L", "KG", "UN", "SC"]),
  currentStock: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0).optional(),
});

export function FormContent({ form, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control as any} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Produto</FormLabel><FormControl><Input placeholder="Ex: Óleo Diesel S10" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control as any} name="category" render={({ field }) => (
            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Combustível" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control as any} name="unit" render={({ field }) => (
            <FormItem><FormLabel>Unidade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger></FormControl>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control as any} name="currentStock" render={({ field }) => (
            <FormItem><FormLabel>Estoque Inicial/Atual</FormLabel><FormControl><Input type="number" placeholder="Ex: 100" {...field} /></FormControl><FormMessage /></FormItem>
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

export default function Estoque() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);

  const closeProduct = () => { setIsProductDialogOpen(false); setIsProductSheetOpen(false); };

  const { data: apiProducts, isLoading: isLoadingProducts } = useListProducts();
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

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { name: "", category: "Sementes", unit: "KG", currentStock: 0 },
  });



  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Package className="hidden sm:block w-7 h-7 text-secondary" />
            Estoque de Insumos {products && <span className="text-muted-foreground/60 text-xl md:text-2xl">({products.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sementes, defensivos, fertilizantes e peças.
          </p>
        </div>

        <div className="hidden sm:flex gap-3">
          <Dialog open={isProductDialogOpen} onOpenChange={(open) => { if (!open) closeProduct(); else setIsProductDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader><DialogTitle className="text-xl">Novo Produto</DialogTitle></DialogHeader>
              <div className="mt-2">
                <FormContent 
                  form={productForm} 
                  onSubmit={(d: any) => createProductMut.mutate({ data: d })} 
                  isPending={createProductMut.isPending} 
                  onClose={closeProduct} 
                  isEditing={false} 
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
                )}
                {products?.map((p) => {
                  return (
                    <TableRow 
                      key={p.id} 
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => setLocation(`/estoque/${p.id}`)}
                    >
                      <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {p.currentStock} {p.unit}
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
            return (
              <div 
                key={p.id} 
                className="bg-card rounded-2xl border p-4 touch-card cursor-pointer"
                onClick={() => setLocation(`/estoque/${p.id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">{p.category}</p>
                    <p className="font-bold text-foreground text-base leading-tight">{p.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end pt-2 border-t border-border/60">
                  <span className="font-mono font-bold text-lg leading-none text-primary">
                    {p.currentStock} <span className="text-xs text-muted-foreground font-semibold">{p.unit}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB mobile */}
      <div className="sm:hidden">
        <Sheet open={isProductSheetOpen} onOpenChange={(open) => { if (!open) closeProduct(); else setIsProductSheetOpen(true); }}>
          <button
            onClick={() => setIsProductSheetOpen(true)}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">Novo Produto</SheetTitle>
            </SheetHeader>
            <div className="mt-2 text-left">
              <FormContent 
                form={productForm} 
                onSubmit={(d: any) => createProductMut.mutate({ data: d })} 
                isPending={createProductMut.isPending} 
                onClose={closeProduct} 
                isEditing={false} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
