import { Link, useLocation } from "wouter";
import {
  Home,
  Wheat,
  Truck,
  Tractor,
  Fuel,
  Package,
  Users,
  LogOut,
  Container,
  PanelLeftClose,
  PanelLeftOpen,
  Sprout,
  CalendarDays,
  Map,
  MoreVertical,
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";

function ToggleButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
    >
      {state === "expanded"
        ? <PanelLeftClose className="w-4 h-4" />
        : <PanelLeftOpen className="w-4 h-4" />}
    </button>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout: localLogout } = useAuth();
  const { mutate: apiLogout } = useLogout();

  const handleLogout = () => {
    apiLogout(undefined, { onSettled: () => localLogout() });
  };

  const menuItems = [
    { title: "Dashboard",     icon: Home,    path: "/" },
    { title: "Colheita",      icon: Wheat,   path: "/colheita" },
    { title: "Transporte",    icon: Truck,   path: "/transporte" },
    { title: "Máquinas",      icon: Tractor, path: "/maquinas" },
    { title: "Abastecimento", icon: Fuel,    path: "/abastecimento" },
    { title: "Estoque",       icon: Package, path: "/estoque" },
  ];

  const adminItems = [
    { title: "Safras",    icon: CalendarDays, path: "/safras" },
    { title: "Talhões",   icon: Map,          path: "/talhoes" },
    { title: "Caminhões", icon: Container,    path: "/caminhoes" },
    { title: "Culturas",  icon: Sprout,       path: "/culturas" },
    { title: "Usuários",  icon: Users,        path: "/usuarios" },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r-0 shadow-xl">
      <SidebarContent className="bg-sidebar">

        {/* ── Header: logo + toggle ── */}
        <div className="flex items-center gap-3 border-b border-sidebar-border/30 px-4 py-4
                        group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center
                        group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:gap-2">
          <img
            src={`${(import.meta as any).env.BASE_URL}logo.png`}
            alt="Fazenda São Bento"
            className="w-9 h-9 object-contain flex-shrink-0"
          />
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <h2 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">Fazenda</h2>
            <p className="text-sidebar-primary text-sm font-bold leading-tight">São Bento</p>
            <p className="text-sidebar-foreground/40 text-[10px] font-medium leading-tight uppercase tracking-wider">Agronegócios</p>
          </div>
          <ToggleButton />
        </div>

        {/* ── Main nav ── */}
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-wider font-semibold text-[10px] px-4 mb-1">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    tooltip={item.title}
                    className="hover-elevate transition-all duration-200 py-5 mx-2 rounded-xl group-data-[collapsible=icon]:mx-1"
                  >
                    <Link href={item.path} className="flex items-center gap-3 text-sidebar-foreground/75 hover:text-sidebar-foreground">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Admin nav ── */}
        {user?.role === "admin" && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-wider font-semibold text-[10px] px-4 mb-1">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.path}
                      tooltip={item.title}
                      className="hover-elevate transition-all duration-200 py-5 mx-2 rounded-xl group-data-[collapsible=icon]:mx-1"
                    >
                      <Link href={item.path} className="flex items-center gap-3 text-sidebar-foreground/75 hover:text-sidebar-foreground">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
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

      {/* ── Footer: avatar + dropdown ── */}
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border/30 p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link 
            href="/perfil"
            className="flex flex-1 items-center gap-3 px-2 py-2 hover:bg-sidebar-accent/50 rounded-lg transition-colors cursor-pointer group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{user?.role}</p>
            </div>
          </Link>
          
          <div className="group-data-[collapsible=icon]:hidden flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mb-2">
                <DropdownMenuItem asChild className="cursor-pointer gap-2">
                   <Link href="/perfil" className="flex items-center w-full">
                     <Users className="w-4 h-4" />
                     <span>Ver perfil</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer gap-2">
                  <LogOut className="w-4 h-4" />
                  Sair do sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
