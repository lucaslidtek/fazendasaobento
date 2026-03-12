import { Link, useLocation } from "wouter";
import { 
  Home, 
  Wheat, 
  Truck, 
  Tractor, 
  Fuel, 
  Package, 
  Users, 
  LogOut 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout: localLogout } = useAuth();
  const { mutate: apiLogout } = useLogout();

  const handleLogout = () => {
    apiLogout(undefined, {
      onSettled: () => localLogout()
    });
  };

  const menuItems = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Colheita", icon: Wheat, path: "/colheita" },
    { title: "Transporte", icon: Truck, path: "/transporte" },
    { title: "Máquinas", icon: Tractor, path: "/maquinas" },
    { title: "Abastecimento", icon: Fuel, path: "/abastecimento" },
    { title: "Estoque", icon: Package, path: "/estoque" },
  ];

  const adminItems = [
    { title: "Caminhões", icon: Truck, path: "/caminhoes" },
    { title: "Usuários", icon: Users, path: "/usuarios" },
  ];

  return (
    <Sidebar className="border-r-0 shadow-xl">
      <SidebarContent className="bg-sidebar">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo.png`} 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">Fazenda</h2>
            <p className="text-sidebar-primary text-sm font-medium -mt-1">São Bento</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider font-semibold text-xs">Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.path}
                    className="hover-elevate transition-all duration-200 py-5"
                  >
                    <Link href={item.path} className="flex items-center gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider font-semibold text-xs">Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.path}
                      className="hover-elevate transition-all duration-200 py-5"
                    >
                      <Link href={item.path} className="flex items-center gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sair do sistema
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
