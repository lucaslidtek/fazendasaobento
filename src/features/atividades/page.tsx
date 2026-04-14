import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  DEMO_ACTIVITIES, 
  DEMO_TALHOES, 
  DEMO_MACHINES, 
  DEMO_USERS,
  DEMO_PRODUCTS,
  type ActivityRecord
} from "@/lib/demo-data";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  Plus, 
  Activity, 
  Loader2, 
  Filter, 
  Pencil, 
  Trash2, 
  Download, 
  MoreHorizontal, 
  Sprout, 
  Droplets, 
  Hammer, 
  MapPin, 
  Tractor,
  User as UserIcon,
  Search,
  ClipboardList,
  Printer,
  DollarSign,
  Leaf,
  FlaskConical,
  Fuel,
  Package
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { Card, CardContent } from "@/components/ui/card";
import { useFarm } from "@/contexts/FarmContext";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["Plantio", "Pulverização", "Adubação", "Incorporação", "Outro"]),
  talhaoId: z.coerce.number().min(1, "Selecione um talhão"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  operatorId: z.coerce.number().min(1, "Selecione um operador"),
  areaHectares: z.coerce.number().min(0.1, "Área inválida"),
  notes: z.string().optional(),
  products: z.array(z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    quantity: z.coerce.number().min(0.01, "Qtde inválida"),
    unit: z.string().min(1, "Unidade é obrigatória"),
    unitPrice: z.coerce.number().min(0, "Preço inválido"),
  })),
});

type FormValues = z.infer<typeof schema>;

// Helper para cores de badges de atividade
const getActivityColor = (type: string) => {
  switch (type) {
    case "Plantio": return "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]";
    case "Pulverização": return "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]";
    case "Adubação": return "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]";
    case "Incorporação": return "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Plantio": return <Sprout className="w-3 h-3" />;
    case "Pulverização": return <Droplets className="w-3 h-3" />;
    case "Adubação": return <Hammer className="w-3 h-3" />;
    default: return <Activity className="w-3 h-3" />;
  }
};

