import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  DEMO_FINANCIAL_RECORDS, 
  DEMO_BANK_ACCOUNTS, 
  type FinancialRecord,
  type BankAccount
} from "@/lib/demo-data";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  Plus, 
  Wallet, 
  Loader2, 
  Filter, 
  X, 
  Pencil, 
  Trash2, 
  Download, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarm } from "@/contexts/FarmContext";

const schema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["receita", "despesa"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  value: z.coerce.number().min(0.01, "Valor inválido"),
  status: z.enum(["pago", "aberto"]),
  bankAccountId: z.coerce.number().min(1, "Selecione uma conta"),
  safraId: z.coerce.number().optional().or(z.literal(0)),
  talhaoId: z.coerce.number().optional().or(z.literal(0)),
  supplier: z.string().optional(),
  nfNumber: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function FormContent({ form, bankAccounts, safras, talhoes, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="receita">Receita (+)</SelectItem>
                  <SelectItem value="despesa">Despesa (-)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="pago">Confirmado / Pago</SelectItem>
                  <SelectItem value="aberto">Em aberto / Pendente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0,00" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Venda Safra Soja" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Insumos">Insumos</SelectItem>
                  <SelectItem value="Máquinas">Máquinas</SelectItem>
                  <SelectItem value="Combustível">Combustível</SelectItem>
                  <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="bankAccountId" render={({ field }) => (
            <FormItem>
              <FormLabel>Conta Bancária</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger></FormControl>
                <SelectContent>
                  {bankAccounts.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="safraId" render={({ field }) => (
            <FormItem>
              <FormLabel>Safra (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : "0"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Vincular à safra" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="0">Nenhuma</SelectItem>
                  {safras.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
          <FormField control={form.control} name="talhaoId" render={({ field }) => (
            <FormItem>
              <FormLabel>Talhão (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : "0"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Vincular ao talhão" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="0">Nenhum</SelectItem>
                  {talhoes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="supplier" render={({ field }) => (
            <FormItem><FormLabel>Fornecedor / Cliente</FormLabel><FormControl><Input placeholder="Ex: Cooperativa X" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="nfNumber" render={({ field }) => (
            <FormItem><FormLabel>NF (Opcional)</FormLabel><FormControl><Input placeholder="Número da nota" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1 rounded-xl">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Confirmar Lançamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Financeiro() {
  const { toast } = useToast();
  const { selectedSafraId, selectedTalhaoId, safras, talhoes } = useFarm();
  
  const [records, setRecords] = useState<FinancialRecord[]>(DEMO_FINANCIAL_RECORDS);
  const [bankAccounts] = useState<BankAccount[]>(DEMO_BANK_ACCOUNTS);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  
  const [activeTab, setActiveTab] = useState("movimentacoes");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBank, setFilterBank] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "despesa",
      category: "Outros",
      description: "",
      value: 0,
      status: "pago",
      bankAccountId: 0,
      safraId: selectedSafraId || 0,
      talhaoId: selectedTalhaoId || 0,
      supplier: "",
      nfNumber: "",
    },
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Filtros de Contexto (FarmContext)
      if (selectedSafraId && r.safraId && r.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && r.talhaoId && r.talhaoId !== selectedTalhaoId) return false;

      // Filtros da Interface
      if (filterType !== "all" && r.type !== filterType) return false;
      if (filterBank !== "all" && r.bankAccountId !== Number(filterBank)) return false;
      
      if (search) {
        const s = search.toLowerCase();
        return (
          r.description.toLowerCase().includes(s) || 
          r.supplier?.toLowerCase().includes(s) || 
          r.bankAccountName.toLowerCase().includes(s) ||
          r.category.toLowerCase().includes(s)
        );
      }
      return true;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterType, filterBank, search, selectedSafraId, selectedTalhaoId]);

  const totals = useMemo(() => {
    const receita = filteredRecords.filter(r => r.type === "receita" && r.status === "pago").reduce((acc, r) => acc + r.value, 0);
    const despesa = filteredRecords.filter(r => r.type === "despesa" && r.status === "pago").reduce((acc, r) => acc + r.value, 0);
    const pendenteReceita = filteredRecords.filter(r => r.type === "receita" && r.status === "aberto").reduce((acc, r) => acc + r.value, 0);
    const pendenteDespesa = filteredRecords.filter(r => r.type === "despesa" && r.status === "aberto").reduce((acc, r) => acc + r.value, 0);
    
    return {
      receita,
      despesa,
      saldo: receita - despesa,
      pendenteReceita,
      pendenteDespesa
    };
  }, [filteredRecords]);

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    setEditingRecord(null);
    form.reset();
  };

  const handleEdit = (record: FinancialRecord, isMobile: boolean) => {
    setEditingRecord(record);
    form.reset({
      date: record.date.split("T")[0],
      type: record.type,
      category: record.category,
      description: record.description,
      value: record.value,
      status: record.status,
      bankAccountId: record.bankAccountId,
      safraId: record.safraId || 0,
      talhaoId: record.talhaoId || 0,
      supplier: record.supplier || "",
      nfNumber: record.nfNumber || "",
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const bankAccount = bankAccounts.find(a => a.id === Number(values.bankAccountId));
    
    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { 
        ...r, 
        ...values, 
        bankAccountName: bankAccount?.name || r.bankAccountName 
      } : r));
      toast({ title: "Lançamento atualizado com sucesso!" });
    } else {
      const newRecord: FinancialRecord = {
        id: Math.max(...records.map(r => r.id), 0) + 1,
        ...values,
        bankAccountName: bankAccount?.name || "Desconhecida",
        createdAt: new Date().toISOString(),
      };
      setRecords([newRecord, ...records]);
      toast({ title: "Lançamento registrado!" });
    }
    closeForm();
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: "Lançamento excluído." });
    }
  };

  const handleExport = () => {
    toast({ title: "Exportação iniciada...", description: "O arquivo CSV será baixado em instantes." });
    // Lógica de exportação simulada
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Wallet className="hidden sm:block w-7 h-7 text-primary" />
              Gestão Financeira
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Controle de fluxo de caixa e saldos bancários.
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExport} className="hidden sm:flex h-10 px-4 gap-2 rounded-xl">
              <Download className="w-4 h-4" /> Exportar
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeForm()}>
              <DialogTrigger asChild>
                <Button className="hidden sm:flex h-10 px-5 gap-2 rounded-xl shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? "Editar Lançamento" : "Novo Lançamento Financeiro"}</DialogTitle>
                </DialogHeader>
                <FormContent 
                  form={form} 
                  bankAccounts={bankAccounts} 
                  safras={safras} 
                  talhoes={talhoes}
                  onSubmit={onSubmit}
                  onClose={closeForm}
                  isEditing={!!editingRecord}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-none shadow-sm bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-700/60 uppercase tracking-wider">Receitas Pagas</p>
                <p className="text-xl font-black text-green-700">R$ {totals.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {totals.pendenteReceita > 0 && (
                  <p className="text-[10px] text-green-600/70 font-medium">R$ {totals.pendenteReceita.toLocaleString()} pendente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-red-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-700/60 uppercase tracking-wider">Despesas Pagas</p>
                <p className="text-xl font-black text-red-700">R$ {totals.despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {totals.pendenteDespesa > 0 && (
                  <p className="text-[10px] text-red-600/70 font-medium">R$ {totals.pendenteDespesa.toLocaleString()} pendente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl border-none shadow-sm ${totals.saldo >= 0 ? 'bg-primary/5' : 'bg-orange-50'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${totals.saldo >= 0 ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-600'}`}>
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${totals.saldo >= 0 ? 'text-primary' : 'text-orange-700'}`}>Saldo em Caixa</p>
                <p className={`text-xl font-black ${totals.saldo >= 0 ? 'text-primary' : 'text-orange-700'}`}>R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Considerando apenas pagos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="movimentacoes" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-11">
            <TabsTrigger value="movimentacoes" className="rounded-lg px-6">Movimentações</TabsTrigger>
            <TabsTrigger value="contas" className="rounded-lg px-6">Contas Bancárias</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por descrição..." 
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
          <Card className="mb-4 rounded-2xl border-muted bg-slate-50/50">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo de Registro</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-9 bg-white border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="receita">Apenas Receitas</SelectItem>
                    <SelectItem value="despesa">Apenas Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Conta Bancária</label>
                <Select value={filterBank} onValueChange={setFilterBank}>
                  <SelectTrigger className="h-9 bg-white border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {bankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" onClick={() => {setFilterType("all"); setFilterBank("all"); setSearch("");}} className="h-9 text-xs text-muted-foreground gap-2">
                  <X className="w-3 h-3" /> Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="movimentacoes" className="mt-0">
          {/* Desktop Table */}
          <div className="hidden sm:block bg-card rounded-2xl border border-muted shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                      Nenhum registro financeiro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r) => (
                    <TableRow key={r.id} className="group hover:bg-muted/20 cursor-pointer" onClick={() => handleEdit(r, false)}>
                      <TableCell className="font-medium text-muted-foreground text-xs uppercase">
                        {format(new Date(r.date), "dd/MM/yy")}
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground truncate">{r.description}</span>
                          {r.supplier && <span className="text-[10px] text-muted-foreground truncate uppercase">{r.supplier}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium bg-slate-50 uppercase tracking-tighter">
                          {r.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{r.bankAccountName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.status === "pago" ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">Pago</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-orange-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">Aberto</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-black font-mono ${r.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {r.type === 'receita' ? '+' : '-'} R$ {r.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                              <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 text-destructive focus:text-destructive focus:bg-red-50">
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
              onExportClick={handleExport}
              activeFilterCount={ (filterType !== 'all' ? 1 : 0) + (filterBank !== 'all' ? 1 : 0) }
            />
            
            {filteredRecords.map((r) => (
              <div 
                key={r.id} 
                className="p-4 bg-card rounded-2xl border border-muted shadow-sm touch-card active:scale-[0.98] transition-transform"
                onClick={() => handleEdit(r, true)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === 'pago' ? 'secondary' : 'outline'} className={`text-[10px] uppercase font-bold py-0 ${r.status === 'pago' ? 'bg-green-100 text-green-700' : 'text-orange-500'}`}>
                        {r.status}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(r.date), "dd/MM/yyyy")}</span>
                    </div>
                    <p className="font-bold text-slate-800 leading-tight truncate max-w-[200px]">{r.description}</p>
                  </div>
                  <div className={`text-right font-black ${r.type === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {r.type === 'receita' ? '+' : '-'} R$ {r.value.toLocaleString()}
                  </div>
                </div>
                
                <div className="flex justify-between items-end pt-3 border-t border-dashed border-muted/60">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none">{r.category}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                      <Building2 className="w-3 h-3" />
                      <span className="text-[11px] font-medium truncate max-w-[150px]">{r.bankAccountName}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contas" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map(acc => {
              const balance = records
                .filter(r => r.bankAccountId === acc.id && r.status === "pago")
                .reduce((acc, r) => r.type === 'receita' ? acc + r.value : acc - r.value, 0);
              
              const pendente = records
                .filter(r => r.bankAccountId === acc.id && r.status === "aberto")
                .reduce((acc, r) => r.type === 'receita' ? acc + r.value : acc - r.value, 0);

              return (
                <Card key={acc.id} className="rounded-2xl border-muted shadow-sm hover:border-primary/30 transition-colors">
                  <CardHeader className="p-4 pb-2 border-b border-muted/40 bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center font-bold text-primary shadow-sm uppercase">
                          {acc.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold">{acc.name}</CardTitle>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Conta Corrente</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreHorizontal className="w-4 h-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="text-xs">Extrato Detalhado</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">Editar Conta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Saldo Confirmado</span>
                      <span className={`text-lg font-black font-mono ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {pendente !== 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-dashed">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Previsto / Pendente</span>
                        <span className={`text-xs font-bold font-mono ${pendente >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {pendente >= 0 ? '+' : ''} R$ {pendente.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* FAB Mobile */}
      <div className="sm:hidden">
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeForm()}>
          <SheetTrigger asChild>
            <button
              className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-xl flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 h-[92vh] max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl font-bold">{editingRecord ? "Editar Lançamento" : "Novo Lançamento Financeiro"}</SheetTitle>
            </SheetHeader>
            <FormContent 
              form={form} 
              bankAccounts={bankAccounts} 
              safras={safras} 
              talhoes={talhoes}
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
