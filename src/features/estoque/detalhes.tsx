import { useMemo, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DEMO_PRODUCTS, DEMO_STOCK_MOVEMENTS } from "@/lib/demo-data";
import { 
  Package, 
  ArrowUpRight, 
  ChevronRight, 
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  Boxes,
  Pencil,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormContent, productSchema } from "./page";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFarm } from "@/contexts/FarmContext";
import { DEMO_TALHOES } from "@/lib/demo-data";

const movementSchema = z.object({
  type: z.enum(["entrada", "saida"]),
  quantity: z.coerce.number().min(0.1, "Quantidade inválida"),
  date: z.string(),
  reason: z.string().optional(),
  safra: z.string().min(2, "Safra obrigatória"),
  talhao: z.string().optional(),
});

export default function EstoqueDetalhes() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { safras, selectedSafraId } = useFarm();
  const currentSafra = useMemo(() => safras.find(s => s.id === selectedSafraId), [safras, selectedSafraId]);
  
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isMovementSheetOpen, setIsMovementSheetOpen] = useState(false);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const product = useMemo(() => {
    return DEMO_PRODUCTS.find(p => p.id === Number(id));
  }, [id]);

  const flatMovements = useMemo(() => {
    if (!product) return [];
    return DEMO_STOCK_MOVEMENTS.filter(m => m.productId === product.id);
  }, [product]);

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    
    flatMovements.forEach((m: any) => {
      if (m.type === "entrada") totalIn += m.quantity;
      if (m.type === "saida") totalOut += m.quantity;
    });

    return { totalIn, totalOut };
  }, [flatMovements]);

  const groupedMovements = useMemo(() => {
    if (!product) return [];
    
    // Process movements chronologically to calculate running balance
    const productMovements = [...flatMovements].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalDelta = 0;
    productMovements.forEach((m: any) => {
      totalDelta += m.type === "entrada" ? m.quantity : -m.quantity;
    });
    
    // Balance before these historical movements
    let runningBalance = product.currentStock - totalDelta;
    
    const movementsWithBalance = productMovements.map(m => {
      runningBalance += m.type === "entrada" ? m.quantity : -m.quantity;
      return { ...m, balanceAfter: runningBalance };
    });

    // Group by Date formatted string
    type MovementWithBalance = typeof movementsWithBalance[0];
    const groupsMap: Record<string, MovementWithBalance[]> = {};
    
    movementsWithBalance.forEach(m => {
      const dateKey = m.date.split('T')[0];
      if (!groupsMap[dateKey]) groupsMap[dateKey] = [];
      groupsMap[dateKey].push(m);
    });

    // Convert to array and sort groups descending (newest day first)
    const sortedGroups = Object.entries(groupsMap)
      .map(([date, movs]) => {
        const sortedMovs = [...movs].sort((a, b) => b.id - a.id);
        return {
          date,
          movements: sortedMovs,
          endOfDayBalance: movs[movs.length - 1].balanceAfter
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sortedGroups;
  }, [product, flatMovements]);

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Produto atualizado com sucesso." });
        closeProductForm();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Produto excluído." });
        setLocation("/estoque");
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { name: "", category: "Sementes", unit: "KG", currentStock: 0, minStock: 0 },
  });

  const openProductEdit = () => {
    if (product) {
      productForm.reset({
        name: product.name,
        category: product.category,
        unit: product.unit as any,
        currentStock: product.currentStock,
        minStock: product.minStock || 0,
      });
      if (window.innerWidth < 640) setIsProductSheetOpen(true);
      else setIsProductDialogOpen(true);
    }
  };

  const closeProductForm = () => {
    setIsProductDialogOpen(false);
    setIsProductSheetOpen(false);
    productForm.reset();
  };

  const onUpdateProduct = (data: z.infer<typeof productSchema>) => {
    updateMutation.mutate({ id: product!.id, data });
  };

  const confirmProductDelete = () => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate({ id: product!.id });
    }
  };

  const movementForm = useForm<z.infer<typeof movementSchema>>({
    resolver: zodResolver(movementSchema) as any,
    defaultValues: { 
      type: "saida", 
      quantity: 0, 
      date: new Date().toISOString().split("T")[0], 
      reason: "", 
      safra: currentSafra?.name || "2025/2026", 
      talhao: "" 
    },
  });

  const onSubmit = () => {
    toast({ title: "Movimentação registrada com sucesso (Mock)" });
    setIsMovementDialogOpen(false);
    setIsMovementSheetOpen(false);
    movementForm.reset();
  };

  if (!product) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h2>
          <Button onClick={() => setLocation("/estoque")}>Voltar para Estoque</Button>
        </div>
      </AppLayout>
    );
  }

  const isCritical = product.minStock !== undefined && product.currentStock <= product.minStock;

  const MovementFormContent = (
    <Form {...movementForm}>
      <form onSubmit={movementForm.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField control={movementForm.control} name="type" render={({ field }) => (
          <FormItem><FormLabel className="text-[10px] font-bold uppercase">Tipo de Movimento</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="entrada">Entrada (Compra/Ajuste)</SelectItem>
                <SelectItem value="saida">Saída (Aplicação/Retirada)</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={movementForm.control as any} name="quantity" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Quantidade ({product.unit})</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={movementForm.control as any} name="date" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Data</FormLabel><FormControl><Input type="date" className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={movementForm.control as any} name="safra" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Safra</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />
          <FormField control={movementForm.control as any} name="talhao" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Talhão (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {DEMO_TALHOES.map(t => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>
        <FormField control={movementForm.control as any} name="reason" render={({ field }) => (
          <FormItem><FormLabel className="text-[10px] font-bold uppercase">Motivo / Observação</FormLabel><FormControl><Input placeholder="Ex: NF 123 ou Aplicação" className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => { setIsMovementDialogOpen(false); setIsMovementSheetOpen(false); }} className="flex-1 rounded-xl">Cancelar</Button>
          <Button type="submit" className="flex-1 rounded-xl">Confirmar</Button>
        </div>
      </form>
    </Form>
  );

  return (
    <AppLayout title={product.name} showBack={true} backTo="/estoque">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/estoque" className="hover:text-primary transition-colors hover:underline">Estoque</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-display text-foreground leading-tight">{product.name}</h1>
              {isCritical ? (
                <Badge variant="destructive" className="flex items-center gap-1 rounded-lg">
                  <AlertTriangle className="w-3 h-3" /> Crítico
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] rounded-lg">
                  Normal
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              {product.category}
              <span className="text-muted-foreground/50">|</span>
              Mínimo: {product.minStock || 0} {product.unit}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={openProductEdit} className="hidden md:flex">
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={confirmProductDelete} className="hidden md:flex text-destructive border-destructive/20 hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>

          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 px-4 hidden md:flex">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader><DialogTitle className="text-xl">Movimentar Estoque</DialogTitle></DialogHeader>
              <div className="mt-2">{MovementFormContent}</div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsMovementSheetOpen(true)}><ArrowUpRight className="w-4 h-4 mr-2"/> Nova Movimentação</DropdownMenuItem>
              <DropdownMenuItem onClick={openProductEdit}><Pencil className="w-4 h-4 mr-2"/> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={confirmProductDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <Boxes className="w-3.5 h-3.5 text-primary" /> Saldo Atual
              </div>
              <div className="text-2xl font-bold text-foreground">
                {product.currentStock} <span className="text-xs font-normal text-muted-foreground uppercase ml-1 tracking-tight">{product.unit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--success-text))]" /> Entradas (Período)
              </div>
              <div className="text-2xl font-bold text-[hsl(var(--success-text))]">
                +{stats.totalIn} <span className="text-xs font-normal text-[hsl(var(--success-text))]/70 uppercase ml-1 tracking-tight">{product.unit}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" /> Saídas (Período)
              </div>
              <div className="text-2xl font-bold text-destructive">
                -{stats.totalOut} <span className="text-xs font-normal text-destructive/70 uppercase ml-1 tracking-tight">{product.unit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movement History like a Bank Statement */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">Histórico de Movimentações</h2>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden relative">
          {/* Vertical timeline line for desktop */}
          <div className="hidden sm:block absolute left-[39px] top-6 bottom-6 w-px bg-muted z-0" />
          
          {flatMovements.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <History className="w-8 h-8 opacity-20" />
              <p>Nenhuma movimentação registrada para este produto.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {groupedMovements.map((group) => (
                <div key={group.date} className="relative border-b border-border last:border-0 pb-2">
                   {/* Day Header */}
                   <div className="flex items-center justify-between bg-muted/40 border-b border-border p-3 sm:px-6 sticky top-0 z-20">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-muted-foreground">
                          {format(new Date(group.date), "dd/MM/yyyy")}
                        </h3>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Saldo do dia: <span className="font-bold text-muted-foreground">{group.endOfDayBalance.toFixed(1)} {product.unit}</span>
                      </div>
                   </div>
                   
                   {/* Movements of the day */}
                   <div className="flex flex-col pt-2">
                     {group.movements.map((m) => {
                       const isEntrada = m.type === "entrada";
                       return (
                          <div key={m.id} className="group relative hover:bg-muted/30 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-4 pl-4 sm:pl-16 z-10">
                            {/* Detailed row */}
                            <div className="hidden sm:flex w-2 h-2 rounded-full bg-muted-foreground/30 ring-4 ring-background absolute left-[35px] group-hover:bg-primary transition-colors" />

                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {isEntrada ? (
                                    <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] h-6 px-2 text-[10px] uppercase font-bold tracking-wider">
                                      Compra
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 h-6 px-2 text-[10px] uppercase font-bold tracking-wider">
                                      Aplicação
                                    </Badge>
                                  )}
                                  
                                  {/* Integração Etapa 9: Sinalização de Origem */}
                                  {(() => {
                                    const reason = m.reason?.toLowerCase() || "";
                                    const isFinanceiro = reason.includes("compra") || reason.includes("nf");
                                    const isCampo = reason.includes("plantio") || reason.includes("talhão") || reason.includes("dessecação") || reason.includes("aplicação");
                                    
                                    if (isFinanceiro) return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 h-6 px-2 text-[10px] uppercase font-bold tracking-wider">Origem: Financeiro</Badge>;
                                    if (isCampo) return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 h-6 px-2 text-[10px] uppercase font-bold tracking-wider">Origem: Campo</Badge>;
                                    return <Badge variant="outline" className="bg-muted text-muted-foreground h-6 px-2 text-[10px] uppercase font-bold tracking-wider">Origem: Manual</Badge>;
                                  })()}

                                  {(m.safra || m.talhao) && (
                                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                                      {m.safra} {m.talhao ? `• ${m.talhao}` : ""}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-muted-foreground truncate">
                                  {m.reason || (isEntrada ? "Entrada no estoque" : "Retirada do estoque")}
                                </p>
                              </div>

                              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 sm:w-32 flex-shrink-0">
                                <div className={cn(
                                  "font-mono font-bold text-base",
                                  isEntrada ? "text-[#137333]" : "text-[#c5221f]"
                                )}>
                                  {isEntrada ? "+" : "-"}{m.quantity} <span className="text-xs font-normal opacity-70">{product.unit}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                     })}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FABs mobile */}
      <div className="sm:hidden">
        <Sheet open={isMovementSheetOpen} onOpenChange={setIsMovementSheetOpen}>
          <button
            onClick={() => setIsMovementSheetOpen(true)}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            <ArrowUpRight className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">Movimentar Estoque</SheetTitle>
            </SheetHeader>
            {MovementFormContent}
          </SheetContent>
        </Sheet>
      </div>

      <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl sm:hidden">
          <SheetHeader><SheetTitle>Editar Produto</SheetTitle></SheetHeader>
          <div className="mt-4"><FormContent form={productForm} onSubmit={onUpdateProduct} isPending={updateMutation.isPending} onClose={closeProductForm} isEditing={true} /></div>
        </SheetContent>
      </Sheet>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[400px] hidden sm:block">
          <DialogHeader><DialogTitle>Editar Produto</DialogTitle></DialogHeader>
          <FormContent form={productForm} onSubmit={onUpdateProduct} isPending={updateMutation.isPending} onClose={closeProductForm} isEditing={true} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
