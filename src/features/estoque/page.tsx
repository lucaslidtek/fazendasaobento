import { useState, useMemo } from "react";
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
import { Plus, Package, Loader2, Search, Filter, X, AlertTriangle, ChevronRight, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { Card, CardContent } from "@/components/ui/card";
import { useFarm } from "@/contexts/FarmContext";
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
  currentStock: z.coerce.number().min(0, "Estoque inicial inválido"),
  minStock: z.coerce.number().min(0, "Estoque mínimo inválido"),
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
          <FormField control={form.control as any} name="minStock" render={({ field }) => (
            <FormItem><FormLabel>Estoque Mínimo</FormLabel><FormControl><Input type="number" placeholder="Ex: 10" {...field} /></FormControl><FormMessage /></FormItem>
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
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const closeProduct = () => { 
    setIsProductDialogOpen(false); 
    setIsProductSheetOpen(false); 
    productForm.reset();
  };

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
    defaultValues: { name: "", category: "Sementes", unit: "KG", currentStock: 0, minStock: 10 },
  });

  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category))].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
      if (search) {
        const s = search.toLowerCase();
        return p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, filterCategory, search]);

  const activeFilterCount = (filterCategory !== "all" ? 1 : 0) + (search ? 1 : 0);



  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight flex items-center gap-3">
            <Package className="hidden md:block w-7 h-7 text-secondary" />
            Estoque de Insumos {products && <span className="text-muted-foreground/60 text-xl md:text-2xl">({products.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sementes, defensivos, fertilizantes e peças.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar produto..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl border-muted-foreground/20 focus-visible:ring-primary"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => window.print()}
            className="h-10 w-10 px-0 rounded-xl border-primary/20 hover:bg-primary/5 text-primary"
            title="Imprimir Relatório"
          >
            <Printer className="w-4 h-4" />
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 w-10 rounded-xl border-muted-foreground/20 transition-all ${showFilters ? 'bg-primary/10 border-primary text-primary' : ''}`}
          >
            <Filter className="w-4 h-4" />
          </Button>

          <Dialog open={isProductDialogOpen} onOpenChange={(open) => { if (!open) closeProduct(); else setIsProductDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 gap-2 rounded-xl ml-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Produto</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
              <DialogHeader><DialogTitle className="text-xl">Novo Produto</DialogTitle></DialogHeader>
              <div className="mt-2 text-left">
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

      {showFilters && (
        <Card className="mb-6 rounded-2xl border-muted bg-muted/30">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filtrar por Categoria</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-10 bg-card border-none shadow-sm rounded-xl"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={() => {setFilterCategory("all"); setSearch("");}} className="h-10 text-xs text-muted-foreground gap-2 rounded-xl">
                <X className="w-4 h-4" /> Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="w-full">
        {/* TABELA — desktop */}
        <div className="hidden md:block bg-card rounded-2xl border overflow-hidden shadow-sm">
          {isLoadingProducts && !apiProducts ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead className="text-right">Saldo Atual</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum produto encontrado.</TableCell></TableRow>
                )}
                {filteredProducts?.map((p) => {
                  const isCritical = p.minStock !== undefined && p.currentStock <= p.minStock;
                  return (
                    <TableRow 
                      key={p.id} 
                      className="hover:bg-muted/30 cursor-pointer group"
                      onClick={() => setLocation(`/estoque/${p.id}`)}
                    >
                      <TableCell className="text-center">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Package className="w-4 h-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold bg-muted/50 border-none">
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs font-mono">
                        {p.minStock} {p.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-foreground">
                        {p.currentStock} {p.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {isCritical ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 h-6 px-2 text-[10px] uppercase font-black">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Crítico
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] h-6 px-2 text-[10px] uppercase font-black">
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
        <div className="md:hidden space-y-3">
          <MobileListControls 
            onFilterClick={() => setShowFilters(!showFilters)} 
            onExportClick={() => {}}
            activeFilterCount={activeFilterCount}
          />

          {isLoadingProducts && !apiProducts && (
            <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          )}
          
          {!isLoadingProducts && filteredProducts?.length === 0 && (
            <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">Nenhum produto encontrado.</div>
          )}
          
          {filteredProducts?.map((p) => {
            const isCritical = p.minStock !== undefined && p.currentStock <= p.minStock;
            return (
              <div 
                key={p.id} 
                className={`bg-card rounded-2xl border p-4 touch-card cursor-pointer transition-all ${isCritical ? 'border-destructive/30 bg-destructive/[0.02]' : ''}`}
                onClick={() => setLocation(`/estoque/${p.id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{p.category}</p>
                      {isCritical && (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-transparent p-0 px-1.5 h-4 text-[8px] font-black uppercase">
                          Estoque Baixo
                        </Badge>
                      )}
                    </div>
                    <p className="font-bold text-foreground text-base leading-tight">{p.name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="text-[10px] text-muted-foreground font-medium">
                    Mínimo: <span className="font-bold">{p.minStock} {p.unit}</span>
                  </div>
                  <div className={`font-mono font-black text-lg leading-none ${isCritical ? 'text-destructive' : 'text-primary'}`}>
                    {p.currentStock} <span className="text-[10px] uppercase ml-0.5">{p.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB mobile */}
      <div className="md:hidden">
        <Sheet open={isProductSheetOpen} onOpenChange={(open) => { if (!open) closeProduct(); else setIsProductSheetOpen(true); }}>
          <button
            onClick={() => setIsProductSheetOpen(true)}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 shadow-primary/20 border border-white/10"
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
