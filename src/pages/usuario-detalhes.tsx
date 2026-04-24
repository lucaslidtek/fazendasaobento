import { useMemo, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { format } from "date-fns";
import { getCultureBadgeStyle, getServiceBadgeStyle } from "@/lib/colors";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { schema, FormContent } from "./usuarios";
import { usersStore } from "@/lib/users-store";
import { useUsersStore } from "@/hooks/use-users-store";
import { 
  DEMO_HARVESTS, 
  DEMO_TRANSPORTS, 
  DEMO_FUELINGS 
} from "@/lib/demo-data";
import { 
  UserCircle2, 
  ChevronRight,
  Tractor,
  Truck,
  Droplet,
  Calendar,
  Activity,
  ShieldAlert,
  Pencil,
  Upload,
  Trash2,
  MoreHorizontal,
  Plus,
  Minus,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  operador: "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]",
};

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  photo: z.any().optional()
});

function AbsencePanel({ user, onAction }: { user: any; onAction: (msg: string) => void }) {
  const absenceHistory: any[] = user?.absenceHistory ?? [];
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newNote, setNewNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  return (
    <Card className="bg-card border rounded-2xl border-orange-200/60">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700">
            <AlertTriangle className="w-4 h-4" /> Controle de Faltas
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({absenceHistory.length} registrada{absenceHistory.length !== 1 ? "s" : ""})
            </span>
          </CardTitle>
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? "Cancelar" : "Registrar Falta"}
          </Button>
        </div>

        {showForm && (
          <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-orange-700">Data da Falta</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-orange-700">Observação (opcional)</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ex: Atestado médico"
                  className="w-full h-9 px-3 rounded-lg border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <Button
              size="sm"
              className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
              onClick={() => {
                if (!newDate) return;
                usersStore.addAbsence(user.id, newDate, newNote || undefined);
                onAction("Falta registrada — " + new Date(newDate + "T12:00:00").toLocaleDateString("pt-BR"));
                setNewNote("");
                setShowForm(false);
              }}
            >
              Confirmar Registro
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {absenceHistory.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <AlertTriangle className="w-8 h-8 text-orange-200 mx-auto mb-2" />
            Nenhuma falta registrada.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...absenceHistory]
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((absence: any, idx: number) => (
                <div key={absence.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 text-xs font-black flex-shrink-0">
                      {absenceHistory.length - idx}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(absence.date + "T12:00:00").toLocaleDateString("pt-BR", {
                          weekday: "short", day: "2-digit", month: "long", year: "numeric"
                        })}
                      </p>
                      {absence.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{absence.note}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => {
                      usersStore.removeAbsence(user.id, absence.id);
                      onAction("Falta removida.");
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UsuarioDetalhes() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const isProfileRoute = location === "/perfil";

  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditProfileSheetOpen, setIsEditProfileSheetOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const { users: allUsers } = useUsersStore();

  const userForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", email: "", role: "operador", salary: undefined, bonifications: [], absences: 0, status: "ativo" }
  });

  const updateMutation = {
    mutate: (args: { id: number; data: any }) => {
      usersStore.update(args.id, args.data);
      toast({ title: "Usuário atualizado com sucesso." });
      closeUserForm();
    },
    isPending: false,
  };

  const deleteMutation = {
    mutate: (args: { id: number }) => {
      usersStore.delete(args.id);
      toast({ title: "Usuário excluído com sucesso." });
      setLocation("/usuarios");
    },
    isPending: false,
  };

  const openUserEdit = () => {
    if (user) {
      userForm.reset({
        name: user.name,
        email: user.email,
        role: user.role as "admin"|"operador",
        salary: (user as any).salary ?? undefined,
        bonifications: (user as any).bonifications ?? [],
        absences: (user as any).absences ?? 0,
        status: (user as any).status ?? "ativo",
      });
      if (window.innerWidth < 640) setIsUserSheetOpen(true);
      else setIsUserDialogOpen(true);
    }
  };

  const closeUserForm = () => {
    setIsUserDialogOpen(false);
    setIsUserSheetOpen(false);
    userForm.reset();
  };

  const onUpdateUser = (data: z.infer<typeof schema>) => {
    updateMutation.mutate({ id: user!.id, data });
  };

  const confirmUserDelete = () => {
    if (confirm("Tem certeza que deseja revogar o acesso deste usuário?")) {
      deleteMutation.mutate({ id: user!.id });
    }
  };

  const user = useMemo(() => {
    // Re-derive from reactive store so changes propagate
    const found = isProfileRoute
      ? allUsers.find((u: any) => u.id === currentUser?.id)
      : allUsers.find((u: any) => u.id === Number(id));
    return found;
  }, [id, isProfileRoute, currentUser, allUsers]);

  const stats = useMemo(() => {
    if (!user) return null;

      let userHarvests = DEMO_HARVESTS.filter(h => h.driverName === user.name);
      let userTransports = DEMO_TRANSPORTS.filter(t => t.driverName === user.name);
      let userFuelings = DEMO_FUELINGS.filter(f => f.operatorName === user.name || f.responsavelName === user.name);
  
      // Se não tiver dados reais, gera mock para não deixar a aba vazia
      if (userHarvests.length === 0) {
        userHarvests = [
          { id: 991, date: "2024-03-01T10:00:00Z", cultures: ["soja"], area: "Talhão A1", talhaoId: 1, areaHectares: 100, quantitySacks: 540, productivity: 5.4, driverName: user.name, machineId: 1, machineName: "TC 5090", createdAt: "2024-03-01T10:00:00Z" }
        ];
      }
      if (userTransports.length === 0) {
        userTransports = [
          { id: 992, date: "2024-03-02T14:30:00Z", truckPlate: "ABC-1234", truckId: 1, driverName: user.name, origin: "Silo Norte", destination: "Porto", cargoTons: 32, freightValue: 1200, createdAt: "2024-03-02T14:30:00Z" }
        ];
      }
      if (userFuelings.length === 0) {
        userFuelings = [
          { id: 993, date: "2024-03-03T08:15:00Z", machineId: 2, machineName: "Trator Valtra", operatorName: user.name, responsavelName: "Carlos Gerente", fuelType: "Diesel S10", volumeLiters: 150, servico: "Preparo de Solo", talhaoName: "Talhão B1", createdAt: "2024-03-03T08:15:00Z" } as any
        ];
      }
  
      if (selectedMonth !== "all") {
        const monthIndex = parseInt(selectedMonth);
        userHarvests = userHarvests.filter(h => new Date(h.date).getMonth() === monthIndex);
        userTransports = userTransports.filter(t => new Date(t.date).getMonth() === monthIndex);
        userFuelings = userFuelings.filter(f => new Date(f.date).getMonth() === monthIndex);
      }
  
      const totalHarvestSacks = userHarvests.reduce((acc, h) => acc + h.quantitySacks, 0);
      const totalTransportTons = userTransports.reduce((acc, t) => acc + t.cargoTons, 0);
      const totalFuelingLiters = userFuelings.reduce((acc, f) => acc + (f.volumeLiters || 0), 0);
  
      // Mock data for the performance chart
      const operationalPerformance = [
        { day: 'Seg', eficiencia: 85, ociosidade: 15 },
        { day: 'Ter', eficiencia: 92, ociosidade: 8 },
        { day: 'Qua', eficiencia: 78, ociosidade: 22 },
        { day: 'Qui', eficiencia: 88, ociosidade: 12 },
        { day: 'Sex', eficiencia: 95, ociosidade: 5 },
        { day: 'Sáb', eficiencia: 60, ociosidade: 40 },
        { day: 'Dom', eficiencia: 40, ociosidade: 60 },
      ];
  
      return {
        harvests: userHarvests,
        transports: userTransports,
        fuelings: userFuelings,
        totalHarvestSacks,
        totalTransportTons,
        totalFuelingLiters,
        operationalPerformance
      };
    }, [user, selectedMonth]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      photo: ""
    }
  });

  const onProfileSubmit = (_data: z.infer<typeof profileSchema>) => {
    // Simulando o form de profile
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
    setIsEditProfileOpen(false);
    setIsEditProfileSheetOpen(false);
  };

  const ProfileFormContent = (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5 mt-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border overflow-hidden relative group cursor-pointer">
            <UserCircle2 className="w-12 h-12" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Clique para alterar a foto</p>
        </div>

        <FormField control={profileForm.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo</FormLabel>
            <FormControl><Input placeholder="Seu nome" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => { setIsEditProfileOpen(false); setIsEditProfileSheetOpen(false); }} className="h-12 rounded-xl order-2 sm:order-1 sm:flex-1">Cancelar</Button>
          <Button type="submit" className="h-12 rounded-xl order-1 sm:order-2 sm:flex-1">Salvar Alterações</Button>
        </div>
      </form>
    </Form>
  );

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Usuário não encontrado</h2>
          <Button onClick={() => setLocation("/usuarios")}>Voltar para Usuários</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={user.name} showBack={true} backTo="/usuarios">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6">
        {!isProfileRoute && (
          <>
            <Link href="/usuarios" className="hover:text-primary transition-colors">Controle de Acessos</Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="font-medium text-foreground">{isProfileRoute ? "Meu Perfil" : user.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <UserCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground leading-tight">{user.name}</h1>
              <Badge variant="outline" className={cn("font-semibold uppercase tracking-wider text-[10px]", ROLE_STYLES[user.role as string])}>
                {user.role === "admin" && <ShieldAlert className="w-3 h-3 mr-1" />}
                {user.role}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              {user.email} · Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-card border">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar Mês" />
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

          {/* Show Edit Profile Button if this is the logged-in user viewing their own profile */}
          {currentUser && currentUser.id === user.id && (
            <>
              <div className="hidden sm:block">
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-10 px-5 bg-card text-muted-foreground border-border hover:bg-muted/40 border">
                      <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px] sm:rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Editar Perfil</DialogTitle>
                    </DialogHeader>
                    {ProfileFormContent}
                  </DialogContent>
                </Dialog>
              </div>
              <div className="sm:hidden">
                <Sheet open={isEditProfileSheetOpen} onOpenChange={setIsEditProfileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="h-10 px-5 bg-card text-muted-foreground border-border hover:bg-muted/40 border">
                      <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                      Editar Perfil
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
                    <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                    <SheetHeader className="text-left mb-4">
                      <SheetTitle className="text-lg">Editar Perfil</SheetTitle>
                    </SheetHeader>
                    <div className="pb-4">
                      {ProfileFormContent}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}

          {/* Show Edit/Delete Actions if the logged-in user is admin and viewing ANOTHER user */}
          {currentUser && currentUser.role === "admin" && currentUser.id !== user.id && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openUserEdit} className="hidden md:flex">
                <Pencil className="w-4 h-4 mr-2" /> Editar Acesso
              </Button>
              <Button variant="outline" size="sm" onClick={confirmUserDelete} className="hidden md:flex text-destructive border-destructive/20 hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Revogar
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openUserEdit}><Pencil className="w-4 h-4 mr-2"/> Editar Acesso</DropdownMenuItem>
                  <DropdownMenuItem onClick={confirmUserDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Revogar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border rounded-2xl flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                <Tractor className="w-4 h-4 text-[hsl(var(--success-text))]" /> Colheitas
              </div>
              <Badge variant="outline" className="bg-muted text-muted-foreground font-bold">{stats?.harvests.length} Registros</Badge>
            </div>
            <div className="text-3xl font-bold font-display text-foreground">
              {stats?.totalHarvestSacks.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground normal-case ml-1 tracking-tight">sacas</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border rounded-2xl flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                <Truck className="w-4 h-4 text-[hsl(var(--info-text))]" /> Transportes
              </div>
              <Badge variant="outline" className="bg-muted text-muted-foreground font-bold">{stats?.transports.length} Viagens</Badge>
            </div>
            <div className="text-3xl font-bold font-display text-foreground">
              {stats?.totalTransportTons.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground normal-case ml-1 tracking-tight">toneladas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border rounded-2xl flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                <Droplet className="w-4 h-4 text-[hsl(var(--warning-text))]" /> Abastecimentos
              </div>
              <Badge variant="outline" className="bg-muted text-muted-foreground font-bold">{stats?.fuelings.length} Registros</Badge>
            </div>
            <div className="text-3xl font-bold font-display text-foreground">
              {stats?.totalFuelingLiters.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground normal-case ml-1 tracking-tight">litros</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 w-full justify-start gap-1 h-auto min-h-[44px] overflow-x-auto rounded-xl">
          <TabsTrigger value="overview" className="px-6 py-2 whitespace-nowrap rounded-lg">Resumo Geral</TabsTrigger>
          <TabsTrigger value="harvests" className="px-6 py-2 whitespace-nowrap rounded-lg">Apontamentos Colheita</TabsTrigger>
          <TabsTrigger value="transports" className="px-6 py-2 whitespace-nowrap rounded-lg">Histórico de Transportes</TabsTrigger>
          <TabsTrigger value="fuelings" className="px-6 py-2 whitespace-nowrap rounded-lg">Histórico Abastecimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          {/* Painel de Faltas */}
          {currentUser?.role === "admin" && (
            <AbsencePanel user={user} onAction={(msg) => toast({ title: msg })} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border rounded-2xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {/* Combina e ordena os registros recentes */}
                  {[
                    ...(stats?.harvests.map((h: any) => ({ ...h, _type: 'harvest', _date: new Date(h.date) })) || []),
                    ...(stats?.transports.map((t: any) => ({ ...t, _type: 'transport', _date: new Date(t.date) })) || []),
                    ...(stats?.fuelings.map((f: any) => ({ ...f, _type: 'fueling', _date: new Date(f.date) })) || [])
                  ]
                    .sort((a, b) => b._date.getTime() - a._date.getTime())
                    .slice(0, 5) // Show top 5 recent events
                    .map((item: any, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            item._type === 'harvest' && "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))]",
                            item._type === 'transport' && "bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))]",
                            item._type === 'fueling' && "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))]"
                          )}>
                            {item._type === 'harvest' && <Tractor className="w-4 h-4" />}
                            {item._type === 'transport' && <Truck className="w-4 h-4" />}
                            {item._type === 'fueling' && <Droplet className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-muted-foreground">
                              {item._type === 'harvest' && `Colheita: ${item.machineName}`}
                              {item._type === 'transport' && `Transporte: ${item.origin} → ${item.destination}`}
                              {item._type === 'fueling' && `Abastecimento: ${item.machineName}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item._type === 'harvest' && `${item.quantitySacks} sacas · ${item.area}`}
                              {item._type === 'transport' && `${item.cargoTons} ton · ${item.truckPlate}`}
                              {item._type === 'fueling' && `${item.volumeLiters} L · ${item.talhaoName || item.servico}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {item._date.toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    ))
                  }
                  {!stats?.harvests.length && !stats?.transports.length && !stats?.fuelings.length && (
                    <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                      <Activity className="w-8 h-8 opacity-20 mb-2" />
                      <span className="text-sm">Nenhuma atividade registrada no período</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border overflow-hidden hidden lg:block border-dashed border-2 rounded-2xl">
              <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Desempenho Operacional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.operationalPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="eficiencia" name="Eficiência" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="ociosidade" name="Ociosidade" stackId="a" fill="#facc15" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="harvests" className="space-y-4">
          <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Cultura</TableHead>
                  <TableHead>Área / Talhão</TableHead>
                  <TableHead className="text-right">Hectares</TableHead>
                  <TableHead className="text-right">Sacas</TableHead>
                  <TableHead className="text-right">Produtividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.harvests.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum apontamento de colheita registrado.</TableCell></TableRow>
                )}
                {stats?.harvests.map((h: any) => (
                  <TableRow key={h.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{format(new Date(h.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-muted-foreground">{h.machineName}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {h.cultures?.map((c: string) => (
                          <Badge key={c} variant="outline" className={`capitalize ${getCultureBadgeStyle(c)}`}>{c}</Badge>
                        )) || (h.culture && <Badge variant="outline" className={`capitalize ${getCultureBadgeStyle(h.culture)}`}>{h.culture}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{h.area}</TableCell>
                    <TableCell className="text-right">{h.areaHectares} ha</TableCell>
                    <TableCell className="text-right font-bold text-[hsl(var(--success-text))]">{h.quantitySacks} sc</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{(Number(h.productivity) || 0).toFixed(1)} sc/ha</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden space-y-3">
            {stats?.harvests.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
                <Tractor className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum apontamento registrado.</p>
              </div>
            )}
            {stats?.harvests.map((h: any) => (
              <div key={h.id} className="bg-card rounded-2xl border p-4 touch-card flex flex-col gap-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--success-subtle))] flex items-center justify-center text-[hsl(var(--success-text))]">
                      <Tractor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{h.machineName}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(h.date), "dd/MM/yyyy")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[hsl(var(--success-text))]">{h.quantitySacks} sc</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{(Number(h.productivity) || 0).toFixed(1)} sc/ha</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-1 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Área:</span>
                    <span className="font-semibold text-foreground">{h.area} <span className="font-normal text-muted-foreground">({h.areaHectares} ha)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cultura:</span>
                    <span className="font-medium text-foreground">
                      {h.cultures?.join(", ") || h.culture}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transports" className="space-y-4">
          <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Caminhão</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead className="text-right">Carga (t)</TableHead>
                  <TableHead className="text-right">Frete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.transports.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum transporte registrado.</TableCell></TableRow>
                )}
                {stats?.transports.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{t.truckPlate}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.origin} <span className="mx-1 text-border">→</span> {t.destination}
                    </TableCell>
                    <TableCell className="text-right font-bold text-[hsl(var(--info-text))]">{t.cargoTons} t</TableCell>
                    <TableCell className="text-right text-[hsl(var(--success-text))] font-medium">
                      {t.freightValue ? `R$ ${(Number(t.freightValue) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden space-y-3">
            {stats?.transports.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
                <Truck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum transporte registrado.</p>
              </div>
            )}
            {stats?.transports.map((t: any) => (
              <div key={t.id} className="bg-card rounded-2xl border p-4 touch-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold">
                      {t.truckPlate}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(t.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-foreground text-sm">{t.origin}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-semibold text-foreground text-sm">{t.destination}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Carga / Frete</span>
                  <div className="text-right">
                    <p className="font-bold text-[hsl(var(--info-text))] text-sm leading-tight">{t.cargoTons} t</p>
                    {t.freightValue ? (
                      <p className="text-xs text-[hsl(var(--success-text))] font-semibold">
                        R$ {(Number(t.freightValue) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fuelings" className="space-y-4">
          <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Talhão</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.fuelings.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum abastecimento registrado.</TableCell></TableRow>
                )}
                {stats?.fuelings.map((f: any) => (
                  <TableRow key={f.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{format(new Date(f.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-bold">{f.machineName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`uppercase tracking-wider text-[10px] ${getServiceBadgeStyle(f.servico as string)}`}>
                        {f.servico || '--'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{f.talhaoName || '--'}</TableCell>
                    <TableCell className="text-right font-black font-mono text-[hsl(var(--warning-text))]">{f.volumeLiters} L</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden space-y-3">
            {stats?.fuelings.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
                <Droplet className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum abastecimento registrado.</p>
              </div>
            )}
            {stats?.fuelings.map((f: any) => (
              <div key={f.id} className="bg-card rounded-2xl border p-4 touch-card">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--warning-subtle))] flex items-center justify-center text-[hsl(var(--warning-text))]">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{f.machineName}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(f.date), "dd/MM/yyyy")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-[hsl(var(--warning-text))]">{f.volumeLiters} L</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Serviço:</span>
                    <Badge variant="outline" className={`uppercase tracking-wider text-[10px] ${getServiceBadgeStyle(f.servico as string)}`}>
                      {f.servico || '--'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Talhão:</span>
                    <span className="font-semibold">{f.talhaoName || '--'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

      </Tabs>

      <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl sm:hidden">
          <SheetHeader><SheetTitle>Editar Acesso</SheetTitle></SheetHeader>
          <div className="mt-4"><FormContent form={userForm} onSubmit={onUpdateUser} isPending={updateMutation.isPending} onClose={closeUserForm} isEditing={true} /></div>
        </SheetContent>
      </Sheet>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[400px] hidden sm:block sm:rounded-2xl">
          <DialogHeader><DialogTitle>Editar Acesso</DialogTitle></DialogHeader>
          <FormContent form={userForm} onSubmit={onUpdateUser} isPending={updateMutation.isPending} onClose={closeUserForm} isEditing={true} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
