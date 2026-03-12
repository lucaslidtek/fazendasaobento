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
import { Loader2 } from "lucide-react";

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
      {/* Painel esquerdo — identidade visual da fazenda */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(103,57%,10%)] via-[hsl(103,52%,16%)] to-[hsl(103,48%,22%)]" />
        {/* Textura sutil de campo */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          {/* Logo grande centralizada */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-10"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Fazenda São Bento"
              className="w-52 h-52 object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white tracking-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Fazenda São Bento
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-xs mx-auto leading-relaxed">
              Gestão agrícola inteligente, do plantio à colheita.
            </p>
          </motion.div>

          {/* Linha decorativa laranja da logo */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 w-24 h-1 rounded-full"
            style={{ backgroundColor: 'hsl(28, 83%, 52%)' }}
          />
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo visível em mobile */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-2">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Fazenda São Bento"
              className="w-24 h-24 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Fazenda São Bento
            </h1>
          </div>

          <div>
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
                      <Input placeholder="seu@email.com" className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} />
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
                      <Link href="/recuperar-senha" className="text-sm text-primary hover:underline font-medium">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} />
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
