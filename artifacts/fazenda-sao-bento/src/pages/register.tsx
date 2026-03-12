import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useRegister } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wheat } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["admin", "operador"]).default("operador"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: registerMutation, isPending } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "operador" },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation({ data }, {
      onSuccess: () => {
        toast({ title: "Conta criada!", description: "Faça login para continuar." });
        setLocation("/login");
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Erro ao criar conta", 
          description: err.message || "Verifique os dados informados" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Criar Conta</h2>
            <p className="text-muted-foreground mt-2 text-lg">Preencha os dados para se registrar.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" className="h-11 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" className="h-11 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-11 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background">
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200" 
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Registrar"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-muted-foreground">
            Já possui conta?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-l from-sidebar/90 to-sidebar/40 z-10 mix-blend-multiply" />
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Fazenda" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 right-12 z-20 text-white max-w-lg text-right">
          <div className="flex items-center justify-end gap-3 mb-6">
            <h1 className="text-4xl font-bold font-display">Fazenda São Bento</h1>
            <div className="bg-primary p-3 rounded-2xl">
              <Wheat className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <p className="text-xl text-white/80 font-medium">Junte-se à nossa equipe e otimize a produção.</p>
        </div>
      </div>
    </div>
  );
}
