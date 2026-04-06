import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Map as MapIcon, Loader2, Pencil, Trash2, MoreHorizontal, Sprout, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DEMO_TALHOES, DEMO_CROPS, Talhao, DEMO_TALHAO_CULTURAS } from "@/lib/demo-data";
import { useFarm } from "@/contexts/FarmContext";

// --- MOCK API ---
let MOCK_TALHOES = [...DEMO_TALHOES];
let nextId = 9;

const fakeDelay = () => new Promise(resolve => setTimeout(resolve, 400));

const apiFetchTalhoes = async () => {
  await fakeDelay();
  return [...MOCK_TALHOES];
};

const apiCreateTalhao = async (data: Omit<Talhao, "id" | "createdAt">) => {
  await fakeDelay();
  const newTalhao: Talhao = { 
    ...data, 
    id: nextId++, 
    createdAt: new Date().toISOString() 
  };
  MOCK_TALHOES.push(newTalhao);
  return newTalhao;
};

export const apiUpdateTalhao = async ({ id, data }: { id: number; data: Partial<Talhao> }) => {
  await fakeDelay();
  const index = MOCK_TALHOES.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Talhão não encontrado");
  MOCK_TALHOES[index] = { ...MOCK_TALHOES[index], ...data };
  return MOCK_TALHOES[index];
};

export const apiDeleteTalhao = async (id: number) => {
  await fakeDelay();
  MOCK_TALHOES = MOCK_TALHOES.filter(t => t.id !== id);
  return true;
};
// -----------------

export const schema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  property: z.string().min(2, "Propriedade é obrigatória"),
  areaHectares: z.coerce.number().min(0.1, "Área deve ser maior que 0"),
  cultureId: z.coerce.number().optional().or(z.literal("")).or(z.literal("none")),
  status: z.enum(["ativo", "inativo"]),
});

export type TalhaoFormData = z.infer<typeof schema>;

