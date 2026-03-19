import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListFueling, useCreateFueling, useDeleteFueling, useUpdateFueling, getListFuelingQueryKey, useListMachines, useListUsers } from "@workspace/api-client-react";
import { DEMO_FUELINGS, DEMO_MACHINES, DEMO_DIESEL_TRANSACTIONS, DEMO_USERS, type FuelingRecord, type DieselTransaction } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Fuel, Loader2, Droplets, Pencil, Trash2, Filter, X, ArrowUpRight, ArrowDownLeft, FileText, Search, Download, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { Card, CardContent } from "@/components/ui/card";
import { getServiceBadgeStyle } from "@/lib/colors";

const fuelingSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  machineId: z.coerce.number().min(1, "Selecione uma máquina"),
  operatorName: z.string().min(1, "Nome do operador é obrigatório"),
  talhao: z.string().min(1, "Talhão é obrigatório"),
  servico: z.string().min(1, "Serviço é obrigatório"),
  responsavelId: z.coerce.number().min(1, "Selecione um responsável"),
  liters: z.coerce.number().min(0.1, "Quantidade inválida"),
  notes: z.string().optional(),
});

const transactionSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["entrada", "saida"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  value: z.coerce.number().min(0, "Valor inválido"),
  liters: z.coerce.number().min(0.1, "Quantidade inválida"),
  nfNumber: z.string().optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
});

