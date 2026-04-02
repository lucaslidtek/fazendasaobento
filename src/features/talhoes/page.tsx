import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Map as MapIcon, Loader2, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
          <FormItem><FormLabel>Nome do Talhão</FormLabel><FormControl><Input placeholder="Ex: Talhão A1, Gleba Oeste" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="property" render={({ field }) => (
          <FormItem>
            <FormLabel>Propriedade</FormLabel>
            <FormControl>
              <div className="relative">
                <Input list="properties-list" placeholder="Ex: Fazenda São Bento" {...field} />
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
        <FormField control={form.control} name="areaHectares" render={({ field }) => (
          <FormItem><FormLabel>Área (Hectares)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Ex: 20" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="cultureId" render={({ field }) => (
          <FormItem><FormLabel>Cultura Atual (Opcional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value?.toString() || "none"}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma cultura" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {DEMO_CROPS.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem><FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="flex-1">
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
    const culture = DEMO_CROPS.find(c => c.id === mapping.cultureId);
    return culture ? culture.name : "—";
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <MapIcon className="hidden sm:block w-7 h-7 text-primary" />
            Talhões {records && <span className="text-muted-foreground/60 text-xl md:text-2xl">({records.length})</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão das áreas de plantio e talhões da fazenda.
          </p>
        </div>

        <div className="hidden sm:block">
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5">
                <Plus className="w-4 h-4 mr-2" />
                Novo Talhão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Talhão" : "Novo Talhão"}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <FormContent {...formProps} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABELA — desktop */}
      <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Nome da Área</TableHead>
                <TableHead>Propriedade</TableHead>
                <TableHead>Área (ha)</TableHead>
                <TableHead>Cultura Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[88px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum talhão cadastrado.</TableCell></TableRow>
              )}
              {records?.map((r: Talhao) => (
                <TableRow key={r.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setLocation(`/talhoes/${r.id}`)}>
                  <TableCell className="font-bold">{r.name}</TableCell>
                  <TableCell>{r.property || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.areaHectares} ha</TableCell>
                  <TableCell className="text-muted-foreground">{getCultureName(r.id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[r.status as keyof typeof STATUS_STYLES] ?? ""}>
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Excluir
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
      <div className="sm:hidden space-y-3">
        {isLoading && (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        )}
        {!isLoading && records?.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            Nenhum talhão cadastrado.
          </div>
        )}
        {records?.map((r: Talhao) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card cursor-pointer" onClick={() => setLocation(`/talhoes/${r.id}`)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={STATUS_STYLES[r.status as keyof typeof STATUS_STYLES] ?? ""}>
                    {STATUS_LABELS[r.status]}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-semibold">
                    {r.areaHectares} ha
                  </Badge>
                </div>
                <p className="font-bold text-base mt-2">{r.name}</p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">{r.property || "—"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Cultura: {getCultureName(r.id)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0 text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
          </div>
        ))}
      </div>

      {/* FAB mobile */}
      <div className="sm:hidden">
        <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsSheetOpen(true); }}>
          <button
            onClick={() => setIsSheetOpen(true)}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
          <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-lg">{editingRecord ? "Editar Talhão" : "Novo Talhão"}</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
