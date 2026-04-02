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
  LineChart,
  Line,
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
  Calendar,
  AlertCircle,
  Download,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFarm } from "@/contexts/FarmContext";
import { 
  DEMO_HARVESTS, 
  DEMO_FINANCIAL_RECORDS, 
  DEMO_SAFRAS, 
  DEMO_TALHOES 
} from "@/lib/demo-data";
import { format, parseISO, startOfMonth } from "date-fns";
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
    const expenses = filtered.filter(r => r.type === "despesa").reduce((acc, r) => acc + r.value, 0);
    
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

    return { revenue, expenses, monthlyChart, categoryData };
  }, [selectedSafraId, selectedTalhaoId]);

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="hidden sm:block w-7 h-7 text-primary" />
            Relatórios Analíticos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Análises de produtividade, rentabilidade e custos operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="h-10 px-4 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
            <Download className="w-4 h-4" /> Exportar PDF
          </Button>
          <Button variant="outline" className="h-10 px-4 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
            <Calendar className="w-4 h-4" /> Comparar Safras
          </Button>
        </div>
      </div>

      <Tabs defaultValue="produtividade" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-11 w-full sm:w-auto justify-start border overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="produtividade" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Produtividade</TabsTrigger>
          <TabsTrigger value="rentabilidade" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Rentabilidade</TabsTrigger>
          <TabsTrigger value="custos" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Custos Realizados</TabsTrigger>
        </TabsList>

        {/* --- Aba 1: Produtividade --- */}
        <TabsContent value="produtividade" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-none shadow-sm bg-blue-50/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700/60 uppercase tracking-wider leading-tight">Produtividade Média</p>
                  <p className="text-2xl font-black text-blue-700">{productivityData.avgProd} <span className="text-sm">Sc/ha</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-green-50/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                  <Wheat className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700/60 uppercase tracking-wider leading-tight">Total Colhido</p>
                  <p className="text-2xl font-black text-green-700">{productivityData.totalSacks.toLocaleString()} <span className="text-sm">Sacos</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-slate-50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">Área Coberta</p>
                  <p className="text-2xl font-black text-slate-800">{productivityData.totalArea.toLocaleString()} <span className="text-sm">ha</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border border-muted-foreground/10 bg-card overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Produtividade por Talhão (Sacos por Hectare)
                </CardTitle>
                <CardDescription>Comparativo de eficiência produtiva entre os talhões da safra</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="prod" name="Sacos/ha" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-muted-foreground/10 bg-card overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-primary" />
                  Volume Total de Sacos por Talhão
                </CardTitle>
                <CardDescription>Produção brute colhida em cada área</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData.chartData}>
                      <defs>
                        <linearGradient id="colorSacks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="sacks" name="Total Sacos" stroke="#10b981" fillOpacity={1} fill="url(#colorSacks)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Aba 2: Rentabilidade --- */}
        <TabsContent value="rentabilidade" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-none shadow-sm bg-slate-50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center text-slate-600 shadow-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">Receita Bruta</p>
                  <p className="text-2xl font-black text-slate-800">R$ {financialData.revenue.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-orange-50/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-700/60 uppercase tracking-wider leading-tight">Custo Total</p>
                  <p className="text-2xl font-black text-orange-700">R$ {financialData.expenses.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-primary/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider leading-tight">Margem Líquida</p>
                  <p className="text-2xl font-black text-primary">R$ {(financialData.revenue - financialData.expenses).toLocaleString('pt-BR', { notation: 'compact' })}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-muted-foreground/10 bg-card overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Fluxo de Caixa Mensal (Receitas vs Despesas)
              </CardTitle>
              <CardDescription>Fluxo financeiro consolidado por mês na safra ativa</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.monthlyChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Aba 3: Custos Realizados --- */}
        <TabsContent value="custos" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-2xl border border-muted-foreground/10 bg-card overflow-hidden shadow-sm lg:col-span-1">
              <CardHeader className="bg-muted/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Distribuição por Categoria
                </CardTitle>
                <CardDescription>Categorias de maior peso nos custos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {financialData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                  {financialData.categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-muted-foreground/10 bg-card overflow-hidden shadow-sm lg:col-span-2">
              <CardHeader className="bg-muted/20 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Principais Lançamentos de Custo
                  </CardTitle>
                  <CardDescription>Os 5 maiores gastos identificados na safra</CardDescription>
                </div>
                <Badge variant="outline" className="bg-white">Maiores Gastos</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-bold uppercase py-4">Data</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Descrição</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Categoria</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_FINANCIAL_RECORDS
                      .filter(r => r.type === "despesa" && (!selectedSafraId || r.safraId === selectedSafraId))
                      .sort((a,b) => b.value - a.value)
                      .slice(0, 5)
                      .map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/10">
                          <TableCell className="text-xs text-muted-foreground">{format(parseISO(r.date), "dd/MM/yy")}</TableCell>
                          <TableCell className="text-sm font-bold">{r.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0 bg-slate-100">{r.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-black font-mono text-red-600">R$ {r.value.toLocaleString()}</TableCell>
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
