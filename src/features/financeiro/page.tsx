import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  DEMO_FINANCIAL_RECORDS, 
  DEMO_BANK_ACCOUNTS, 
  DEMO_MACHINES,
  type FinancialRecord,
  type BankAccount
} from "@/lib/demo-data";
import { BRAZILIAN_BANKS, getBankLogoUrl, type BrazilianBank } from "@/lib/brazilian-banks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Search,
  Copy,
  Printer,
  ChevronsUpDown,
  Check,
  Landmark
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MobileListControls } from "@/components/ui/MobileListControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarm } from "@/contexts/FarmContext";
import { cn } from "@/lib/utils";

const ALL = "all";

function BankLogo({ account, size = 40 }: { account: Pick<BankAccount, 'icon' | 'logoUrl' | 'color'>; size?: number }) {
  const [imgError, setImgError] = useState(false);
  
  if (account.logoUrl && !imgError) {
    return (
      <div 
        className="rounded-xl bg-card border flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img 
          src={account.logoUrl} 
          alt={account.icon}
          className="w-6 h-6 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  
  return (
    <div 
      className="rounded-xl border flex items-center justify-center font-bold text-[10px] uppercase overflow-hidden"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: account.color ? `${account.color}15` : undefined,
        color: account.color || 'hsl(var(--primary))',
        borderColor: account.color ? `${account.color}30` : undefined,
      }}
    >
      {account.icon?.slice(0, 3)}
    </div>
  );
}

