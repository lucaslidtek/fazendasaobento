import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListFueling, useCreateFueling, useDeleteFueling, useUpdateFueling, getListFuelingQueryKey, useListMachines, useListUsers } from "@workspace/api-client-react";
import { DEMO_FUELINGS, DEMO_MACHINES, DEMO_DIESEL_MOVEMENTS, DEMO_USERS, type FuelingRecord, type DieselTransaction } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Fuel, Loader2, Droplets, Pencil, Trash2, Filter, X, ArrowUpRight, ArrowDownLeft, FileText, Search, Download, MoreHorizontal, Printer, Package } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { getServiceBadgeStyle } from "@/lib/colors";
import { useFarm } from "@/contexts/FarmContext";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="machineId" render={({ field }) => (
            <FormItem><FormLabel>Máquina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a máquina" /></SelectTrigger></FormControl>
                <SelectContent>
                  {machines?.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="operatorName" render={({ field }) => (
            <FormItem><FormLabel>Operador</FormLabel><FormControl><Input placeholder="Nome completo do operador" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="responsavelId" render={({ field }) => (
            <FormItem><FormLabel>Responsável Lançamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger></FormControl>
                <SelectContent>
                  {users?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="talhao" render={({ field }) => (
            <FormItem><FormLabel>Talhão</FormLabel><FormControl><Input placeholder="Ex: Talhão A1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="servico" render={({ field }) => (
            <FormItem><FormLabel>Serviço</FormLabel><FormControl><Input placeholder="Ex: Colheita" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="liters" render={({ field }) => (
          <FormItem><FormLabel>Volume (Litros)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 150" {...field} /></FormControl><FormMessage /></FormItem>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem><FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo de transação" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (Compra)</SelectItem>
                  <SelectItem value="saida">Saída (Ajuste/Extra)</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Compra Posto" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="liters" render={({ field }) => (
            <FormItem><FormLabel>Litragem</FormLabel><FormControl><Input type="number" placeholder="Ex: 5000" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem><FormLabel>Valor Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 25000.00" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="nfNumber" render={({ field }) => (
            <FormItem><FormLabel>Nº Nota Fiscal</FormLabel><FormControl><Input placeholder="Ex: NF-12345" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Anexo da NF</label>
          <div className="flex items-center gap-3 p-3 border border-dashed rounded-xl bg-muted/30">
            <div className="p-2 bg-background rounded-xl border">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-hidden text-ellipsis">
              <p className="text-xs font-medium">Nenhum arquivo selecionado</p>
              <p className="text-[10px] text-muted-foreground italic truncate">PDF ou Imagem (Máx 5MB)</p>
            </div>
            <Button type="button" variant="secondary" size="sm" className="h-8 rounded-lg">Anexar</Button>
          </div>
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição/Observações</FormLabel><FormControl><Input placeholder="Detalhes adicionais da movimentação" {...field} /></FormControl><FormMessage /></FormItem>
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
          <p className="font-medium text-[10px] text-muted-foreground uppercase font-bold">{record.responsavelName || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Talhão</p>
          <p className="font-medium">{record.talhaoName || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Serviço</p>
          <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getServiceBadgeStyle(record.fuelType as string)}`}>
            {record.fuelType || "Diesel"}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Volume</p>
          <p className="font-bold text-primary text-xl font-mono">{record.volumeLiters} L</p>
        </div>
      </div>
      {record.notes && (
        <div className="pt-4 border-t border-dashed">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Observações</p>
          <div className="bg-muted/30 p-3 rounded-xl text-sm italic">{record.notes}</div>
        </div>
      )}
      <div className="flex justify-end pt-4 no-print">
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
          <div className={`p-2 rounded-full ${transaction.type === 'entrada' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {transaction.type === 'entrada' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div>
             <p className="text-sm font-bold">{transaction.category}</p>
             <p className="text-[10px] text-muted-foreground uppercase">{transaction.type === 'entrada' ? 'Compra de Combustível' : 'Movimentação Extra'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-black font-mono ${transaction.type === 'entrada' ? 'text-success' : 'text-warning'}`}>
             {transaction.type === 'entrada' ? '+' : '-'}{transaction.volume} L
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Valor: R$ {transaction.value?.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-2">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Data</p>
          <p className="font-medium">{format(new Date(transaction.date), "dd/MM/yyyy")}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Nota Fiscal</p>
          <p className="font-medium font-mono">{transaction.nfNumber || "—"}</p>
        </div>
      </div>

      <div className="px-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Descrição</p>
        <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-xl min-h-[60px] italic">{transaction.description || "—"}</p>
      </div>

      {transaction.nfNumber && (
        <div className="mx-2 p-4 border border-dashed rounded-xl flex items-center justify-between gap-4 group hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Nota Fiscal Digitalizada</p>
              <p className="text-[10px] text-muted-foreground uppercase">PDF · 1.2 MB</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity no-print">Visualizar</Button>
        </div>
      )}

      <div className="flex justify-end pt-4 no-print">
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
  const [editingTransaction, setEditingTransaction] = useState<DieselTransaction | null>(null);
  const [viewingRecord, setViewingRecord] = useState<FuelingRecord | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<DieselTransaction | null>(null);
  const [activeTab, setActiveTab] = useState("fuelings");

  const { selectedSafraId, selectedTalhaoId } = useFarm();

  // Filtros Abastecimentos
  const [filterMachine, setFilterMachine] = useState("__all__");
  const [filterOperator, setFilterOperator] = useState("__all__");
  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("__all__");
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
  
  const [transactions, setTransactions] = useState<DieselTransaction[]>(DEMO_DIESEL_MOVEMENTS);
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

  const uniqueServices = useMemo(() => {
    const svcs = new Set(records.map(r => r.fuelType).filter(Boolean));
    return Array.from(svcs).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedSafraId && r.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && r.talhaoId !== selectedTalhaoId) return false;

      if (filterMachine !== "__all__" && r.machineId !== Number(filterMachine)) return false;
      if (filterOperator !== "__all__" && r.operatorName !== filterOperator) return false;
      if (filterDate && r.date !== filterDate) return false;
      if (filterService !== "__all__" && r.fuelType !== filterService) return false;
      return true;
    });
  }, [records, filterMachine, filterOperator, filterDate, filterService, selectedSafraId, selectedTalhaoId]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Movimentações são globais da fazenda na simulação
      if (filterTransactionType !== "__all__" && t.type !== filterTransactionType) return false;
      if (filterTransactionCategory !== "__all__" && t.category !== filterTransactionCategory) return false;
      if (filterTransactionDate && t.date !== filterTransactionDate) return false;
      if (filterTransactionNF && !t.nfNumber?.toLowerCase().includes(filterTransactionNF.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterTransactionType, filterTransactionCategory, filterTransactionDate, filterTransactionNF]);

  const fuelBalance = useMemo(() => {
    const totalIn = transactions.reduce((acc, t) => t.type === "entrada" ? acc + (t.volume || 0) : acc, 0);
    const totalOutTransactions = transactions.reduce((acc, t) => t.type === "saida" ? acc + (t.volume || 0) : acc, 0);
    const totalOutFuelings = records.reduce((acc, r) => acc + (r.volumeLiters || 0), 0);
    return totalIn - totalOutTransactions - totalOutFuelings;
  }, [transactions, records]);

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
    transactionForm.reset();
  };

  const handleFuelingSubmit = (data: any) => {
    if (editingRecord) updateFuelingMutation.mutate({ id: editingRecord.id, data });
    else createFuelingMutation.mutate({ data });
  };

  const handleTransactionSubmit = (data: any) => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, ...data, volume: data.liters } : t));
      toast({ title: "Movimentação atualizada." });
    } else {
      const newTransaction: DieselTransaction = {
        ...data,
        volume: data.liters,
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
      liters: transaction.volume,
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
      talhao: record.talhaoName || "",
      servico: record.fuelType || "",
      responsavelId: record.responsavelId || 0,
      liters: record.volumeLiters,
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
    setFilterService("__all__");
  };

  const activeFilterCount = [
    filterMachine !== "__all__",
    filterOperator !== "__all__",
    filterDate !== "",
    filterService !== "__all__",
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight flex items-center gap-3">
            <Fuel className="hidden sm:block w-7 h-7 text-primary" />
            Controle de Diesel
            <span className="text-muted-foreground/60 text-xl md:text-2xl">
                ({activeTab === "fuelings" ? filteredRecords.length : filteredTransactions.length})
            </span>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
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
                <Button variant="outline" onClick={() => window.print()} className="hidden md:flex h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl overflow-hidden">
                  <Printer className="w-4 h-4" />
                  Imprimir PDF
                </Button>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="hidden md:flex h-10 px-4 gap-2 rounded-xl">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{activeFilterCount}</Badge>}
                </Button>
                <Dialog open={isFuelingDialogOpen} onOpenChange={setIsFuelingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="hidden md:flex h-10 px-5 gap-2 rounded-xl">
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
                <Button variant="outline" onClick={() => window.print()} className="hidden md:flex h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl overflow-hidden">
                  <Printer className="w-4 h-4" />
                  Imprimir PDF
                </Button>
                <Button variant="outline" onClick={() => setShowTransactionFilters(!showTransactionFilters)} className="hidden md:flex h-10 px-4 gap-2 rounded-xl">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {activeTransactionFilterCount > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{activeTransactionFilterCount}</Badge>}
                </Button>
                <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="hidden md:flex h-10 px-5 gap-2 rounded-xl">
                      <Plus className="w-4 h-4" />
                      Nova Movimentação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>{editingTransaction ? "Editar Movimentação" : "Nova Movimentação de Diesel"}</DialogTitle></DialogHeader>
                    <TransactionForm 
                      form={transactionForm} 
                      onSubmit={handleTransactionSubmit} 
                      onClose={closeForm}
                      isEditing={!!editingTransaction}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {activeTab === "fuelings" && showFilters && (
          <Card className="border bg-card no-print">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Serviço</label>
                  <Select value={filterService} onValueChange={setFilterService}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos os serviços</SelectItem>
                      {uniqueServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          <Card className="border bg-card no-print">
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
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Talhão</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="w-[120px] no-print"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Nenhum abastecimento encontrado.</TableCell></TableRow>
                ) : (
                  filteredRecords.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setViewingRecord(r); setIsFuelingDetailOpen(true); }}>
                      <TableCell className="font-medium whitespace-nowrap">{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell><div className="flex flex-col"><span className="font-bold">{r.machineName}</span></div></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground uppercase font-bold">{r.operatorName || "—"}</TableCell>
                      <TableCell className="text-sm font-semibold">{r.talhaoName || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getServiceBadgeStyle(r.fuelType as string)}`}>
                          {r.fuelType || "Diesel"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-black font-mono text-primary">{r.volumeLiters} L</span>
                          <Badge variant="outline" className="text-[9px] h-4 font-bold bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)] gap-0.5">
                            <Package className="w-2.5 h-2.5" /> Estoque ↓
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="no-print">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditOpen(r, false)} className="rounded-full w-8 h-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { if(confirm("Excluir?")) deleteFuelingMutation.mutate({id: r.id}); }} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
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
        </TabsContent>

        <TabsContent value="inventory" className="mt-0">
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Nota Fiscal</TableHead>
                  <TableHead>Lançamento Por</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="w-[120px] no-print"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow>
                ) : (
                  filteredTransactions.map(t => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setViewingTransaction(t); setIsTransactionDetailOpen(true); }}>
                      <TableCell className="font-medium whitespace-nowrap">{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`uppercase text-[10px] tracking-wider border-none ${
                            t.type === 'entrada' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]' : 'bg-[hsl(var(--destructive-subtle))] text-[hsl(var(--destructive-text))]'
                          }`}>
                            {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                          <span className="font-bold">{t.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] uppercase">{t.nfNumber || "—"}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground uppercase font-bold">{t.responsible || "—"}</TableCell>
                      <TableCell className={`text-right font-black font-mono ${t.type === 'entrada' ? 'text-success' : 'text-warning'}`}>
                        {t.type === 'entrada' ? '+' : '-'}{t.volume} L
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="no-print">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTransactionOpen(t, false)} className="rounded-full w-8 h-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteTransaction(t.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
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
        </TabsContent>
      </Tabs>

      {/* Detail Dialogs */}
      <Dialog open={isFuelingDetailOpen} onOpenChange={setIsFuelingDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2">Detalhes do Abastecimento <Printer className="w-4 h-4 text-muted-foreground no-print" /></DialogTitle></DialogHeader>
          {viewingRecord && <FuelingDetailView record={viewingRecord} onClose={closeForm} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2">Detalhes da Transação <Printer className="w-4 h-4 text-muted-foreground no-print" /></DialogTitle></DialogHeader>
          {viewingTransaction && <TransactionDetailView transaction={viewingTransaction} onClose={closeForm} />}
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
