import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Visão Geral",
  "/colheita": "Colheita",
  "/transporte": "Transporte",
  "/maquinas": "Máquinas",
  "/abastecimento": "Abastecimento",
  "/estoque": "Estoque",
  "/caminhoes": "Caminhões",
  "/usuarios": "Usuários",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
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
          <header className="h-14 flex items-center px-4 md:px-6 border-b border-border bg-background sticky top-0 z-10">
            <div className="flex md:hidden items-center gap-3 flex-1">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="São Bento"
                className="w-7 h-7 object-contain"
              />
              <span className="font-bold text-base text-foreground tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                {pageTitle}
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8">
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
