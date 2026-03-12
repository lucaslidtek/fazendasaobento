import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wheat } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const { mutate: loginMutation, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation({ data }, {
      onSuccess: (res) => {
        login(res.token);
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Erro no login", 
          description: err.message || "Credenciais inválidas" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/90 to-sidebar/40 z-10 mix-blend-multiply" />
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Fazenda" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-3 rounded-2xl">
              <Wheat className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold font-display">Fazenda São Bento</h1>
          </div>
          <p className="text-xl text-white/80 font-medium">Gestão agrícola inteligente, do plantio à colheita.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Acessar Sistema</h2>
            <p className="text-muted-foreground mt-2 text-lg">Insira suas credenciais para continuar.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" className="h-12 text-lg px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold">Senha</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12 text-lg px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200" 
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Entrar"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Criar conta
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
