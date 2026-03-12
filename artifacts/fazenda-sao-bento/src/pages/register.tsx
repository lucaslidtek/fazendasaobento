import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const registerSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["admin", "operador"]).default("operador"),
});

export default function Register() {
  const { loginDemo } = useAuth();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "operador" },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    loginDemo({
      id: Math.floor(Math.random() * 1000),
      name: data.name,
      email: data.email,
      role: data.role as "admin" | "operador",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Fazenda São Bento" className="w-20 h-20 object-contain mb-3" />
            <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Fazenda São Bento</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Criar conta</h2>
            <p className="text-muted-foreground text-sm">Preencha os dados para se registrar no sistema.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" className="h-9 bg-background" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" className="h-9 bg-background" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-9 bg-background" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 bg-background">
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-10 font-semibold rounded-lg mt-2">
                Registrar
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já possui conta?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(150deg, hsl(103,57%,11%) 0%, hsl(103,52%,17%) 60%, hsl(103,48%,23%) 100%)"
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <motion.img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Fazenda São Bento"
            className="w-48 h-48 object-contain drop-shadow-2xl mb-8"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-[2.6rem] font-bold text-white tracking-tight leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Fazenda São Bento
            </h1>
            <p className="text-lg text-white/60 font-medium max-w-[260px] mx-auto leading-relaxed">
              Junte-se à nossa equipe e otimize a produção.
            </p>
          </motion.div>
          <motion.div
            className="mt-8 w-16 h-[3px] rounded-full"
            style={{ backgroundColor: 'hsl(28, 83%, 52%)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45 }}
          />
        </div>
      </div>
    </div>
  );
}
