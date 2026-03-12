import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Home, Wheat, Truck, Tractor, MoreHorizontal, Fuel, Package, Users, Container } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const PRIMARY_ITEMS = [
  { title: "Início", icon: Home, path: "/" },
  { title: "Colheita", icon: Wheat, path: "/colheita" },
  { title: "Transporte", icon: Truck, path: "/transporte" },
  { title: "Máquinas", icon: Tractor, path: "/maquinas" },
];

const MORE_ITEMS = [
  { title: "Abastecimento", icon: Fuel, path: "/abastecimento" },
  { title: "Estoque", icon: Package, path: "/estoque" },
];

const ADMIN_ITEMS = [
  { title: "Caminhões", icon: Container, path: "/caminhoes" },
  { title: "Usuários", icon: Users, path: "/usuarios" },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { user } = useAuth();

  const extraItems = [
    ...MORE_ITEMS,
    ...(user?.role === "admin" ? ADMIN_ITEMS : []),
  ];

  const isMoreActive = extraItems.some((item) => item.path === location);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around h-[4.25rem] px-1 pb-safe">
          {PRIMARY_ITEMS.map((item) => {
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full py-2 transition-all duration-150 active:scale-95"
              >
                <div className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-150 ${isActive ? "bg-primary/12" : ""}`}>
                  <item.icon
                    className={`w-[22px] h-[22px] transition-all duration-150 ${isActive ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-[1.8]"}`}
                  />
                </div>
                <span className={`text-[10px] font-semibold leading-none transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full py-2 transition-all duration-150 active:scale-95"
          >
            <div className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all ${isMoreActive ? "bg-primary/12" : ""}`}>
              <MoreHorizontal
                className={`w-[22px] h-[22px] transition-all ${isMoreActive ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-[1.8]"}`}
              />
            </div>
            <span className={`text-[10px] font-semibold leading-none transition-colors ${isMoreActive ? "text-primary" : "text-muted-foreground"}`}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-2">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <SheetHeader className="text-left mb-4 px-1">
            <SheetTitle className="text-base text-muted-foreground font-medium">Módulos</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {extraItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? "bg-primary/15" : "bg-muted"}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  {item.title}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