function FormContent({ form, machines, users, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="machineId" render={({ field }) => (
            <FormItem><FormLabel>Máquina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  {machines?.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="operatorName" render={({ field }) => (
            <FormItem><FormLabel>Operador</FormLabel><FormControl><Input placeholder="Quem operou" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="responsavelId" render={({ field }) => (
            <FormItem><FormLabel>Responsável Lançamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  {users?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="talhao" render={({ field }) => (
            <FormItem><FormLabel>Talhão</FormLabel><FormControl><Input placeholder="Ex: Talhão A1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="servico" render={({ field }) => (
            <FormItem><FormLabel>Serviço</FormLabel><FormControl><Input placeholder="Ex: Colheita" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="liters" render={({ field }) => (
          <FormItem><FormLabel>Volume (Litros)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Observações</FormLabel><FormControl><Input placeholder="Opcional" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Registrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function TransactionForm({ form, onSubmit, isPending, onClose, isEditing }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem><FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (Compra)</SelectItem>
                  <SelectItem value="saida">Saída (Ajuste/Extra)</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Compra Posto" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="liters" render={({ field }) => (
            <FormItem><FormLabel>Litragem</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem><FormLabel>Valor Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="nfNumber" render={({ field }) => (
            <FormItem><FormLabel>Nº Nota Fiscal</FormLabel><FormControl><Input placeholder="Ex: NF-12345" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Anexo da NF</label>
          <div className="flex items-center gap-3 p-3 border border-dashed rounded-lg bg-muted/30">
            <div className="p-2 bg-background rounded-md border shadow-sm">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-hidden text-ellipsis">
              <p className="text-xs font-medium">Nenhum arquivo selecionado</p>
              <p className="text-[10px] text-muted-foreground italic truncate">PDF ou Imagem (Máx 5MB)</p>
            </div>
            <Button type="button" variant="secondary" size="sm" className="h-8">Anexar</Button>
          </div>
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição/Observações</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Salvar Lançamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
function FuelingDetailView({ record, onClose }: { record: FuelingRecord, onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Data</p>
          <p className="font-medium">{format(new Date(record.date), "dd/MM/yyyy")}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Máquina</p>
          <p className="font-medium text-primary">{record.machineName}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Operador</p>
          <p className="font-medium">{record.operatorName}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Responsável</p>
          <p className="font-medium">{record.responsavelName || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Talhão</p>
          <p className="font-medium">{record.talhao}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Serviço</p>
          <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getServiceBadgeStyle(record.servico as string)}`}>
            {record.servico}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Volume</p>
          <p className="font-bold text-primary text-lg">{record.liters} L</p>
        </div>
      </div>
      {record.notes && (
        <div className="pt-4 border-t border-dashed">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Observações</p>
          <div className="bg-muted/30 p-3 rounded-lg text-sm italic">{record.notes}</div>
        </div>
      )}
      <div className="flex justify-end pt-4">
        <Button onClick={onClose} variant="secondary">Fechar</Button>
      </div>
    </div>
  );
}

function TransactionDetailView({ transaction, onClose }: { transaction: DieselTransaction, onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${transaction.type === 'entrada' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]'}`}>
            {transaction.type === 'entrada' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xl font-bold">{transaction.category}</p>
            <p className="text-sm text-muted-foreground capitalize">{transaction.type}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black font-mono ${transaction.type === 'entrada' ? 'text-[hsl(var(--success-text))]' : 'text-[hsl(var(--warning-text))]'}`}>
             {transaction.type === 'entrada' ? '+' : '-'}{transaction.liters} L
          </p>
          <p className="text-sm font-semibold text-muted-foreground">
            R$ {transaction.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-2">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Data do Lançamento</p>
          <p className="font-medium">{format(new Date(transaction.date), "dd/MM/yyyy")}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Nota Fiscal</p>
          <p className="font-medium font-mono">{transaction.nfNumber || "Não informada"}</p>
        </div>
      </div>

      <div className="px-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Descrição</p>
        <p className="text-sm text-muted-foreground">{transaction.description}</p>
      </div>

      {transaction.nfNumber && (
        <div className="mx-2 p-4 border border-dashed rounded-xl flex items-center justify-between gap-4 group hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Nota Fiscal Digitalizada</p>
              <p className="text-[10px] text-muted-foreground uppercase">PDF · 1.2 MB</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Visualizar</Button>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onClose} variant="secondary">Fechar</Button>
      </div>
    </div>
  );
}

export default function Abastecimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFuelingDialogOpen, setIsFuelingDialogOpen] = useState(false);
  const [isFuelingDetailOpen, setIsFuelingDetailOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FuelingRecord | null>(null);
  const [_editingTransaction, setEditingTransaction] = useState<DieselTransaction | null>(null);
  const [viewingRecord, setViewingRecord] = useState<FuelingRecord | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<DieselTransaction | null>(null);
  const [activeTab, setActiveTab] = useState("fuelings");

  // Filtros Abastecimentos
  const [filterMachine, setFilterMachine] = useState("__all__");
  const [filterOperator, setFilterOperator] = useState("__all__");
  const [filterDate, setFilterDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtros Movimentações
  const [filterTransactionType, setFilterTransactionType] = useState("__all__");
  const [filterTransactionCategory, setFilterTransactionCategory] = useState("__all__");
  const [filterTransactionDate, setFilterTransactionDate] = useState("");
  const [filterTransactionNF, setFilterTransactionNF] = useState("");
  const [showTransactionFilters, setShowTransactionFilters] = useState(false);

  const { data: apiRecords } = useListFueling();
  const { data: apiMachines } = useListMachines();
  const { data: apiUsers } = useListUsers();
  
  const [transactions, setTransactions] = useState<DieselTransaction[]>(DEMO_DIESEL_TRANSACTIONS);
  const records = (apiRecords ?? DEMO_FUELINGS) as FuelingRecord[];
  const machines = apiMachines ?? DEMO_MACHINES;
  const users = useMemo(() => {
    if (apiUsers && apiUsers.length > 0) return apiUsers;
    return DEMO_USERS;
  }, [apiUsers]);

  const uniqueOperators = useMemo(() => {
    const ops = new Set(records.map(r => r.operatorName).filter(Boolean));
    return Array.from(ops).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterMachine !== "__all__" && r.machineId !== Number(filterMachine)) return false;
      if (filterOperator !== "__all__" && r.operatorName !== filterOperator) return false;
      if (filterDate && r.date !== filterDate) return false;
      return true;
    });
  }, [records, filterMachine, filterOperator, filterDate]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterTransactionType !== "__all__" && t.type !== filterTransactionType) return false;
      if (filterTransactionCategory !== "__all__" && t.category !== filterTransactionCategory) return false;
      if (filterTransactionDate && t.date !== filterTransactionDate) return false;
      if (filterTransactionNF && !t.nfNumber?.toLowerCase().includes(filterTransactionNF.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterTransactionType, filterTransactionCategory, filterTransactionDate, filterTransactionNF]);

  const fuelBalance = useMemo(() => {
    const totalIn = transactions.reduce((acc, t) => t.type === "entrada" ? acc + (t.liters || 0) : acc, 0);
    const totalOutTransactions = transactions.reduce((acc, t) => t.type === "saida" ? acc + (t.liters || 0) : acc, 0);
    const totalOutFuelings = records.reduce((acc, r) => acc + (r.liters || 0), 0);
    return totalIn - totalOutTransactions - totalOutFuelings;
  }, [transactions, records]);

  // const fuelValueTotal = useMemo(() => {
  //   return transactions.reduce((acc, t) => t.type === "entrada" ? acc + (t.value || 0) : acc, 0);
  // }, [transactions]);

  const createFuelingMutation = useCreateFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Abastecimento registrado." });
        closeForm();
      },
    },
  });

  const updateFuelingMutation = useUpdateFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Abastecimento atualizado." });
        closeForm();
      },
    },
  });

  const deleteFuelingMutation = useDeleteFueling({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFuelingQueryKey() });
        toast({ title: "Registro excluído." });
      },
    },
  });

  const fuelingForm = useForm<z.infer<typeof fuelingSchema>>({
    resolver: zodResolver(fuelingSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      operatorName: "",
      talhao: "",
      servico: "",
      responsavelId: 0,
      liters: 0,
      notes: "",
    },
  });

  const transactionForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "entrada",
      category: "Compra",
      value: 0,
      liters: 0,
      nfNumber: "",
      description: "",
    },
  });

  const closeForm = () => {
    setIsFuelingDialogOpen(false);
    setIsFuelingDetailOpen(false);
    setIsTransactionDialogOpen(false);
    setIsTransactionDetailOpen(false);
    setIsSheetOpen(false);
    setIsTransactionSheetOpen(false);
    setEditingRecord(null);
    setEditingTransaction(null);
    setViewingRecord(null);
    setViewingTransaction(null);
    fuelingForm.reset();
    transactionForm.reset({
        date: new Date().toISOString().split("T")[0],
        type: "entrada",
        category: "Compra",
        value: 0,
        liters: 0,
        nfNumber: "",
        description: "",
    });
  };

  const handleFuelingSubmit = (data: any) => {
    if (editingRecord) updateFuelingMutation.mutate({ id: editingRecord.id, data });
    else createFuelingMutation.mutate({ data });
  };

  const handleTransactionSubmit = (data: any) => {
    if (_editingTransaction) {
      setTransactions(transactions.map(t => t.id === _editingTransaction.id ? { ...t, ...data } : t));
      toast({ title: "Movimentação atualizada." });
    } else {
      const newTransaction: DieselTransaction = {
        ...data,
        id: transactions.length + 1,
        createdAt: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);
      toast({ title: data.type === "entrada" ? "Entrada registrada" : "Saída registrada" });
    }
    closeForm();
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm("Excluir movimentação?")) {
      setTransactions(transactions.filter(t => t.id !== id));
      toast({ title: "Movimentação excluída." });
    }
  };

  const handleEditTransactionOpen = (transaction: DieselTransaction, isMobile: boolean) => {
    setEditingTransaction(transaction);
    transactionForm.reset({
      date: transaction.date?.split("T")[0] ?? transaction.date,
      type: transaction.type,
      category: transaction.category,
      value: transaction.value,
      liters: transaction.liters,
      nfNumber: transaction.nfNumber || "",
      description: transaction.description || "",
    });
    if (isMobile) setIsTransactionSheetOpen(true);
    else setIsTransactionDialogOpen(true);
  };

  const handleEditOpen = (record: FuelingRecord, isMobile: boolean) => {
    setEditingRecord(record);
    fuelingForm.reset({
      date: record.date?.split("T")[0] ?? record.date,
      machineId: record.machineId,
      operatorName: record.operatorName,
      talhao: record.talhao || "",
      servico: record.servico || "",
      responsavelId: record.responsavelId || 0,
      liters: record.liters,
      notes: record.notes || "",
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsFuelingDialogOpen(true);
  };

  const fuelingFormProps = {
    form: fuelingForm,
    machines,
    users,
    onSubmit: handleFuelingSubmit,
    isPending: createFuelingMutation.isPending || updateFuelingMutation.isPending,
    onClose: closeForm,
    isEditing: !!editingRecord,
  };

  const clearFilters = () => {
    setFilterMachine("__all__");
    setFilterOperator("__all__");
    setFilterDate("");
  };

  const activeFilterCount = [
    filterMachine !== "__all__",
    filterOperator !== "__all__",
    filterDate !== "",
  ].filter(Boolean).length;

  const clearTransactionFilters = () => {
    setFilterTransactionType("__all__");
    setFilterTransactionCategory("__all__");
    setFilterTransactionDate("");
    setFilterTransactionNF("");
  };

  const activeTransactionFilterCount = [
    filterTransactionType !== "__all__",
    filterTransactionCategory !== "__all__",
    filterTransactionDate !== "",
    filterTransactionNF !== "",
  ].filter(Boolean).length;

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Fuel className="hidden sm:block w-7 h-7 text-primary" />
            Controle de Diesel {(filteredRecords || filteredTransactions) && 
              <span className="text-muted-foreground/60 text-xl md:text-2xl">
                ({activeTab === "fuelings" ? filteredRecords.length : filteredTransactions.length})
              </span>
            }
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de abastecimentos e estoque de combustível.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Card className="flex-1 md:flex-none border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Estoque Atual</p>
                <p className="text-xl font-black font-mono leading-none">{fuelBalance.toLocaleString()} L</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="fuelings" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="fuelings" className="gap-2">
              <Fuel className="w-4 h-4" />
              Abastecimentos
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Movimentações
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === "fuelings" ? (
              <>
                <Button variant="outline" className="hidden md:flex h-10 px-4 gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="hidden md:flex h-10 px-4 gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs flex items-center justify-center">{activeFilterCount}</Badge>}
                </Button>
                <Dialog open={isFuelingDialogOpen} onOpenChange={setIsFuelingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="hidden md:flex h-10 px-5 gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Abastecimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>{editingRecord ? "Editar Abastecimento" : "Novo Abastecimento"}</DialogTitle></DialogHeader>
                    <FormContent {...fuelingFormProps} />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Button variant="outline" className="hidden md:flex h-10 px-4 gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
                <Button variant="outline" onClick={() => setShowTransactionFilters(!showTransactionFilters)} className="hidden md:flex h-10 px-4 gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {activeTransactionFilterCount > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs flex items-center justify-center">{activeTransactionFilterCount}</Badge>}
                </Button>
                <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="hidden md:flex h-10 px-5 gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Movimentação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>{_editingTransaction ? "Editar Movimentação" : "Nova Movimentação de Diesel"}</DialogTitle></DialogHeader>
                    <TransactionForm 
                      form={transactionForm} 
                      onSubmit={handleTransactionSubmit} 
                      onClose={closeForm}
                      isEditing={!!_editingTransaction}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {activeTab === "fuelings" && showFilters && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Máquina</label>
                  <Select value={filterMachine} onValueChange={setFilterMachine}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas as máquinas</SelectItem>
                      {machines.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Data</label>
                  <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Operador</label>
                  <Select value={filterOperator} onValueChange={setFilterOperator}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos os operadores</SelectItem>
                      {uniqueOperators.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3 mr-1" /> Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "inventory" && showTransactionFilters && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
                  <Select value={filterTransactionType} onValueChange={setFilterTransactionType}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas as movimentações</SelectItem>
                      <SelectItem value="entrada">Entradas</SelectItem>
                      <SelectItem value="saida">Saídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Categoria</label>
                  <Select value={filterTransactionCategory} onValueChange={setFilterTransactionCategory}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas as categorias</SelectItem>
                      {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Data</label>
                  <Input type="date" value={filterTransactionDate} onChange={e => setFilterTransactionDate(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Nota Fiscal</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Número da NF..." 
                      value={filterTransactionNF} 
                      onChange={e => setFilterTransactionNF(e.target.value)} 
                      className="h-9 pl-9" 
                    />
                  </div>
                </div>
              </div>
              {activeTransactionFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearTransactionFilters} className="text-xs text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3 mr-1" /> Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <TabsContent value="fuelings" className="mt-0">
          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Talhão</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Nenhum abastecimento encontrado.</TableCell></TableRow>
                ) : (
                  filteredRecords.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setViewingRecord(r); setIsFuelingDetailOpen(true); }}>
                      <TableCell className="font-medium whitespace-nowrap">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{r.machineName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.operatorName}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground uppercase font-bold">{r.responsavelName || "—"}</TableCell>
                      <TableCell className="text-sm font-semibold">{r.talhao}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getServiceBadgeStyle(r.servico as string)}`}>
                          {r.servico}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black font-mono text-primary">{r.liters} L</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditOpen(r, false)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { if(confirm("Excluir?")) deleteFuelingMutation.mutate({id: r.id}); }} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4" />
                                Excluir
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

          {/* Mobile view */}
          <div className="md:hidden space-y-3">
            <MobileListControls 
              onFilterClick={() => setShowFilters(v => !v)} 
              onExportClick={() => {}} 
              activeFilterCount={activeFilterCount} 
            />
            {filteredRecords.map(r => (
              <Card key={r.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setViewingRecord(r); setIsFuelingDetailOpen(true); }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(r.date), "dd/MM/yyyy")} · {r.talhao}</p>
                      <h3 className="font-bold text-lg leading-tight">{r.machineName}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black font-mono text-primary leading-none">{r.liters} L</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-y border-dashed">
                    <div className="flex flex-col">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Operador</p>
                      <p className="text-xs font-medium">{r.operatorName}</p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Serviço</p>
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getServiceBadgeStyle(r.servico as string)}`}>
                        {r.servico}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-dashed" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleEditOpen(r, true)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { if(confirm("Excluir?")) deleteFuelingMutation.mutate({id: r.id}); }} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-0">
          {/* Desktop View */}
          <div className="hidden md:block bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria / Descrição</TableHead>
                  <TableHead>Nota Fiscal</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow>
                ) : (
                  filteredTransactions.map(t => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setViewingTransaction(t); setIsTransactionDetailOpen(true); }}>
                      <TableCell className="font-medium">{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {t.type === "entrada" ? (
                          <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-emerald-200 gap-1.5"><ArrowDownLeft className="w-3 h-3" /> Entrada</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)] gap-1.5"><ArrowUpRight className="w-3 h-3" /> Saída</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{t.category}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-xs">{t.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {t.nfNumber ? (
                          <span className="font-mono text-sm">{t.nfNumber}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {t.type === "entrada" ? "+" : "-"}{t.liters} L
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {t.value > 0 ? `R$ ${t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                           <Button variant="ghost" size="icon" onClick={() => handleEditTransactionOpen(t, false)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                             <Pencil className="w-4 h-4" />
                           </Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                                 <MoreHorizontal className="w-4 h-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                               {t.nfNumber && (
                                 <DropdownMenuItem className="gap-2 cursor-pointer">
                                   <FileText className="w-4 h-4" />
                                   Ver NF
                                 </DropdownMenuItem>
                               )}
                               <DropdownMenuItem onClick={() => handleDeleteTransaction(t.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                                 <Trash2 className="w-4 h-4" />
                                 Excluir
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

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            <MobileListControls 
              onFilterClick={() => setShowTransactionFilters(v => !v)} 
              onExportClick={() => {}} 
              activeFilterCount={activeTransactionFilterCount} 
            />
            {filteredTransactions.length === 0 ? (
              <div className="text-center p-8 bg-card rounded-xl border text-muted-foreground shadow-sm">
                Nenhuma movimentação encontrada.
              </div>
            ) : (
              filteredTransactions.map(t => (
                <div 
                  key={t.id} 
                  className="bg-card rounded-xl border p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                  onClick={() => { setViewingTransaction(t); setIsTransactionDetailOpen(true); }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">
                        {format(new Date(t.date), "dd/MM/yyyy")}
                      </span>
                      <h4 className="font-bold text-foreground">{t.category}</h4>
                    </div>
                    {t.type === "entrada" ? (
                      <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-emerald-200 gap-1"><ArrowDownLeft className="w-3 h-3" /> Entrada</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)] gap-1"><ArrowUpRight className="w-3 h-3" /> Saída</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-foreground/80 line-clamp-1 border-b border-border/50 pb-3">
                    {t.description}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Nota Fiscal</span>
                      <span className="font-mono text-sm font-medium">{t.nfNumber || "—"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Volume</span>
                      <span className={`font-mono font-bold text-base ${t.type === "entrada" ? "text-[hsl(var(--success-text))]" : "text-[hsl(var(--warning-text))]"}`}>
                        {t.type === "entrada" ? "+" : "-"}{t.liters} L
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-dashed" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleEditTransactionOpen(t, true)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {t.nfNumber && (
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <FileText className="w-4 h-4" />
                            Ver NF
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteTransaction(t.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Botão FAB Mobile */}
      <div className="md:hidden">
        <Button
          onClick={() => {
            if (activeTab === "fuelings") {
              setEditingRecord(null);
              setIsSheetOpen(true);
            } else {
              setEditingTransaction(null);
              setIsTransactionSheetOpen(true);
            }
          }}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Sheet Mobile (Novo Abastecimento) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[2rem] p-6 pt-2">
          <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
          <SheetHeader className="mb-4">
            <SheetTitle>{editingRecord ? "Editar Abastecimento" : "Novo Abastecimento"}</SheetTitle>
          </SheetHeader>
          <div className="max-h-[70vh] overflow-y-auto pb-4">
            <FormContent {...fuelingFormProps} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet Mobile (Nova Movimentação) */}
      <Sheet open={isTransactionSheetOpen} onOpenChange={setIsTransactionSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[2rem] p-6 pt-2 max-h-[92vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
          <SheetHeader className="mb-4">
            <SheetTitle>{_editingTransaction ? "Editar Movimentação" : "Nova Movimentação de Diesel"}</SheetTitle>
          </SheetHeader>
          <div className="pb-4">
            <TransactionForm 
              form={transactionForm} 
              onSubmit={handleTransactionSubmit} 
              onClose={closeForm}
              isEditing={!!_editingTransaction}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Modais de Detalhe */}
      <Dialog open={isFuelingDetailOpen} onOpenChange={setIsFuelingDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Detalhes do Abastecimento</DialogTitle></DialogHeader>
          {viewingRecord && <FuelingDetailView record={viewingRecord} onClose={closeForm} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Detalhes da Movimentação</DialogTitle></DialogHeader>
          {viewingTransaction && <TransactionDetailView transaction={viewingTransaction} onClose={closeForm} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
