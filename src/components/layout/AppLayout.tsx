import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Visão Geral",
  "/colheita": "Colheita",
  "/maquinas": "Máquinas",
  "/abastecimento": "Abastecimento",
  "/estoque": "Estoque",
  "/caminhoes": "Caminhões",
  "/usuarios": "Usuários",
};

function MobileHeader({ title, showBack, backTo }: { title: string, showBack?: boolean, backTo?: string }) {
  const { setOpenMobile } = useSidebar();
  const [, setLocation] = useLocation();

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-sidebar sticky top-0 z-10 md:hidden">
      {showBack ? (
        <button
          onClick={() => {
            if (backTo) setLocation(backTo);
            else window.history.back();
          }}
          aria-label="Voltar"
          className="p-1.5 -ml-1 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors flex-shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setOpenMobile(true)}
          aria-label="Abrir menu"
          className="p-1.5 -ml-1 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2"  y1="5"  x2="18" y2="5"   />
            <line x1="2"  y1="10" x2="18" y2="10"  />
            <line x1="2"  y1="15" x2="18" y2="15"  />
          </svg>
        </button>
      )}

      <div className="flex items-center gap-2 flex-1">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="São Bento"
          className="w-6 h-6 object-contain"
        />
        <span className="font-bold text-base text-sidebar-foreground tracking-tight">
          {title}
        </span>
      </div>
    </header>
  );
}

export function AppLayout({ 
  children,
  title,
  showBack,
  backTo
}: { 
  children: React.ReactNode,
  title?: string,
  showBack?: boolean,
  backTo?: string
}) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const pageTitle = PAGE_TITLES[location] ?? "Fazenda São Bento";

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background/50">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MobileHeader title={title || pageTitle} showBack={showBack} backTo={backTo} />

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 lg:pb-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </SidebarProvider>
  );
}
