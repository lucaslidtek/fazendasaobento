import { AppLayout } from "@/components/layout/AppLayout";
import { useListUsers, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2, Users, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";

export default function Usuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (user?.role !== 'admin') {
    setLocation("/");
    return null;
  }

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: records, isLoading } = useListUsers();

  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "Removido", description: "Usuário excluído." });
      },
      onError: (err: any) => toast({ variant: "destructive", title: "Erro", description: err.message })
    }
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Controle de Acessos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema e suas permissões.</p>
        </div>
        <Button asChild className="rounded-xl h-11 px-6">
          <Link href="/register">Adicionar Usuário</Link>
        </Button>
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow>
              )}
              {records?.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-bold text-foreground">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                  <TableCell>
                    {r.role === 'admin' ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><ShieldAlert className="w-3 h-3 mr-1"/> Admin</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">Operador</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {r.id !== user?.id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if (confirm("Deseja realmente excluir este acesso?")) {
                            deleteMutation.mutate({ id: r.id });
                          }
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AppLayout>
  );
}
