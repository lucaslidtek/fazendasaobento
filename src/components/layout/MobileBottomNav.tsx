import { Link, useLocation } from "wouter";
import { Home, Wheat, Truck, Tractor, Fuel } from "lucide-react";

const TAB_ITEMS = [
  { title: "Início",     icon: Home,    path: "/" },
  { title: "Colheita",   icon: Wheat,   path: "/colheita" },
  { title: "Transporte", icon: Truck,   path: "/transporte" },
  { title: "Máquinas",   icon: Tractor, path: "/maquinas" },
  { title: "Diesel",     icon: Fuel,    path: "/abastecimento" },
];

export function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
      <div className="flex items-center justify-around h-[4.25rem] px-1">
        {TAB_ITEMS.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center justify-center flex-1 h-full transition-all duration-150 active:scale-95"
            >
              <div className={`flex flex-col items-center justify-center gap-1 w-full max-w-[4.5rem] h-[3.5rem] rounded-2xl transition-colors duration-200 ${isActive ? "bg-primary/12" : "bg-transparent"}`}>
                <item.icon
                  className={`w-[22px] h-[22px] transition-all duration-200 ${isActive ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-[1.8]"}`}
                />
                <span className={`text-[10px] font-semibold leading-none transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