function AddBankAccountContent({ onAdd, onClose }: { onAdd: (bank: BankAccount) => void; onClose: () => void }) {
  const [selectedBank, setSelectedBank] = useState<BrazilianBank | null>(null);
  const [customName, setCustomName] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (bank: BrazilianBank) => {
    setSelectedBank(bank);
    setCustomName(bank.name);
    setComboboxOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) return;

    const newAccount: BankAccount = {
      id: Date.now(),
      name: customName || selectedBank.name,
      icon: selectedBank.abbr,
      bankCode: selectedBank.code,
      logoUrl: selectedBank.domain ? getBankLogoUrl(selectedBank.domain) : undefined,
      color: selectedBank.color,
    };
    onAdd(newAccount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      {/* Bank Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Selecione o Banco</label>
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={comboboxOpen}
              className="w-full justify-between h-12 rounded-xl text-left font-normal"
            >
              {selectedBank ? (
                <div className="flex items-center gap-3">
                  {selectedBank.domain ? (
                    <img 
                      src={getBankLogoUrl(selectedBank.domain)} 
                      alt={selectedBank.abbr}
                      className="w-5 h-5 rounded-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div 
                      className="w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: selectedBank.color }}
                    >
                      {selectedBank.abbr.slice(0, 2)}
                    </div>
                  )}
                  <span>{selectedBank.name}</span>
                  <Badge variant="outline" className="text-[9px] ml-auto">{selectedBank.code}</Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">Buscar banco...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
            <Command>
              <CommandInput 
                placeholder="Buscar por nome ou código..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList className="max-h-[250px]">
                <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
                <CommandGroup>
                  {BRAZILIAN_BANKS.map((bank) => (
                    <CommandItem
                      key={bank.code}
                      value={`${bank.name} ${bank.code} ${bank.abbr}`}
                      onSelect={() => handleSelect(bank)}
                      className="cursor-pointer py-2.5"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {bank.domain ? (
                          <img 
                            src={getBankLogoUrl(bank.domain)} 
                            alt={bank.abbr}
                            className="w-5 h-5 rounded-sm shrink-0"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div 
                          className={cn("w-5 h-5 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shrink-0", bank.domain ? "hidden" : "")}
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.abbr.slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium truncate">{bank.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{bank.code}</span>
                      </div>
                      <Check className={cn("ml-2 h-4 w-4 shrink-0", selectedBank?.code === bank.code ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Bank Preview */}
      {selectedBank && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted">
          {selectedBank.domain ? (
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border"
              style={{ borderColor: `${selectedBank.color}30` }}
            >
              <img 
                src={getBankLogoUrl(selectedBank.domain)} 
                alt={selectedBank.abbr}
                className="w-7 h-7 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white border"
              style={{ backgroundColor: selectedBank.color }}
            >
              {selectedBank.abbr}
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-foreground">{selectedBank.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Código COMPE: {selectedBank.code}
            </p>
          </div>
        </div>
      )}

      {/* Account Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Conta</label>
        <Input
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Ex: Banco do Brasil - Conta PJ"
          className="h-11 rounded-xl"
          disabled={!selectedBank}
        />
        <p className="text-[10px] text-muted-foreground">
          Personalize o nome para identificar a conta mais facilmente.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
          Cancelar
        </Button>
        <Button type="submit" disabled={!selectedBank} className="flex-1 rounded-xl gap-2">
          <Landmark className="w-4 h-4" />
          Adicionar Conta
        </Button>
      </div>
    </form>
  );
}

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
  dueDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  machineId: z.coerce.number().optional().or(z.literal(0)),
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
            <FormItem><FormLabel>Data do Lançamento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dueDate" render={({ field }) => (
            <FormItem><FormLabel>Data de Vencimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0,00" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="paymentMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Débito Automático">Débito Automático</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
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
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o talhão" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="0">Nenhum</SelectItem>
                  {talhoes.map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="machineId" render={({ field }) => (
            <FormItem>
              <FormLabel>Máquina (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : "0"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a máquina" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="0">Nenhuma</SelectItem>
                  {DEMO_MACHINES.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="supplier" render={({ field }) => (
            <FormItem><FormLabel>Fornecedor / Cliente</FormLabel><FormControl><Input placeholder="Ex: Cooperativa X" {...field} /></FormControl><FormMessage /></FormItem>
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
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(DEMO_BANK_ACCOUNTS);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);

  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  
  const closeBankForm = useCallback(() => {
    setIsBankDialogOpen(false);
    setIsBankSheetOpen(false);
  }, []);

  const handleAddBank = useCallback((newAccount: BankAccount) => {
    setBankAccounts(prev => [...prev, newAccount]);
    closeBankForm();
    toast({ title: "Conta adicionada!", description: `${newAccount.name} foi adicionada com sucesso.` });
  }, [closeBankForm, toast]);

  const handleDeleteBank = useCallback((id: number) => {
    const hasRecords = records.some(r => r.bankAccountId === id);
    if (hasRecords) {
      toast({ title: "Não é possível excluir", description: "Esta conta possui lançamentos vinculados.", variant: "destructive" });
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta conta bancária?")) {
      setBankAccounts(prev => prev.filter(a => a.id !== id));
      toast({ title: "Conta excluída." });
    }
  }, [records, toast]);
  
  const [activeTab, setActiveTab] = useState("movimentacoes");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBank, setFilterBank] = useState<string>("all");
  const [filterSupplier, setFilterSupplier] = useState<string>(ALL);
  const [filterMonth, setFilterMonth] = useState<string>(ALL);
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
      dueDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      machineId: 0,
      safraId: selectedSafraId || 0,
      talhaoId: selectedTalhaoId || 0,
      supplier: "",
      nfNumber: "",
    },
  });

  const uniqueSuppliers = useMemo(() => [...new Set(records?.map(r => r.supplier))].filter(Boolean).sort(), [records]);
  const uniqueMonths = useMemo(() => {
    const dates = records?.map(r => r.dueDate || r.date).filter(Boolean);
    const months = dates?.map(d => format(new Date(d), "MMMM", { locale: ptBR }));
    return [...new Set(months)].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Filtros de Contexto (FarmContext)
      if (selectedSafraId && r.safraId && r.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && r.talhaoId && r.talhaoId !== selectedTalhaoId) return false;

      // Filtros da Interface
      if (filterType !== "all" && r.type !== filterType) return false;
      if (filterBank !== "all" && r.bankAccountId !== Number(filterBank)) return false;
      if (filterSupplier !== ALL && r.supplier !== filterSupplier) return false;
      if (filterMonth !== ALL) {
        const m = format(new Date(r.dueDate || r.date), "MMMM", { locale: ptBR });
        if (m !== filterMonth) return false;
      }
      
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
  }, [records, filterType, filterBank, filterSupplier, filterMonth, search, selectedSafraId, selectedTalhaoId]);

  const activeFilterCount = [
    filterType !== "all",
    filterBank !== "all",
    filterSupplier !== ALL,
    filterMonth !== ALL,
  ].filter(Boolean).length;

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
      machineId: record.machineId || 0,
      supplier: record.supplier || "",
      nfNumber: record.nfNumber || "",
      dueDate: record.dueDate || record.date,
      paymentMethod: record.paymentMethod || ""
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const bankAccount = bankAccounts.find(a => a.id === Number(values.bankAccountId));
    
    const isStockIntegrated = values.type === "despesa" && 
                             (values.category === "Insumos" || values.category === "Combustível") && 
                             values.status === "pago";

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { 
        ...r, 
        ...values, 
        bankAccountName: bankAccount?.name || r.bankAccountName 
      } : r));
      toast({ 
        title: "Lançamento atualizado!",
        description: isStockIntegrated ? "As alterações foram refletidas no estoque." : undefined
      });
    } else {
      const newRecord: FinancialRecord = {
        id: Math.max(...records.map(r => r.id), 0) + 1,
        ...values,
        bankAccountName: bankAccount?.name || "Desconhecida",
        createdAt: new Date().toISOString(),
      };
      setRecords([newRecord, ...records]);
      toast({ 
        title: "Lançamento registrado!", 
        description: isStockIntegrated ? "Entrada de estoque processada automaticamente." : undefined 
      });
    }
    closeForm();
  };

  const handleDuplicate = (record: FinancialRecord, isMobile: boolean) => {
    const { id, createdAt, ...dataToCopy } = record;
    setEditingRecord(null); // It's a new record
    form.reset({
      ...dataToCopy,
      date: new Date().toISOString().split("T")[0],
      status: "aberto"
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: "Lançamento excluído." });
    }
  };

  const handleExport = () => {
    const rows = filteredRecords.map(r => [
      format(new Date(r.date), "dd/MM/yyyy"),
      r.type,
      r.category,
      r.description,
      r.supplier || "",
      r.value.toFixed(2),
      r.status,
      r.bankAccountName,
      r.dueDate ? format(new Date(r.dueDate), "dd/MM/yyyy") : "",
      r.paymentMethod || "",
      r.nfNumber || ""
    ]);

    const csvContent = [
      ["Data", "Tipo", "Categoria", "Descricao", "Fornecedor", "Valor", "Status", "Conta", "Vencimento", "Forma Pagamento", "NF"].join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `financeiro-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportação concluída!" });
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
          
          <div className="flex items-center gap-2 w-full sm:w-auto no-print">
            <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 text-primary">
              <Printer className="w-4 h-4" /> Imprimir PDF
            </Button>
            <Button variant="outline" onClick={handleExport} className="hidden sm:flex h-10 px-4 gap-2 rounded-xl">
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeForm()}>
              <DialogTrigger asChild>
                <Button className="hidden sm:flex h-10 px-5 gap-2 rounded-xl">
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
          <Card className="rounded-2xl border bg-[hsl(var(--success-subtle))]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--success)/0.1)] flex items-center justify-center text-[hsl(var(--success-text))]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[hsl(var(--success-text))] uppercase tracking-wider">Receitas Pagas</p>
                <p className="text-xl font-black text-[hsl(var(--success-text))]">R$ {totals.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {totals.pendenteReceita > 0 && (
                  <p className="text-[10px] text-[hsl(var(--success-text))] font-medium">R$ {totals.pendenteReceita.toLocaleString()} pendente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-destructive uppercase tracking-wider">Despesas Pagas</p>
                <p className="text-xl font-black text-destructive">R$ {totals.despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {totals.pendenteDespesa > 0 && (
                  <p className="text-[10px] text-destructive font-medium">R$ {totals.pendenteDespesa.toLocaleString()} pendente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl border ${totals.saldo >= 0 ? 'bg-primary/5' : 'bg-[hsl(var(--warning-subtle))]'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${totals.saldo >= 0 ? 'bg-primary/10 text-primary' : 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning-text))]'}`}>
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${totals.saldo >= 0 ? 'text-primary' : 'text-[hsl(var(--warning-text))]'}`}>Saldo em Caixa</p>
                <p className={`text-xl font-black ${totals.saldo >= 0 ? 'text-primary' : 'text-[hsl(var(--warning-text))]'}`}>R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
          <Card className="mb-4 rounded-2xl border-muted bg-muted/30">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo de Registro</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-9 bg-card border-none transition-all"> <SelectValue /> </SelectTrigger>
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
                  <SelectTrigger className="h-9 bg-card border-none transition-all"> <SelectValue /> </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {bankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Fornecedor / Cliente</label>
                <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                  <SelectTrigger className="h-9 bg-card border-none transition-all"> <SelectValue /> </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todos</SelectItem>
                    {uniqueSuppliers.map(s => (
                      <SelectItem key={s!} value={s!}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Mês de Vencimento</label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="h-9 bg-card border-none transition-all"> <SelectValue /> </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todos os meses</SelectItem>
                    {uniqueMonths.map(m => (
                      <SelectItem key={m!} value={m!} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" onClick={() => {setFilterType("all"); setFilterBank("all"); setFilterSupplier(ALL); setFilterMonth(ALL); setSearch("");}} className="h-9 text-xs text-muted-foreground gap-2">
                  <X className="w-3 h-3" /> Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="movimentacoes" className="mt-0">
          {/* Desktop Table */}
          <div className="hidden sm:block bg-card rounded-2xl border border-muted overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status / Conta</TableHead>
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] h-4 font-semibold bg-muted text-muted-foreground border-border uppercase">
                              {r.category}
                            </Badge>
                            {r.supplier && <span className="text-[10px] text-muted-foreground truncate uppercase">{r.supplier}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.dueDate ? format(new Date(r.dueDate), "dd/MM/yy") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {r.status === "pago" ? (
                            <Badge variant="outline" className="text-[9px] h-4 font-bold uppercase bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] w-fit">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Pago
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] h-4 font-bold uppercase bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)] w-fit">
                              <Clock className="w-2.5 h-2.5 mr-1" /> Aberto
                            </Badge>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Building2 className="w-2.5 h-2.5" /> {r.bankAccountName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-black font-mono ${r.type === 'receita' ? 'text-[hsl(var(--success-text))]' : 'text-destructive'}`}>
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
                              <DropdownMenuItem onClick={() => handleEdit(r, false)} className="gap-2 focus:bg-muted cursor-pointer font-medium">
                                <Pencil className="w-4 h-4 cursor-pointer" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(r, false)} className="gap-2 focus:bg-muted cursor-pointer font-medium">
                                <Copy className="w-4 h-4 cursor-pointer" /> Duplicar
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
              onExportClick={handleExport}
              activeFilterCount={ activeFilterCount }
            />
            
            {filteredRecords.map((r) => (
              <div 
                key={r.id} 
                className="p-4 bg-card rounded-2xl border border-muted touch-card active:scale-[0.98] transition-transform"
                onClick={() => handleEdit(r, true)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold ${r.status === 'pago' ? 'bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]' : 'bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]'}`}>
                        {r.status}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(r.date), "dd/MM/yyyy")}</span>
                    </div>
                    <p className="font-bold text-foreground leading-tight truncate max-w-[200px]">{r.description}</p>
                    {(r.dueDate || r.paymentMethod) && (
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-medium text-muted-foreground/80">
                        {r.dueDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[hsl(var(--warning-text))]" /> Venc: {format(new Date(r.dueDate), "dd/MM/yy")}</span>}
                        {r.paymentMethod && <span className="flex items-center gap-1 underline decoration-primary/30 underline-offset-2">{r.paymentMethod}</span>}
                      </div>
                    )}
                  </div>
                  <div className={`text-right font-black ${r.type === 'receita' ? 'text-[hsl(var(--success-text))]' : 'text-destructive'}`}>
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
          <div className="flex justify-end mb-4">
            {/* Desktop: Nova Conta Button */}
            <Dialog open={isBankDialogOpen} onOpenChange={(open) => !open && closeBankForm()}>
              <DialogTrigger asChild>
                <Button 
                  className="hidden sm:flex h-10 px-5 gap-2 rounded-xl"
                  onClick={() => setIsBankDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" /> Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Conta Bancária</DialogTitle>
                </DialogHeader>
                <AddBankAccountContent onAdd={handleAddBank} onClose={closeBankForm} />
              </DialogContent>
            </Dialog>

            {/* Mobile: Nova Conta Button */}
            <Button 
              className="sm:hidden h-10 px-5 gap-2 rounded-xl"
              onClick={() => setIsBankSheetOpen(true)}
            >
              <Plus className="w-4 h-4" /> Nova Conta
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map(acc => {
              const balance = records
                .filter(r => r.bankAccountId === acc.id && r.status === "pago")
                .reduce((acc, r) => r.type === 'receita' ? acc + r.value : acc - r.value, 0);
              
              const pendente = records
                .filter(r => r.bankAccountId === acc.id && r.status === "aberto")
                .reduce((acc, r) => r.type === 'receita' ? acc + r.value : acc - r.value, 0);

              return (
                <Card key={acc.id} className="rounded-2xl border-muted hover:border-primary/30 transition-colors">
                  <CardHeader className="p-4 pb-2 border-b border-muted/40 bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <BankLogo account={acc} />
                        <div>
                          <CardTitle className="text-sm font-bold">{acc.name}</CardTitle>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Conta Corrente</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreHorizontal className="w-4 h-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                            <Search className="w-3.5 h-3.5" /> Extrato Detalhado
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" /> Editar Conta
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                            onClick={() => handleDeleteBank(acc.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir Conta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Saldo Confirmado</span>
                      <span className={`text-lg font-black font-mono ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {pendente !== 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-dashed">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Previsto / Pendente</span>
                        <span className={`text-xs font-bold font-mono ${pendente >= 0 ? 'text-[hsl(var(--success-text))]' : 'text-[hsl(var(--warning-text))]'}`}>
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
              className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
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

        {/* Mobile Bank Account Sheet */}
        <Sheet open={isBankSheetOpen} onOpenChange={(open) => !open && closeBankForm()}>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 h-[85vh] max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl font-bold">Adicionar Conta Bancária</SheetTitle>
            </SheetHeader>
            <AddBankAccountContent onAdd={handleAddBank} onClose={closeBankForm} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
