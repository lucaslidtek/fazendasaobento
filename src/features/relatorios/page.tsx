import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart,
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Wheat, 
  DollarSign, 
  AlertCircle,
  Download,
  Filter,
  Printer
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useFarm } from "@/contexts/FarmContext";
import { 
  DEMO_HARVESTS, 
  DEMO_FINANCIAL_RECORDS 
} from "@/lib/demo-data";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Relatorios() {
  const { selectedSafraId, selectedTalhaoId } = useFarm();

  // --- Processamento de Dados: Produtividade ---
  const productivityData = useMemo(() => {
    const filtered = DEMO_HARVESTS.filter(h => {
      if (selectedSafraId && h.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && h.talhaoId !== selectedTalhaoId) return false;
      return true;
    });

    // Agrupar por Talhão para o gráfico de barras
    const byTalhao: any = {};
    filtered.forEach(h => {
      if (!byTalhao[h.area]) {
        byTalhao[h.area] = { name: h.area, sacks: 0, area: 0 };
      }
      byTalhao[h.area].sacks += h.quantitySacks;
      byTalhao[h.area].area += h.areaHectares;
    });

    const chartData = Object.values(byTalhao).map((item: any) => ({
      name: item.name,
      prod: Number((item.sacks / item.area).toFixed(1)),
      sacks: item.sacks
    }));

    const totalSacks = filtered.reduce((acc, h) => acc + h.quantitySacks, 0);
    const totalArea = filtered.reduce((acc, h) => acc + h.areaHectares, 0);
    const avgProd = totalArea > 0 ? (totalSacks / totalArea).toFixed(1) : 0;

    return { chartData, totalSacks, totalArea, avgProd };
  }, [selectedSafraId, selectedTalhaoId]);

  // --- Processamento de Dados: Rentabilidade ---
  const financialData = useMemo(() => {
    const filtered = DEMO_FINANCIAL_RECORDS.filter(r => {
      if (selectedSafraId && r.safraId && r.safraId !== selectedSafraId) return false;
      if (selectedTalhaoId && r.talhaoId && r.talhaoId !== selectedTalhaoId) return false;
      return true;
    });

    const revenue = filtered.filter(r => r.type === "receita").reduce((acc, r) => acc + r.value, 0);
    
    // Separação de Custos Diretos vs Indiretos
    const DIRECT_CATEGORIES = ["Insumos", "Combustível", "Mão de Obra"];
    
    let directCosts = 0;
    let indirectCosts = 0;

    filtered.filter(r => r.type === "despesa").forEach(r => {
      if (DIRECT_CATEGORIES.includes(r.category)) {
        directCosts += r.value;
      } else {
        indirectCosts += r.value;
      }
    });

    const expenses = directCosts + indirectCosts;
    
    // Dados mensais para o gráfico
    const months: any = {};
    filtered.forEach(r => {
      const monthKey = format(parseISO(r.date), "MMM", { locale: ptBR });
      if (!months[monthKey]) {
        months[monthKey] = { name: monthKey, receita: 0, despesa: 0 };
      }
      if (r.type === "receita") months[monthKey].receita += r.value;
      else months[monthKey].despesa += r.value;
    });

    const monthlyChart = Object.values(months);

    // Distribuição de custos por categoria
    const categories: any = {};
    filtered.filter(r => r.type === "despesa").forEach(r => {
      if (!categories[r.category]) {
        categories[r.category] = 0;
      }
      categories[r.category] += r.value;
    });

    const categoryData = Object.entries(categories).map(([name, value]) => ({
      name,
      value: Number(value)
    }));

    // Dados de composição Direto vs Indireto
    const compositionData = [
      { name: "Custos Diretos", value: directCosts, color: "#f59e0b" }, // Amber
      { name: "Custos Indiretos", value: indirectCosts, color: "#6366f1" } // Indigo
    ];

    return { revenue, expenses, directCosts, indirectCosts, monthlyChart, categoryData, compositionData };
  }, [selectedSafraId, selectedTalhaoId]);

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black font-display tracking-tight flex items-center gap-3">
            <BarChart3 className="hidden sm:block w-8 h-8 text-secondary" />
            Relatórios Inteligentes
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Análise profunda de produtividade, rentabilidade e fluxos operacionais da fazenda.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto no-print">
          <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl">
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Imprimir PDF</span>
          </Button>
          <Button variant="outline" className="h-10 px-5 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
            <Download className="w-4 h-4" /> <span className="hidden md:inline">Exportar CSV</span>
          </Button>
          <Button className="h-10 px-5 gap-2 rounded-xl">
            <Filter className="w-4 h-4" /> <span className="hidden md:inline">Filtrar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="produtividade" className="w-full space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full sm:w-auto justify-start border overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="produtividade" className="rounded-lg px-8 py-2 data-[state=active]:bg-card">Monitor de Produtividade</TabsTrigger>
          <TabsTrigger value="rentabilidade" className="rounded-lg px-8 py-2 data-[state=active]:bg-card">Análise Financeira</TabsTrigger>
          <TabsTrigger value="custos" className="rounded-lg px-8 py-2 data-[state=active]:bg-card">Custos Realizados</TabsTrigger>
        </TabsList>

        {/* --- Aba 1: Produtividade --- */}
        <TabsContent value="produtividade" className="mt-0 space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-2xl border bg-[hsl(var(--info-subtle))] border-info/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center text-info-foreground">
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-info-foreground/60 uppercase tracking-widest leading-none mb-1.5">Média de Produção</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-info-foreground">{productivityData.avgProd}</p>
                    <span className="text-xs font-bold opacity-60">SC/HA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-[hsl(var(--success-subtle))] border-success/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success-foreground">
                  <Wheat className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-success-foreground/60 uppercase tracking-widest leading-none mb-1.5">Total Colhido</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-success-foreground">{productivityData.totalSacks.toLocaleString()}</p>
                    <span className="text-xs font-bold opacity-60">SACOS</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-muted/20 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Área Operada</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-foreground">{productivityData.totalArea.toLocaleString()}</p>
                    <span className="text-xs font-bold opacity-60">HA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Target className="w-5 h-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-lg font-black">Performance por Área</CardTitle>
                    <CardDescription className="text-xs font-medium">Comparativo de sacos por hectare entre talhões</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '12px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      />
                      <Bar dataKey="prod" name="Sacos/ha" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg"><Wheat className="w-5 h-5 text-success" /></div>
                  <div>
                    <CardTitle className="text-lg font-black">Volume Histórico</CardTitle>
                    <CardDescription className="text-xs font-medium">Progressão da produção total colhida</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData.chartData}>
                      <defs>
                        <linearGradient id="colorSacks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} dx={-10} />
                      <Tooltip 
                         contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '12px' }}
                      />
                      <Area type="monotone" dataKey="sacks" name="Total Sacos" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorSacks)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo: Produção vs Produtividade */}
          <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <CardTitle className="text-lg font-black">Comparativo: Produção e Produtividade</CardTitle>
                  <CardDescription className="text-xs font-medium">Volume total de sacas vs eficiência (sc/ha) por área</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData.chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} dy={10} />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                      dx={-10}
                      label={{ value: 'Sacas', angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                      dx={10}
                      label={{ value: 'sc/ha', angle: 90, position: 'insideRight', offset: 12, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '16px' }} />
                    <Bar yAxisId="left" dataKey="sacks" name="Produção (sacas)" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} barSize={28} />
                    <Bar yAxisId="right" dataKey="prod" name="Produtividade (sc/ha)" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* --- Aba 2: Rentabilidade --- */}
        <TabsContent value="rentabilidade" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border bg-muted/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-card border flex items-center justify-center text-muted-foreground">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Receita Bruta</p>
                  <p className="text-xl font-black text-foreground">R$ {financialData.revenue.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-amber-50/50 border-amber-200/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/50 flex items-center justify-center text-amber-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest leading-none mb-1">Custos Diretos</p>
                  <p className="text-xl font-black text-amber-700">R$ {financialData.directCosts.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-indigo-50/50 border-indigo-200/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-widest leading-none mb-1">Custos Indiretos</p>
                  <p className="text-xl font-black text-indigo-700">R$ {financialData.indirectCosts.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-primary/5 border-primary/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Margem Líquida</p>
                  <p className="text-xl font-black text-primary">R$ {(financialData.revenue - financialData.expenses).toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden lg:col-span-2">
              <CardHeader className="bg-muted/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><DollarSign className="w-5 h-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-lg font-black">Fluxo de Caixa Mensal</CardTitle>
                    <CardDescription className="text-xs font-medium">Equilíbrio entre entradas e saídas consolidadas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData.monthlyChart} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} hide />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                      <Bar dataKey="receita" name="Receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg"><Filter className="w-5 h-5 text-amber-600" /></div>
                  <div>
                    <CardTitle className="text-lg font-black">Composição de Custos</CardTitle>
                    <CardDescription className="text-xs font-medium">Custos Diretos vs. Indiretos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 flex flex-col items-center">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialData.compositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {financialData.compositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4 w-full">
                  {financialData.compositionData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-bold text-foreground/80 uppercase tracking-tight">{entry.name}</span>
                      </div>
                      <span className="text-sm font-black text-foreground">
                        {((entry.value / financialData.expenses) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Aba 3: Custos Realizados --- */}
        <TabsContent value="custos" className="mt-0 space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden lg:col-span-1">
              <CardHeader className="bg-muted/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg"><Filter className="w-5 h-5 text-secondary" /></div>
                  <div>
                    <CardTitle className="text-lg font-black">Por Categoria</CardTitle>
                    <CardDescription className="text-xs font-medium">Pesos relativos de cada tipo de gasto</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 flex flex-col items-center">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {financialData.categoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 w-full px-2">
                  {financialData.categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 overflow-hidden bg-muted/20 p-2 rounded-xl border border-border/40">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-black text-muted-foreground uppercase truncate tracking-tight">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden lg:col-span-2">
              <CardHeader className="bg-muted/10 pb-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg"><AlertCircle className="w-5 h-5 text-destructive" /></div>
                  <div>
                    <CardTitle className="text-lg font-black">Gastos Críticos</CardTitle>
                    <CardDescription className="text-xs font-medium">Os 5 maiores lançamentos identificados</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-card font-black text-[10px] uppercase tracking-widest px-3 py-1">Top 5 Records</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase py-5 px-6">Data</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Descrição do Lançamento</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-center">Classificação</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right px-6">Valor Individual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_FINANCIAL_RECORDS
                      .filter(r => r.type === "despesa" && (!selectedSafraId || r.safraId === selectedSafraId))
                      .sort((a,b) => b.value - a.value)
                      .slice(0, 5)
                      .map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/10 group transition-colors cursor-default">
                          <TableCell className="py-4 px-6 text-xs text-muted-foreground font-mono">{format(parseISO(r.date), "dd/MM/yy")}</TableCell>
                          <TableCell className="font-black text-foreground">{r.description}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-[9px] uppercase font-black px-2 py-0.5 bg-muted/60 text-muted-foreground rounded-lg">
                              {r.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-black font-mono text-destructive px-6 text-base tracking-tighter">
                            R$ {r.value.toLocaleString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}


