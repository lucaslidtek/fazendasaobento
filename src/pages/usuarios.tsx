import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Users, UserCircle2, Trash2, MoreHorizontal, Plus, Pencil, BadgeCheck, BadgeX, DollarSign, AlertTriangle, Gift, ShieldAlert, Loader2 } from "lucide-react";
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
import { usersStore } from "@/lib/users-store";
import { useUsersStore } from "@/hooks/use-users-store";

export const schema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "operador"]),
  salary: z.coerce.number().min(0).optional(),
  bonifications: z.array(z.object({ description: z.string().min(1, "Descrição obrigatória") })).optional(),
  absences: z.coerce.number().min(0).optional(),
  status: z.enum(["ativo", "inativo"]).default("ativo"),
});

export function FormContent({ form, onSubmit, isPending, onClose, isEditing }: any) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "bonifications" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome e E-mail */}
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Ex: João Silva" {...field} className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1.5">
              E-mail de Acesso
              <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Login da plataforma
              </span>
            </FormLabel>
            <FormControl><Input type="email" placeholder="usuario@fazenda.com" {...field} className="h-12 rounded-xl" /></FormControl>
            <p className="text-[11px] text-muted-foreground">Este e-mail será usado para o funcionário acessar o sistema.</p>
            <FormMessage />
          </FormItem>
        )} />

        {/* Perfil e Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "operador"}>
                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Perfil" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "ativo"}>
                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Salário e Faltas */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="salary" render={({ field }) => (
            <FormItem>
              <FormLabel>Salário (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ex: 3200.00" {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="absences" render={({ field }) => (
            <FormItem>
              <FormLabel>Faltas</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Bonificações */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-sm font-medium">Bonificações</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "" })} className="h-8 gap-1 rounded-xl text-xs">
              <Plus className="w-3 h-3" /> Adicionar
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma bonificação cadastrada.</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField control={form.control} name={`bonifications.${index}.description`} render={({ field }) => (
                <FormItem className="flex-1 mb-0">
                  <FormControl><Input placeholder="Descrição da bonificação" {...field} className="h-10 rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-10 w-10 text-destructive hover:text-destructive rounded-xl flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-xl order-2 sm:order-1 sm:flex-1">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="h-12 rounded-xl order-1 sm:order-2 sm:flex-1">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar Funcionário"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Usuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { users: records } = useUsersStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", email: "", role: "operador", salary: undefined, bonifications: [], absences: 0, status: "ativo" },
  });

  // Guard: só admin pode acessar esta página — APÓS todos os hooks
  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const closeForm = () => {
    setIsDialogOpen(false);
    setIsSheetOpen(false);
    setEditingRecord(null);
    form.reset({ name: "", email: "", role: "operador", salary: undefined, bonifications: [], absences: 0, status: "ativo" });
  };

  const handleEditOpen = (record: any, isMobile: boolean) => {
    setEditingRecord(record);
    form.reset({
      name: record.name,
      email: record.email,
      role: record.role,
      salary: record.salary ?? undefined,
      bonifications: record.bonifications ?? [],
      absences: record.absences ?? 0,
      status: record.status ?? "ativo",
    });
    if (isMobile) setIsSheetOpen(true);
    else setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseja realmente excluir este funcionário?")) {
      usersStore.delete(id);
      toast({ title: "Funcionário excluído." });
    }
  };

  const handleSubmit = (data: z.infer<typeof schema>) => {
    if (editingRecord) {
      usersStore.update(editingRecord.id, data);
      toast({ title: "Funcionário atualizado com sucesso." });
    } else {
      usersStore.create(data);
      toast({ title: "Funcionário cadastrado com sucesso." });
    }
    closeForm();
  };

  const formProps = {
    form,
    onSubmit: handleSubmit,
    isPending: false,
    onClose: closeForm,
    isEditing: !!editingRecord,
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight flex items-center gap-3">
            <Users className="hidden md:block w-7 h-7 text-primary" />
            Funcionários <span className="text-muted-foreground/60 text-xl md:text-2xl">({records.length})</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os funcionários, acessos e dados de RH.
          </p>
        </div>

        <div className="hidden md:block">
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingRecord ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <FormContent {...formProps} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Salário</TableHead>
              <TableHead className="text-center">Faltas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead className="w-[88px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Nenhum funcionário encontrado.
                </TableCell>
              </TableRow>
            )}
            {records.map((r: any) => (
              <TableRow
                key={r.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('.dropdown-trigger') || target.closest('.action-button')) return;
                  setLocation(`/usuarios/${r.id}`);
                }}
              >
                <TableCell className="font-bold text-foreground">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell>
                  {r.role === "admin" ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]">Operador</Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {r.salary ? `R$ ${Number(r.salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="text-center">
                  {(r.absences ?? 0) > 0 ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 gap-1">
                      <AlertTriangle className="w-3 h-3" />{r.absences}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/40">0</span>
                  )}
                </TableCell>
                <TableCell>
                  {(r.status ?? "ativo") === "ativo" ? (
                    <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] gap-1">
                      <BadgeCheck className="w-3 h-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                      <BadgeX className="w-3 h-3" /> Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.createdAt ? format(new Date(r.createdAt), "dd/MM/yyyy") : "—"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOpen(r, false)} className="action-button rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {r.id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="dropdown-trigger rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditOpen(r, false)} className="gap-2 cursor-pointer">
                            <Pencil className="w-4 h-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {records.length === 0 && (
          <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
            Nenhum funcionário encontrado.
          </div>
        )}
        {records.map((r: any) => (
          <div
            key={r.id}
            className="bg-card rounded-2xl border p-4 touch-card cursor-pointer hover:border-primary/30 transition-colors"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('.dropdown-trigger') || target.closest('.action-button')) return;
              setLocation(`/usuarios/${r.id}`);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <UserCircle2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-foreground text-sm truncate">{r.name}</p>
                    {r.role === "admin" && (
                      <ShieldAlert className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {(r.status ?? "ativo") === "ativo" ? (
                      <Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)] h-5 px-1.5 text-[10px] font-bold gap-0.5">
                        <BadgeCheck className="w-2.5 h-2.5" /> Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground h-5 px-1.5 text-[10px] font-bold gap-0.5">
                        <BadgeX className="w-2.5 h-2.5" /> Inativo
                      </Badge>
                    )}
                    {r.salary && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        R$ {Number(r.salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    {(r.absences ?? 0) > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 h-5 px-1.5 text-[10px] font-bold gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> {r.absences} faltas
                      </Badge>
                    )}
                    {(r.bonifications?.length ?? 0) > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Gift className="w-3 h-3" /> {r.bonifications.length} bonificação(ões)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="dropdown-trigger rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0 text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditOpen(r, true)} className="gap-2 cursor-pointer">
                      <Pencil className="w-4 h-4" />
                      Editar
                    </DropdownMenuItem>
                    {r.id !== user?.id && (
                      <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB mobile */}
      <div className="md:hidden">
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
              <SheetTitle className="text-lg">{editingRecord ? "Editar Funcionário" : "Novo Funcionário"}</SheetTitle>
            </SheetHeader>
            <FormContent {...formProps} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
