import { Link, useLocation } from "wouter";
import {
  Home,
  Wheat,
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
  Wallet,
  Activity,
  BarChart3,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFarm } from "@/contexts/FarmContext";

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
  const { safras, talhoes, selectedSafraId, setSelectedSafraId, selectedTalhaoId, setSelectedTalhaoId } = useFarm();

  const handleLogout = () => {
    apiLogout(undefined, { onSettled: () => localLogout() });
  };

  const menuItems = [
    { title: "Dashboard",     icon: Home,      path: "/" },
    { title: "Colheita",      icon: Wheat,     path: "/colheita" },
    { title: "Máquinas",      icon: Tractor,   path: "/maquinas" },
    { title: "Abastecimento", icon: Fuel,      path: "/abastecimento" },
    { title: "Estoque",       icon: Package,   path: "/estoque" },
    { title: "Financeiro",    icon: Wallet,    path: "/financeiro" },
    { title: "Atividades",    icon: Activity,  path: "/atividades" },
    { title: "Relatórios",    icon: BarChart3, path: "/relatorios" },
  ];

  const isMobile = useIsMobile();
  const bottomNavPaths = ["/", "/colheita", "/financeiro", "/relatorios", "/maquinas"];
  const visibleMenuItems = isMobile 
    ? menuItems.filter(item => !bottomNavPaths.includes(item.path))
    : menuItems;

  const adminItems = [
    { title: "Safras",    icon: CalendarDays, path: "/safras" },
    { title: "Talhões",   icon: Map,          path: "/talhoes" },
    { title: "Caminhões", icon: Container,    path: "/caminhoes" },
    { title: "Culturas",  icon: Sprout,       path: "/culturas" },
    { title: "Funcionários", icon: Users,     path: "/usuarios" },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
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

        {/* ── Context Selectors (Safra & Talhão) ── */}
        <SidebarGroup className="pt-3 pb-0 group-data-[collapsible=icon]:hidden">
          <div className="px-3 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-sidebar-foreground/80">Safra</label>
              <Select value={selectedSafraId?.toString() || ""} onValueChange={(val) => {
                setSelectedSafraId(Number(val));
                setSelectedTalhaoId(null); // Reset talhão when safra changes
              }}>
                <SelectTrigger className="h-10 text-sm font-semibold bg-white text-sidebar border-none hover:bg-zinc-50 focus:ring-0 rounded-lg">
                  <SelectValue placeholder="Selecione a safra" />
                </SelectTrigger>
                <SelectContent>
                  {safras.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-sidebar-foreground/80">Área / Talhão</label>
              <Select value={selectedTalhaoId?.toString() || "all"} onValueChange={(val) => setSelectedTalhaoId(val === "all" ? null : Number(val))}>
                <SelectTrigger className="h-10 text-sm font-semibold bg-white text-sidebar border-none hover:bg-zinc-50 focus:ring-0 rounded-lg">
                  <SelectValue placeholder="Visão Geral (Todos)" />
                </SelectTrigger>
                <SelectContent className="text-sidebar">
                  <SelectItem value="all">Visão Geral (Todos)</SelectItem>
                  {talhoes.filter((t: any) => t.safraId === selectedSafraId).map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SidebarGroup>

        {/* ── Main nav ── */}
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-wider font-semibold text-[10px] px-4 mb-1">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    tooltip={item.title}
                    className="transition-colors py-5 mx-2 rounded-xl group-data-[collapsible=icon]:mx-1"
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
                      className="transition-colors py-5 mx-2 rounded-xl group-data-[collapsible=icon]:mx-1"
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
