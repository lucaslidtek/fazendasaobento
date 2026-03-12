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
import { Loader2 } from "lucide-react";

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
      {/* Formulário à esquerda no registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo visível em mobile */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-2">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Fazenda São Bento" className="w-24 h-24 object-contain" />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Fazenda São Bento
            </h1>
          </div>

          <div>
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

      {/* Painel direito — identidade visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-[hsl(103,57%,10%)] via-[hsl(103,52%,16%)] to-[hsl(103,48%,22%)]" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Fazenda São Bento"
              className="w-52 h-52 object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h1 className="text-5xl font-bold text-white tracking-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Fazenda São Bento
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-xs mx-auto leading-relaxed">
              Junte-se à nossa equipe e otimize a produção.
            </p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 w-24 h-1 rounded-full"
            style={{ backgroundColor: 'hsl(28, 83%, 52%)' }}
          />
        </div>
      </div>
    </div>
  );
}