// Helper para cor/ícone das tags de insumos por categoria de produto
const getProductTagStyle = (productName: string) => {
  const product = DEMO_PRODUCTS.find(p => p.name === productName);
  const category = product?.category || "";
  switch (category) {
    case "Sementes":
      return { className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", icon: <Leaf className="w-2.5 h-2.5" /> };
    case "Defensivos":
      return { className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800", icon: <FlaskConical className="w-2.5 h-2.5" /> };
    case "Fertilizantes":
      return { className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800", icon: <Droplets className="w-2.5 h-2.5" /> };
    case "Combustível":
      return { className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800", icon: <Fuel className="w-2.5 h-2.5" /> };
    default:
      return { className: "bg-muted text-muted-foreground border-border", icon: null };
  }
};

function FormContent({ form, talhoes, machines, users, onSubmit, isPending, onClose, isEditing }: any) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products"
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data da Atividade</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Operação</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Plantio">Plantio</SelectItem>
                  <SelectItem value="Pulverização">Pulverização</SelectItem>
                  <SelectItem value="Adubação">Adubação</SelectItem>
                  <SelectItem value="Incorporação">Incorporação</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="talhaoId" render={({ field }) => (
            <FormItem>
              <FormLabel>Talhão</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o talhão" /></SelectTrigger></FormControl>
                <SelectContent>
                  {talhoes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="areaHectares" render={({ field }) => (
            <FormItem><FormLabel>Área Trabalhada (ha)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 20.5" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="machineId" render={({ field }) => (
            <FormItem>
              <FormLabel>Máquina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a máquina" /></SelectTrigger></FormControl>
                <SelectContent>
                  {machines.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="operatorId" render={({ field }) => (
            <FormItem>
              <FormLabel>Operador</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o operador" /></SelectTrigger></FormControl>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" /> Insumos / Produtos
            </h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ name: "", quantity: 0, unit: "sc/ha", unitPrice: 0 })}
              className="h-8 rounded-lg text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhum insumo adicionado.</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-card p-3 rounded-xl border space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <FormField control={form.control} name={`products.${index}.name`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/60">Produto</FormLabel>
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(val);
                            const p = DEMO_PRODUCTS.find(prod => prod.name === val);
                            if (p) {
                              form.setValue(`products.${index}.unit`, p.unit);
                              if (p.unitPrice) form.setValue(`products.${index}.unitPrice`, p.unitPrice);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEMO_PRODUCTS.map(p => (
                              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(index)}
                    className="h-7 w-7 rounded-lg mt-5 shrink-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <FormField control={form.control} name={`products.${index}.quantity`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/60">Qtde</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-8 text-sm" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>
                  <div>
                    <FormField control={form.control} name={`products.${index}.unit`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/60">Unid</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-8 text-xs px-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L/ha">L/ha</SelectItem>
                              <SelectItem value="kg/ha">kg/ha</SelectItem>
                              <SelectItem value="sc/ha">sc/ha</SelectItem>
                              <SelectItem value="un/ha">un/ha</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>
                  <div>
                    <FormField control={form.control} name={`products.${index}.unitPrice`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/60">R$/un</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-8 text-sm" placeholder="0,00" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>
                </div>
                {/* Inline value calculation */}
                {(() => {
                  const qty = form.watch(`products.${index}.quantity`) || 0;
                  const price = form.watch(`products.${index}.unitPrice`) || 0;
                  const total = qty * price;
                  return total > 0 ? (
                    <div className="text-right text-[10px] font-bold text-primary">
                      = R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  ) : null;
                })()}
              </div>
            ))}
          </div>

          {/* Subtotal de insumos */}
          {(() => {
            const products = form.watch('products') || [];
            const area = form.watch('areaHectares') || 0;
            const subtotal = products.reduce((acc: number, p: any) => acc + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
            if (subtotal <= 0) return null;
            return (
              <div className="mt-3 pt-3 border-t border-dashed border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Custo Total dos Insumos</p>
                  <p className="text-sm font-black text-foreground">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                {area > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Custo/ha</p>
                    <p className="text-sm font-black text-primary">R$ {(subtotal / area).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Observações</FormLabel><FormControl><Input placeholder="Ex: Aplicação feita com ventos fracos..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1 rounded-xl">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Registrar Atividade"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Atividades() {
  const { toast } = useToast();
  const { selectedSafraId, selectedTalhaoId } = useFarm();
  
  const [records, setRecords] = useState<ActivityRecord[]>(DEMO_ACTIVITIES);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);
  
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "Plantio",
      talhaoId: selectedTalhaoId || 0,
      machineId: 0,
      operatorId: 0,
      areaHectares: 0,
      notes: "",
      products: [],
    },
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedSafraId && r.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && r.talhaoId !== selectedTalhaoId) return false;

      if (filterType !== "all" && r.type !== filterType) return false;
      
      if (search) {
        const s = search.toLowerCase();
        return (
          r.talhaoName.toLowerCase().includes(s) || 
          r.operatorName.toLowerCase().includes(s) || 
          r.machineName.toLowerCase().includes(s) ||
          r.type.toLowerCase().includes(s)
        );
      }
      return true;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterType, search, selectedSafraId, selectedTalhaoId]);

  const stats = useMemo(() => {
    const totalArea = filteredRecords.reduce((acc, r) => acc + r.areaHectares, 0);
    const count = filteredRecords.length;
    const totalCost = filteredRecords.reduce((acc, r) => {
      const activityCost = (r.products || []).reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
      return acc + activityCost;
    }, 0);
    const avgCostPerHa = totalArea > 0 ? totalCost / totalArea : 0;
    return { totalArea, count, totalCost, avgCostPerHa };
  }, [filteredRecords]);

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    setEditingRecord(null);
    form.reset();
  };

  const handleEdit = (record: ActivityRecord, isMobile: boolean) => {
    setEditingRecord(record);
    form.reset({
      date: record.date.split("T")[0],
      type: record.type as any,
      talhaoId: record.talhaoId,
      machineId: record.machineId,
      operatorId: record.operatorId,
      areaHectares: record.areaHectares,
      notes: record.notes || "",
      products: record.products || [],
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const talhao = DEMO_TALHOES.find(t => t.id === Number(values.talhaoId));
    const machine = DEMO_MACHINES.find(m => m.id === Number(values.machineId));
    const user = DEMO_USERS.find(u => u.id === Number(values.operatorId));
    
    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { 
        ...r, 
        ...values, 
        talhaoName: talhao?.name || r.talhaoName,
        machineName: machine?.name || r.machineName,
        operatorName: user?.name || r.operatorName
      } : r));
      toast({ title: "Atividade atualizada!" });
    } else {
      const newRecord: ActivityRecord = {
        id: Math.max(...records.map(r => r.id), 0) + 1,
        ...values,
        talhaoName: talhao?.name || "Desconhecido",
        machineName: machine?.name || "Desconhecida",
        operatorName: user?.name || "Desconhecido",
        safraId: selectedSafraId || 4,
        products: values.products,
        createdAt: new Date().toISOString(),
      };
      
      // Simulação de Baixa de Estoque
      values.products.forEach(p => {
        const product = DEMO_PRODUCTS.find(dp => dp.name === p.name);
        if (product) {
          product.currentStock = Math.max(0, (product.currentStock || 0) - (p.quantity || 0));
        }
      });

      setRecords([newRecord, ...records]);
      toast({ 
        title: "Atividade registrada!",
        description: values.products.length > 0 ? "Baixa de estoque processada automaticamente." : undefined
      });
    }
    closeForm();
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseja mesmo excluir este registro de atividade?")) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: "Atividade excluída." });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Activity className="hidden sm:block w-7 h-7 text-primary" />
              Atividades de Campo
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Registro de operações agrícolas e monitoramento de talhões.
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto no-print">
            <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 text-primary">
              <Printer className="w-4 h-4" /> Imprimir PDF
            </Button>
            <Button variant="outline" className="hidden sm:flex h-10 px-4 gap-2 rounded-xl">
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) closeForm(); }}>
              <DialogTrigger asChild>
                <Button className="hidden sm:flex h-10 px-5 gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Nova Atividade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? "Editar Atividade" : "Novo Registro de Atividade"}</DialogTitle>
                </DialogHeader>
                <FormContent 
                  form={form} 
                  talhoes={DEMO_TALHOES} 
                  machines={DEMO_MACHINES} 
                  users={DEMO_USERS}
                  onSubmit={onSubmit}
                  onClose={closeForm}
                  isEditing={!!editingRecord}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary/60 uppercase tracking-wider">Total de Atividades</p>
                <p className="text-xl font-black text-primary">{stats.count} Registros</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Na safra selecionada</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-muted/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Área Trabalhada</p>
                <p className="text-xl font-black text-foreground">{stats.totalArea.toLocaleString()} Hectares</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Soma das atividades filtradas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-[hsl(var(--warning-subtle))]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--warning)/0.15)] flex items-center justify-center text-[hsl(var(--warning-text))]">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[hsl(var(--warning-text))]/60 uppercase tracking-wider">Custo Total</p>
                <p className="text-xl font-black text-[hsl(var(--warning-text))]">R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Média: R$ {stats.avgCostPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-card border-muted-foreground/10 text-muted-foreground font-bold uppercase text-[10px]">
            Recentes
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">Histórico de operações</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por talhão, operador..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 w-10 rounded-xl shrink-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4 rounded-2xl border-muted bg-muted/30 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo de Atividade</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 bg-card border-none transition-all"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as operações</SelectItem>
                  <SelectItem value="Plantio">Plantio</SelectItem>
                  <SelectItem value="Pulverização">Pulverização</SelectItem>
                  <SelectItem value="Adubação">Adubação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block bg-card rounded-2xl border border-muted overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead>Operação</TableHead>
              <TableHead>Talhão</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Insumos</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">R$/ha</TableHead>
              <TableHead>Máquina / Operador</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                  Nenhuma atividade registrada para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((r) => (
                <TableRow key={r.id} className="group hover:bg-muted/20 cursor-pointer" onClick={() => handleEdit(r, false)}>
                  <TableCell className="font-medium text-muted-foreground text-xs">
                    {format(new Date(r.date), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1 border ${getActivityColor(r.type)}`} variant="outline">
                        {getActivityIcon(r.type)}
                        {r.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="font-bold text-foreground">{r.talhaoName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{r.areaHectares} ha</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                      {r.products?.slice(0, 2).map((p, idx) => {
                        const style = getProductTagStyle(p.name);
                        return (
                          <Badge key={idx} variant="outline" className={`text-[10px] font-semibold border rounded-md px-2 py-0.5 flex items-center gap-1 ${style.className}`}>
                            {style.icon}
                            {p.name}
                          </Badge>
                        );
                      })}
                      {r.products && r.products.length > 2 && (
                        <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 bg-primary/5 rounded-md px-1.5 py-0.5">
                          +{r.products.length - 2}
                        </Badge>
                      )}
                      {!r.products?.length && <span className="text-muted-foreground text-xs">—</span>}
                      {r.products && r.products.length > 0 && (
                        <Badge variant="outline" className="text-[9px] h-4 font-bold bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)] gap-0.5">
                          <Package className="w-2.5 h-2.5" /> Estoque ↓
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {(() => {
                      const total = (r.products || []).reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
                      return total > 0 ? `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—';
                    })()}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {(() => {
                      const total = (r.products || []).reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
                      const costHa = r.areaHectares > 0 ? total / r.areaHectares : 0;
                      return costHa > 0 ? `R$ ${costHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—';
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                        <Tractor className="w-3 h-3 text-muted-foreground" /> {r.machineName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase flex-nowrap">
                        <UserIcon className="w-2.5 h-2.5" /> {r.operatorName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => handleEdit(r, false)} className="gap-2 focus:bg-muted">
                            <Pencil className="w-4 h-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/5">
                            <Trash2 className="w-4 h-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        <MobileListControls 
          onFilterClick={() => setShowFilters(!showFilters)} 
          onExportClick={() => {}}
          activeFilterCount={filterType !== 'all' ? 1 : 0}
        />
        
        {filteredRecords.map((r) => (
          <div 
            key={r.id} 
            className="p-4 bg-card rounded-2xl border border-muted touch-card active:scale-[0.98] transition-transform"
            onClick={() => handleEdit(r, true)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border ${getActivityColor(r.type)}`} variant="outline">
                  {r.type}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(r.date), "dd/MM/yyyy")}</span>
                {r.products && r.products.length > 0 && (
                  <Badge variant="outline" className="text-[9px] h-4 font-bold bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)] gap-0.5">
                    <Package className="w-2.5 h-2.5" /> Estoque ↓
                  </Badge>
                )}
              </div>
              <p className="font-black text-primary text-sm">{r.areaHectares} ha</p>
            </div>
            
            <p className="font-bold text-foreground text-base mb-1">{r.talhaoName}</p>

            {/* Pricing info */}
            {(() => {
              const total = (r.products || []).reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
              const costHa = r.areaHectares > 0 ? total / r.areaHectares : 0;
              return total > 0 ? (
                <div className="flex items-center gap-3 mt-2 mb-2">
                  <div className="bg-[hsl(var(--warning-subtle))] px-2.5 py-1 rounded-lg border border-[hsl(var(--warning)/0.2)]">
                    <p className="text-[9px] uppercase font-bold text-[hsl(var(--warning-text))]/60">Valor Total</p>
                    <p className="text-xs font-black text-[hsl(var(--warning-text))]">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  {costHa > 0 && (
                    <div className="bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                      <p className="text-[9px] uppercase font-bold text-primary/60">Custo/ha</p>
                      <p className="text-xs font-black text-primary">R$ {costHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
            
            <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Tractor className="w-3 h-3" /> {r.machineName}
                </div>
                <span className="text-muted-foreground/30">|</span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate max-w-[100px]">
                  <UserIcon className="w-3 h-3" /> {r.operatorName}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                {r.products?.slice(0, 1).map((p, idx) => {
                  const style = getProductTagStyle(p.name);
                  return (
                    <Badge key={idx} variant="outline" className={`text-[9px] font-semibold border rounded-md px-1.5 py-0.5 flex items-center gap-1 ${style.className}`}>
                      {style.icon}
                      {p.name}
                    </Badge>
                  );
                })}
                {r.products && r.products.length > 1 && (
                  <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 bg-primary/5 rounded-md px-1.5 py-0.5">
                    +{r.products.length - 1}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB Mobile */}
      <div className="sm:hidden">
        <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) closeForm(); }}>
          <SheetTrigger asChild>
            <button
              className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 h-[92vh] max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl font-bold">{editingRecord ? "Editar Atividade" : "Nova Atividade de Campo"}</SheetTitle>
            </SheetHeader>
            <FormContent 
              form={form} 
              talhoes={DEMO_TALHOES} 
              machines={DEMO_MACHINES} 
              users={DEMO_USERS}
              onSubmit={onSubmit}
              onClose={closeForm}
              isEditing={!!editingRecord}
            />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
