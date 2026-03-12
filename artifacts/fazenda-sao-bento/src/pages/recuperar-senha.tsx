import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecuperarSenha() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(103,57%,10%)] via-[hsl(103,52%,16%)] to-[hsl(103,48%,22%)]" />
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
              Gestão agrícola inteligente, do plantio à colheita.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex flex-col items-center gap-3 mb-2">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Fazenda São Bento" className="w-24 h-24 object-contain" />
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Recuperar Senha</h2>
            <p className="text-muted-foreground mt-2 text-lg">Precisa de ajuda para acessar sua conta?</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-secondary/10 rounded-xl p-2.5 flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Como recuperar sua senha</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para redefinir sua senha, entre em contato com o <strong className="text-foreground">administrador do sistema</strong> da Fazenda São Bento.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 space-y-2">
              <p className="text-sm font-semibold text-foreground">O administrador poderá:</p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-none">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  Redefinir sua senha diretamente no sistema
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  Criar um novo acesso para você
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  Verificar seu perfil na seção de Usuários
                </li>
              </ul>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full h-12 rounded-xl font-semibold">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
