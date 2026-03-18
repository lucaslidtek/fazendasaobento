import { AppLayout } from "@/components/layout/AppLayout";
import { useListUsers, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Loader2, ShieldAlert, UserCircle2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";

export default function Usuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: apiRecords, isLoading } = useListUsers();
  const records = apiRecords ?? [];

  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "Usuário excluído." });
      },
      onError: (err: any) =>
        toast({ variant: "destructive", title: "Erro", description: err.message }),
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Deseja realmente excluir este acesso?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="hidden sm:block">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            Controle de Acessos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os usuários do sistema e suas permissões.
          </p>
        </div>
        <Button asChild className="hidden sm:inline-flex h-10 px-5">
          <Link href="/register">Adicionar Usuário</Link>
        </Button>
      </div>

      {/* TABELA — desktop */}
      <div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="w-[52px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-bold text-foreground">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                  <TableCell>
                    {r.role === "admin" ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Operador</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(r.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {r.id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                    )}
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
            Nenhum usuário encontrado.
          </div>
        )}
        {records?.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border p-4 touch-card">
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.role === "admin" ? "Administrador" : "Operador"} · {format(new Date(r.createdAt), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              {r.id !== user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 -mt-1 -mr-1 flex-shrink-0 text-muted-foreground">
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
              )}
            </div>
          </div>
        ))}

        {/* Botão adicionar usuário — mobile */}
        <div className="pt-2">
          <Button asChild className="w-full h-12">
            <Link href="/register">Adicionar Usuário</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
