import { useMemo, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DEMO_HARVESTS, 
  DEMO_FUELINGS, 
  DEMO_TRANSPORTS, 
  DEMO_MACHINES,
  DEMO_MACHINE_REVENUES,
  DEMO_MACHINE_MAINTENANCES,
  DEMO_FINANCIAL_RECORDS,
  type MachineMaintenance,
} from "@/lib/demo-data";
import { 
  Tractor, 
  Box, 
  Fuel, 
  Map, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Truck, 
  ChevronRight, 
  MapPin,
  Wrench,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormContent, schema } from "./maquinas";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateMachine, useDeleteMachine, getListMachinesQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  LineChart, 
  Line 
} from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const chartConfig = {
  sacks: {
    label: "Sacos",
    color: "hsl(var(--primary))",
  },
  liters: {
    label: "Litros",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const STATUS_STYLES: Record<string, string> = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  manutencao: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const TYPE_LABELS: Record<string, string> = {
  trator: "Trator",
  colheitadeira: "Colheitadeira",
  caminhao: "Caminhão",
  equipamento: "Equipamento",
};

const maintenanceSchema = z.object({
  description: z.string().min(3, "Descrição obrigatória"),
  cost: z.coerce.number().min(0, "Custo inválido") as unknown as z.ZodNumber,
  date: z.string().min(1, "Data obrigatória"),
  type: z.enum(["preventiva", "corretiva"]),
  category: z.enum(["Peças", "Serviço", "Óleo/Lubrificantes", "Pneus", "Outros"]),
  providerName: z.string().optional(),
});

export default function MaquinaDetalhes() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const [localMaintenances, setLocalMaintenances] = useState<MachineMaintenance[]>(DEMO_MACHINE_MAINTENANCES);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isMaintenanceSheetOpen, setIsMaintenanceSheetOpen] = useState(false);

  const [isMachineDialogOpen, setIsMachineDialogOpen] = useState(false);
  const [isMachineSheetOpen, setIsMachineSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useUpdateMachine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMachinesQueryKey() });
        toast({ title: "Máquina atualizada com sucesso." });
        closeMachineForm();
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const deleteMutation = useDeleteMachine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMachinesQueryKey() });
        toast({ title: "Máquina excluída." });
        setLocation("/maquinas");
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const machineForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", model: "", type: "trator", location: "", status: "ativo", purchase_cost: 0 },
  });

  const openMachineEdit = () => {
    if (machine) {
      machineForm.reset({
        name: machine.name,
        model: machine.model,
        type: machine.type as any,
        location: machine.location,
        status: machine.status as any,
        purchase_cost: machine.purchase_cost as any,
      });
      if (window.innerWidth < 640) setIsMachineSheetOpen(true);
      else setIsMachineDialogOpen(true);
    }
  };

  const closeMachineForm = () => {
    setIsMachineDialogOpen(false);
    setIsMachineSheetOpen(false);
    machineForm.reset();
  };

  const onUpdateMachine = (data: z.infer<typeof schema>) => {
    updateMutation.mutate({ id: machine!.id, data });
  };

  const confirmMachineDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta máquina?")) {
      deleteMutation.mutate({ id: machine!.id });
    }
  };

  const maintenanceForm = useForm<z.infer<typeof maintenanceSchema>>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      description: "",
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      type: "preventiva",
      category: "Peças",
      providerName: "",
    },
  });

  const machine = useMemo(() => {
    return DEMO_MACHINES.find(m => m.id === Number(id));
  }, [id]);

  const onAddMaintenance = (data: z.infer<typeof maintenanceSchema>) => {
    const newMaintenance: MachineMaintenance = {
      id: Date.now(),
      machineId: machine!.id,
      ...data,
      createdAt: new Date().toISOString()
    };
    setLocalMaintenances(prev => [newMaintenance, ...prev]);
    setIsMaintenanceDialogOpen(false);
    setIsMaintenanceSheetOpen(false);
    maintenanceForm.reset();
    toast({
       title: "Manutenção Registrada",
       description: "A manutenção foi adicionada ao histórico da máquina com sucesso."
    });
  };

  const MaintenanceFormContent = (
    <Form {...maintenanceForm}>
      <form onSubmit={maintenanceForm.handleSubmit(onAddMaintenance)} className="space-y-4 pt-4">
        <FormField control={maintenanceForm.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição do Serviço/Peça</FormLabel><FormControl><Input placeholder="Ex: Troca de óleo" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={maintenanceForm.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={maintenanceForm.control} name="cost" render={({ field }) => (
            <FormItem><FormLabel>Custo Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={maintenanceForm.control} name="type" render={({ field }) => (
             <FormItem><FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="preventiva">Preventiva</SelectItem><SelectItem value="corretiva">Corretiva</SelectItem></SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
          <FormField control={maintenanceForm.control} name="category" render={({ field }) => (
             <FormItem><FormLabel>Categoria principal</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Peças">Peças</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                  <SelectItem value="Óleo/Lubrificantes">Óleo/Lubrificantes</SelectItem>
                  <SelectItem value="Pneus">Pneus</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={maintenanceForm.control} name="providerName" render={({ field }) => (
          <FormItem><FormLabel>Fornecedor/Oficina (Opcional)</FormLabel><FormControl><Input placeholder="Nome da oficina ou OS" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={() => { setIsMaintenanceDialogOpen(false); setIsMaintenanceSheetOpen(false); }}>Cancelar</Button>
          <Button type="submit">Salvar Manutenção</Button>
        </div>
      </form>
    </Form>
  );

  const stats = useMemo(() => {
    if (!machine) return null;

    let harvests = DEMO_HARVESTS.filter(h => h.machineId === machine.id);
    let fuelings = DEMO_FUELINGS.filter(f => f.machineId === machine.id);
    let transports = DEMO_TRANSPORTS.filter(t => t.machineId === machine.id);
    let revenues = DEMO_MACHINE_REVENUES.filter(r => r.machineId === machine.id);
    
    // Integração Etapa 9: Buscar despesas do financeiro vinculadas a esta máquina
    const financialMaintenances = DEMO_FINANCIAL_RECORDS
      .filter(r => r.machineId === machine.id && r.type === "despesa")
      .map(r => ({
        id: r.id,
        machineId: r.id,
        description: r.description,
        cost: r.value,
        date: r.date,
        type: (r.category === "Insumos" ? "corretiva" : "preventiva") as any,
        category: "Peças" as any,
        providerName: r.supplier,
        source: "Financeiro" as const
      }));

    let maintenances = [
      ...localMaintenances.filter(m => m.machineId === machine.id).map(m => ({ ...m, source: "Manual" as const })),
      ...financialMaintenances
    ];

    if (selectedMonth !== "all") {
      const monthIndex = parseInt(selectedMonth);
      harvests = harvests.filter(h => new Date(h.date).getMonth() === monthIndex);
      fuelings = fuelings.filter(f => new Date(f.date).getMonth() === monthIndex);
      transports = transports.filter(t => t.machineId === machine.id && new Date(t.date).getMonth() === monthIndex);
      revenues = revenues.filter(r => new Date(r.date).getMonth() === monthIndex);
      maintenances = maintenances.filter(m => new Date(m.date).getMonth() === monthIndex);
    }

    const totalSacks = harvests.reduce((acc: number, h: any) => acc + h.quantitySacks, 0);
    const totalArea = harvests.reduce((acc: number, h: any) => acc + h.areaHectares, 0);
    const totalLiters = fuelings.reduce((acc: number, f: any) => acc + f.volumeLiters, 0);
    const totalTons = transports.reduce((acc: number, t: any) => acc + t.cargoTons, 0);
    const avgProductivity = totalArea > 0 ? (totalSacks / totalArea).toFixed(1) : "0";

    const totalRevenue = revenues.reduce((acc: number, r: any) => acc + r.value, 0);
    const totalMaintenance = maintenances.reduce((acc: number, m: any) => acc + m.cost, 0);
    const operatingProfit = totalRevenue - totalMaintenance;

    const harvestChartData = harvests
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(h => ({
        date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        sacks: h.quantitySacks,
      }));

    const fuelingChartData = fuelings
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(f => ({
        date: new Date(f.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        liters: f.volumeLiters,
      }));

    return {
      totalSacks,
      totalArea,
      totalLiters,
      totalTons,
      avgProductivity,
      totalRevenue,
      totalMaintenance,
      operatingProfit,
      machineHarvests: harvests,
      machineFuelings: fuelings,
      machineTransports: transports,
      machineRevenues: revenues,
      machineMaintenances: maintenances,
      harvestChartData,
      fuelingChartData
    };
  }, [machine, selectedMonth, localMaintenances]);

  const getRevenueRedirect = (revenue: any) => {
    const desc = revenue.description.toLowerCase();
    if (desc.includes('colheita') || desc.includes('plantio')) return '/colheita';
    if (desc.includes('frete') || desc.includes('transporte')) return '/transporte';
    if (desc.includes('abastecimento')) return '/abastecimento';
    return '/maquinas';
  };

  if (!machine) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Máquina não encontrada</h2>
          <Button onClick={() => setLocation("/maquinas")}>Voltar para Máquinas</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={machine.name} showBack={true} backTo="/maquinas">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/maquinas" className="hover:text-primary transition-colors">Máquinas</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">{machine.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Tractor className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-display text-foreground leading-tight">{machine.name}</h1>
              <Badge variant="outline" className={cn("font-semibold", STATUS_STYLES[machine.status as string])}>
                {machine.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              {TYPE_LABELS[machine.type as string]} · {machine.model}
              {machine.location && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {machine.location}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden lg:flex mr-4">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Custo de Aquisição</span>
            <span className="text-xl font-bold text-[hsl(var(--success-text))]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(machine.purchase_cost || 0)}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openMachineEdit} className="h-9 px-4 border-border hover:bg-muted/40">
              <Pencil className="w-4 h-4 mr-2 text-muted-foreground" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={confirmMachineDelete} className="h-9 px-4 text-destructive border-destructive/20 hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openMachineEdit}><Pencil className="w-4 h-4 mr-2"/> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={confirmMachineDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="h-6 w-px bg-border mx-1 hidden md:block" />

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px] bg-card border">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="0">Janeiro</SelectItem>
              <SelectItem value="1">Fevereiro</SelectItem>
              <SelectItem value="2">Março</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Maio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards Grid - Operacional */}
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Indicadores Operacionais</h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { icon: Box, label: "Produção", value: stats?.totalSacks.toLocaleString(), unit: "sc" },
          { icon: Map, label: "Área", value: stats?.totalArea.toLocaleString(), unit: "ha" },
          { icon: Fuel, label: "Combustível", value: stats?.totalLiters.toLocaleString(), unit: "L" },
          { icon: Truck, label: "Transporte", value: stats?.totalTons.toLocaleString(), unit: "ton" },
          { icon: TrendingUp, label: "Rendimento", value: stats?.avgProductivity, unit: "sc/ha", primary: true },
        ].map((kpi, idx) => (
          <Card key={idx} className={cn("bg-card border", kpi.primary && "border-primary/20 bg-primary/[0.02]")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
                <kpi.icon className={cn("w-3.5 h-3.5", kpi.primary ? "text-primary" : "text-muted-foreground")} /> {kpi.label}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {kpi.value} <span className="text-xs font-normal text-muted-foreground uppercase ml-1 tracking-tight">{kpi.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPI Cards Grid - Financeiro */}
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 mt-6">Indicadores Financeiros</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--info-text))]" /> Receita Bruta / Valor Agregado
            </div>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-bold tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-[hsl(var(--warning-text))]" /> Custos de Manutenção
            </div>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalMaintenance || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className={cn("border-border", stats?.operatingProfit && stats.operatingProfit >= 0 ? "bg-[hsl(var(--success-subtle))] border-[hsl(var(--success)/0.2)]" : "bg-destructive/10 border-destructive/20")}>
          <CardContent className="p-5">
            <div className={cn("flex items-center gap-2 text-[10px] mb-2 uppercase font-bold tracking-wider", stats?.operatingProfit && stats.operatingProfit >= 0 ? "text-[hsl(var(--success-text))]" : "text-destructive")}>
              <DollarSign className="w-3.5 h-3.5" /> Lucro Operacional
            </div>
            <div className={cn("text-2xl font-bold", stats?.operatingProfit && stats.operatingProfit >= 0 ? "text-[hsl(var(--success-text))]" : "text-destructive")}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.operatingProfit || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 w-full justify-start gap-1 h-auto min-h-[44px] overflow-x-auto flex-nowrap hide-scrollbar">
          <TabsTrigger value="overview" className="px-6 py-2">Dashboard</TabsTrigger>
          <TabsTrigger value="harvests" className="px-6 py-2">Colheita</TabsTrigger>
          <TabsTrigger value="fuelings" className="px-6 py-2">Abastecimento</TabsTrigger>
          <TabsTrigger value="transports" className="px-6 py-2">Transporte</TabsTrigger>
          <TabsTrigger value="profits" className="px-6 py-2">Lucros/Receitas</TabsTrigger>
          <TabsTrigger value="maintenance" className="px-6 py-2">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Volume de Colheita por Operação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {stats?.harvestChartData.length ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <BarChart data={stats.harvestChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                        <RechartsTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="sacks" fill="var(--color-sacks)" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <BarChart3 className="w-8 h-8 opacity-20" />
                      <span className="text-sm italic font-medium">Sem dados de colheita no período</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-primary" /> Histórico de Consumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {stats?.fuelingChartData.length ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <LineChart data={stats.fuelingChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                        <RechartsTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="liters" stroke="var(--color-liters)" strokeWidth={3} dot={{ r: 5, fill: "white", strokeWidth: 3 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Fuel className="w-8 h-8 opacity-20" />
                      <span className="text-sm italic font-medium">Sem dados de abastecimento no período</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="harvests" className="space-y-4">
          {stats?.machineHarvests.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stats.machineHarvests.map((h: any) => (
                <Card key={h.id} className="bg-card border hover:border-primary/30 transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-bold text-foreground mb-1">{h.area}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(h.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] uppercase text-[9px] font-bold">
                        {h.culture}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                      <div>
                        <div className="text-[9px] uppercase text-muted-foreground font-black mb-1">Produção</div>
                        <div className="text-sm font-bold text-foreground">{h.quantitySacks} sc</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-muted-foreground font-black mb-1">Área</div>
                        <div className="text-sm font-bold text-foreground">{h.areaHectares} ha</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-muted-foreground font-black mb-1">Prod.</div>
                        <div className="text-sm font-bold text-primary">{h.productivity}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <Box className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum registro de colheita encontrado.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fuelings" className="space-y-4">
          {stats?.machineFuelings.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stats.machineFuelings.map((f: any) => (
                <Card key={f.id} className="bg-card border hover:border-primary/30 transition-all">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--warning-subtle))] flex items-center justify-center text-[hsl(var(--warning-text))] flex-shrink-0">
                      <Fuel className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="text-base font-bold text-foreground">{f.liters} Litros</div>
                        <div className="text-[11px] text-muted-foreground font-medium">{new Date(f.date).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Operador: <span className="text-foreground font-semibold">{f.operatorName}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <Fuel className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum registro de abastecimento encontrado.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transports" className="space-y-4">
          {stats?.machineTransports.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stats.machineTransports.map((t: any) => (
                <Card key={t.id} className="bg-card border hover:border-primary/30 transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{t.cargoTons} <span className="font-normal text-muted-foreground">ton</span></div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-muted text-muted-foreground font-bold text-[10px]">{t.truckPlate}</Badge>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Trajeto:</span>
                        <span className="font-bold text-foreground">{t.origin} → {t.destination}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Motorista:</span>
                        <span className="font-bold text-muted-foreground">{t.driverName}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <Truck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum transporte registrado para esta unidade.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profits" className="space-y-4">
          {stats?.machineRevenues.length ? (
            <>
              {/* Mobile View - Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {stats.machineRevenues.map((r: any) => (
                  <Card key={r.id} className="bg-card border hover:border-primary/30 transition-all cursor-pointer" onClick={() => setLocation(getRevenueRedirect(r))}>
                    <CardContent className="p-5 flex items-center gap-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", r.type === 'lucro' ? "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]" : "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))]")}>
                        <TrendingUp className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                           <span className={cn("font-bold text-lg", r.type === 'lucro' ? "text-[hsl(var(--success-text))]" : "text-[hsl(var(--info-text))]")}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.value)}</span>
                           <span className="text-[11px] text-muted-foreground pt-1">{new Date(r.date).toLocaleDateString('pt-BR')}</span>
                         </div>
                         <p className="text-sm text-muted-foreground font-medium mb-1">{r.description}</p>
                         <div className="flex gap-2 mt-2">
                           <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", r.type === 'lucro' ? "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]" : "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]")}>{r.type}</Badge>
                           <Badge variant="outline" className="text-[10px] bg-muted uppercase font-semibold text-muted-foreground">{r.source}</Badge>
                         </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block border border-border rounded-2xl bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="w-[120px] font-semibold text-muted-foreground">Data</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Descrição</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Tipo</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Origem</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.machineRevenues.map((r: any) => (
                      <TableRow key={r.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setLocation(getRevenueRedirect(r))}>
                        <TableCell className="font-medium text-muted-foreground">{new Date(r.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium text-foreground">{r.description}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", r.type === 'lucro' ? "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]" : "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]")}>{r.type}</Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="text-[10px] bg-muted uppercase font-semibold text-muted-foreground">{r.source}</Badge>
                        </TableCell>
                        <TableCell className={cn("text-right font-bold", r.type === 'lucro' ? "text-[hsl(var(--success-text))]" : "text-[hsl(var(--info-text))]")}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum registro de lucro encontrado.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Histórico de Manutenções</h3>
            <div className="hidden md:block">
              <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Manutenção</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Manutenção</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">{MaintenanceFormContent}</div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="md:hidden">
              <Sheet open={isMaintenanceSheetOpen} onOpenChange={setIsMaintenanceSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Manutenção</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
                  <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                  <SheetHeader className="text-left mb-4">
                    <SheetTitle className="text-lg">Registrar Manutenção</SheetTitle>
                  </SheetHeader>
                  <div className="pb-4 mt-2">
                    {MaintenanceFormContent}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {stats?.machineMaintenances.length ? (
            <>
              {/* Mobile View - Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {stats.machineMaintenances.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m: any) => (
                  <Card key={m.id} className="bg-card border hover:border-[hsl(var(--warning)/0.3)] transition-all">
                    <CardContent className="p-5 flex items-start gap-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", m.type === 'preventiva' ? "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))]" : "bg-destructive/10 text-destructive")}>
                        <Wrench className="w-6 h-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-1">
                           <span className="font-bold text-destructive text-lg truncate pr-2">- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.cost)}</span>
                           <span className="text-[11px] text-muted-foreground whitespace-nowrap pt-1">{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                         </div>
                         <p className="text-sm text-muted-foreground font-medium mb-3">{m.description}</p>
                         <div className="flex flex-wrap gap-2">
                           <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", m.type === 'preventiva' ? "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]" : "bg-destructive/10 text-destructive border-destructive/20")}>{m.type}</Badge>
                           <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">{m.category}</Badge>
                           <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", m.source === 'Financeiro' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground")}>{m.source}</Badge>
                         </div>
                         {m.providerName && <p className="text-xs text-muted-foreground font-medium mt-3 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {m.providerName}</p>}
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block border border-border rounded-2xl bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="w-[120px] font-semibold text-muted-foreground">Data</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Descrição do Serviço</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Tipo</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Classificação</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Origem</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Fornecedor / Oficina</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Custo Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.machineMaintenances.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m: any) => (
                      <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-muted-foreground">{new Date(m.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium text-foreground">{m.description}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", m.type === 'preventiva' ? "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]" : "bg-destructive/10 text-destructive border-destructive/20")}>{m.type}</Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">{m.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {m.providerName ? (
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {m.providerName}</div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-destructive">
                          - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
              <Wrench className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Sem registros de manutenção no período.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={isMachineSheetOpen} onOpenChange={setIsMachineSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl sm:hidden">
          <SheetHeader><SheetTitle>Editar Máquina</SheetTitle></SheetHeader>
          <div className="mt-4"><FormContent form={machineForm} onSubmit={onUpdateMachine} isPending={updateMutation.isPending} onClose={closeMachineForm} isEditing={true} /></div>
        </SheetContent>
      </Sheet>

      <Dialog open={isMachineDialogOpen} onOpenChange={setIsMachineDialogOpen}>
        <DialogContent className="sm:max-w-[400px] hidden sm:block">
          <DialogHeader><DialogTitle>Editar Máquina</DialogTitle></DialogHeader>
          <FormContent form={machineForm} onSubmit={onUpdateMachine} isPending={updateMutation.isPending} onClose={closeMachineForm} isEditing={true} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
