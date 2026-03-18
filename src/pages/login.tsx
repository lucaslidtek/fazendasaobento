import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ChevronDown, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

const DEMO_ADMIN = {
  id: 1,
  name: "Admin Demo",
  email: "admin@fazendas.bento",
  role: "admin" as const,
  createdAt: new Date().toISOString(),
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const { loginDemo } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginDemo({ ...DEMO_ADMIN, name: "Usuário Google" });
    }, 800);
  };

  const handleEmailLogin = () => {
    loginDemo(DEMO_ADMIN);
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Painel esquerdo — identidade visual (apenas desktop) */}
      <div className="hidden lg:flex w-[42%] relative overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, hsl(103,57%,11%) 0%, hsl(103,52%,17%) 60%, hsl(103,48%,23%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <motion.img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Fazenda São Bento"
            className="w-48 h-48 object-contain drop-shadow-2xl mb-8"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1
              className="text-[2.6rem] font-bold text-white tracking-tight leading-tight mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Fazenda São Bento
            </h1>
            <p className="text-lg text-white/60 font-medium max-w-[260px] mx-auto leading-relaxed">
              Gestão agrícola inteligente, do plantio à colheita.
            </p>
          </motion.div>
          <motion.div
            className="mt-8 w-16 h-[3px] rounded-full"
            style={{ backgroundColor: "hsl(28, 83%, 52%)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          />
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile: cabeçalho com gradiente */}
        <div
          className="lg:hidden relative overflow-hidden flex-shrink-0"
          style={{
            background:
              "linear-gradient(160deg, hsl(103,57%,12%) 0%, hsl(103,52%,19%) 100%)",
            minHeight: "220px",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center py-10 px-6">
            <motion.img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Fazenda São Bento"
              className="w-20 h-20 object-contain drop-shadow-xl mb-4"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center"
            >
              <h1
                className="text-2xl font-bold text-white leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Fazenda São Bento
              </h1>
              <p className="text-sm text-white/55 mt-1 font-medium">
                Gestão agrícola inteligente
              </p>
            </motion.div>
          </div>
          {/* Curva inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-3xl" />
        </div>

        {/* Formulário */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-8 pt-8 lg:pt-0 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-[400px]"
          >
            <div className="mb-7">
              <h2
                className="text-2xl font-bold tracking-tight text-foreground mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bem-vindo de volta
              </h2>
              <p className="text-muted-foreground text-sm">
                Acesse o sistema de gestão da fazenda.
              </p>
            </div>

            <div className="space-y-3">
              {/* Botão Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-semibold transition-all hover:bg-muted/60 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{isLoading ? "Entrando..." : "Continuar com Google"}</span>
              </button>

              {/* Divisor */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Toggle e-mail/senha */}
              <button
                type="button"
                onClick={() => setShowEmailForm((v) => !v)}
                className="w-full flex items-center justify-center gap-2 h-12 px-4 rounded-xl border border-border bg-transparent text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground active:scale-[0.98]"
              >
                <span>Entrar com e-mail e senha</span>
                <motion.span
                  animate={{ rotate: showEmailForm ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              {/* Formulário expansível */}
              <AnimatePresence>
                {showEmailForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleEmailLogin)}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                  E-mail
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="seu@email.com"
                                    inputMode="email"
                                    autoComplete="email"
                                    className="h-11 text-sm"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                    Senha
                                  </FormLabel>
                                  <Link
                                    href="/recuperar-senha"
                                    className="text-xs text-primary hover:underline font-semibold"
                                  >
                                    Esqueceu?
                                  </Link>
                                </div>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="••••••••"
                                      autoComplete="current-password"
                                      className="h-11 text-sm pr-11"
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword((v) => !v)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full h-11 text-sm font-bold rounded-xl mt-1"
                          >
                            Entrar
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Ainda não tem acesso?{" "}
              <Link
                href="/register"
                className="text-primary font-bold hover:underline"
              >
                Solicitar cadastro
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