const STATUS_STYLES = {
  ativo: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]",
  inativo: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export function FormContent({ form, onSubmit, isPending, onClose, isEditing, uniqueProperties = [] }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel className="text-[10px] font-bold uppercase">Nome do Talhão</FormLabel><FormControl><Input className="rounded-xl" placeholder="Ex: Talhão A1, Gleba Oeste" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="property" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] font-bold uppercase">Propriedade</FormLabel>
            <FormControl>
              <div className="relative">
                <Input list="properties-list" className="rounded-xl" placeholder="Ex: Fazenda São Bento" {...field} />
                <datalist id="properties-list">
                  {uniqueProperties.map((p: string) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="areaHectares" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Área (Hectares)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-xl" placeholder="Ex: 20" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="cultureId" render={({ field }) => (
          <FormItem><FormLabel className="text-[10px] font-bold uppercase">Cultura Atual (Opcional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value?.toString() || "none"}>
              <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione uma cultura" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {DEMO_CROPS.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1 rounded-xl">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Talhoes() {
  const { user } = useAuth();
  const { selectedSafraId } = useFarm();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Talhao | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ["/talhoes"],
    queryFn: apiFetchTalhoes
  });

  const createMutation = useMutation({
    mutationFn: apiCreateTalhao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/talhoes"] });
      toast({ title: "Talhão cadastrado." });
      closeForm();
      form.reset();
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteTalhao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/talhoes"] });
      toast({ title: "Talhão excluído." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: apiUpdateTalhao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/talhoes"] });
      toast({ title: "Talhão atualizado." });
      closeForm();
      form.reset();
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message }),
  });

  const form = useForm<TalhaoFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", property: "", areaHectares: 0, cultureId: "none", status: "ativo" },
  });

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) deleteMutation.mutate(id);
  };

  const handleEditOpen = (record: Talhao, isMobile: boolean) => {
    setEditingRecord(record);
    const mapping = selectedSafraId ? DEMO_TALHAO_CULTURAS.find(c => c.talhaoId === record.id && c.safraId === selectedSafraId) : null;
    form.reset({
      name: record.name,
      property: record.property || "",
      areaHectares: record.areaHectares,
      cultureId: mapping ? String(mapping.cultureId) as any : "none",
      status: record.status,
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const handleSubmit = (d: TalhaoFormData) => {
    const dataToSave = {
      ...d,
      cultureId: d.cultureId && d.cultureId !== "none" ? Number(d.cultureId) : undefined,
    };
    if (editingRecord) updateMutation.mutate({ id: editingRecord.id, data: dataToSave });
    else createMutation.mutate(dataToSave as any);
  };

  const uniqueProperties = Array.from(new Set(records?.map((r: any) => r.property).filter(Boolean)));

  const formProps = {
    form,
    onSubmit: handleSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    onClose: closeForm,
    isEditing: !!editingRecord,
    uniqueProperties,
  };

  const getCultureName = (talhaoId: number) => {
    if (!selectedSafraId) return "—";
    const mapping = DEMO_TALHAO_CULTURAS.find(c => c.talhaoId === talhaoId && c.safraId === selectedSafraId);
    if (!mapping) return "—";
    const culture = DEMO_CROPS.find((c: any) => c.id === mapping.cultureId);
    return culture ? culture.name : "—";
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight flex items-center gap-3">
            <MapIcon className="hidden md:block w-7 h-7 text-secondary" />
            Talhões e Áreas {records && <span className="text-muted-foreground/60 text-xl md:text-2xl">({records.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão das glebas, áreas de plantio e histórico da terra.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto no-print">
          <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl">
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Imprimir PDF</span>
          </Button>
          <Button variant="outline" className="h-10 px-4 bg-card rounded-xl hidden sm:flex border-muted-foreground/20">
            <Download className="w-4 h-4 mr-2 text-muted-foreground" />
            Exportar CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                <span>Novo Talhão</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Talhão" : "Novo Talhão"}</DialogTitle>
              </DialogHeader>
              <div className="mt-2 text-left">
                <FormContent {...formProps} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full">
        {/* TABELA — desktop */}
        <div className="hidden md:block bg-card rounded-2xl border overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Identificação</TableHead>
                  <TableHead>Propriedade</TableHead>
                  <TableHead className="text-right">Área (ha)</TableHead>
                  <TableHead>Cultura Atual</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum talhão cadastrado.</TableCell></TableRow>
                )}
                {records?.map((r: Talhao) => (
                  <TableRow key={r.id} className="hover:bg-muted/30 cursor-pointer group" onClick={() => setLocation(`/talhoes/${r.id}`)}>
                    <TableCell className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MapIcon className="w-4 h-4" />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.property || "—"}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{r.areaHectares} ha</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted/50 border-none text-[10px] uppercase font-bold text-muted-foreground">
                        {getCultureName(r.id)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("rounded-lg h-6 px-2 text-[10px] uppercase font-black", STATUS_STYLES[r.status as keyof typeof STATUS_STYLES] ?? "")}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleEditOpen(r, false); }}
                          className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Excluir Talhão
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* CARDS — mobile */}
        <div className="md:hidden space-y-3">
          {isLoading && (
            <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          )}
          {!isLoading && records?.length === 0 && (
            <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
              Nenhum talhão cadastrado.
            </div>
          )}
          {records?.map((r: Talhao) => (
            <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card cursor-pointer transition-all active:scale-[0.98]" onClick={() => setLocation(`/talhoes/${r.id}`)}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{r.property || "Sem Propriedade"}</p>
                    <Badge variant="outline" className={cn("rounded-md h-4 px-1.5 text-[8px] uppercase font-black tracking-tight", STATUS_STYLES[r.status as keyof typeof STATUS_STYLES] ?? "")}>
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </div>
                  <p className="font-bold text-foreground text-lg leading-tight">{r.name}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0 text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-xl">
                    <DropdownMenuItem onClick={() => handleEditOpen(r, true)} className="gap-2 cursor-pointer">
                      <Pencil className="w-4 h-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">{getCultureName(r.id)}</span>
                </div>
                <div className="text-primary font-mono font-black text-base">
                  {r.areaHectares} <span className="text-[10px] uppercase ml-0.5 tracking-tighter">ha</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB mobile */}
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsSheetOpen(true); }}>
          <button
            onClick={() => setIsSheetOpen(true)}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 shadow-primary/20 border border-white/10"
          >
            <Plus className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">{editingRecord ? "Editar Talhão" : "Novo Talhão"}</SheetTitle>
            </SheetHeader>
            <div className="text-left">
              <FormContent {...formProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
