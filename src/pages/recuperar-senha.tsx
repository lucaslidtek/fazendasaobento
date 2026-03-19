import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecuperarSenha() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Painel esquerdo — desktop */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
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
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <motion.img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Fazenda São Bento"
            className="w-48 h-48 object-contain drop-shadow-2xl mb-8"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.45 }}
          />
        </div>
      </div>

      {/* Painel de conteúdo */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile: cabeçalho */}
        <div
          className="lg:hidden relative overflow-hidden flex-shrink-0"
          style={{
            background: "linear-gradient(160deg, hsl(103,57%,12%) 0%, hsl(103,52%,19%) 100%)",
            minHeight: "140px",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center py-8 px-6">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Fazenda São Bento"
              className="w-14 h-14 object-contain mb-2 drop-shadow-lg"
            />
            <h1
              className="text-xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Fazenda São Bento
            </h1>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-3xl" />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-8 pt-6 lg:pt-0 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-[400px] space-y-6"
          >
            <div>
              <h2
                className="text-2xl font-bold tracking-tight text-foreground mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recuperar Senha
              </h2>
              <p className="text-muted-foreground text-sm">
                Precisa de ajuda para acessar sua conta?
              </p>
            </div>

            <div className="bg-[hsl(var(--warning-subtle))] border border-transparent rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[hsl(var(--warning)/0.12)] rounded-xl p-2 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-[hsl(var(--warning-text))]" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm">Como recuperar sua senha</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Para redefinir sua senha, entre em contato com o{" "}
                    <strong className="text-foreground">administrador do sistema</strong> da Fazenda São Bento.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--warning)/0.2)] space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">O administrador poderá:</p>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-none">
                  {[
                    "Redefinir sua senha diretamente no sistema",
                    "Criar um novo acesso para você",
                    "Verificar seu perfil na seção de Usuários",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
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
    </div>
  );
}
