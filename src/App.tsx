import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import "./lib/fetch-interceptor";

import Login from "@/pages/login";
import Register from "@/pages/register";
import RecuperarSenha from "@/pages/recuperar-senha";
import Dashboard from "@/pages/dashboard";
import Colheita from "@/pages/colheita";
import Transporte from "@/pages/transporte";
import Maquinas from "@/pages/maquinas";
import MaquinaDetalhes from "@/pages/maquina-detalhes";
import Caminhoes from "@/pages/caminhoes";
import CaminhaoDetalhes from "@/pages/caminhao-detalhes";
import Culturas from "@/pages/culturas";
import CulturaDetalhes from "@/pages/cultura-detalhes";
import Abastecimento from "@/pages/abastecimento";
import Estoque from "@/pages/estoque";
import EstoqueDetalhes from "@/pages/estoque-detalhes";
import Usuarios from "@/pages/usuarios";
import UsuarioDetalhes from "@/pages/usuario-detalhes";
import Safras from "@/pages/safras";
import SafraDetalhes from "@/pages/safra-detalhes";
import Talhoes from "@/pages/talhoes";
import TalhaoDetalhes from "@/pages/talhao-detalhes";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/colheita" component={Colheita} />
      <Route path="/transporte" component={Transporte} />
      <Route path="/maquinas" component={Maquinas} />
      <Route path="/maquinas/:id" component={MaquinaDetalhes} />
      <Route path="/caminhoes" component={Caminhoes} />
      <Route path="/caminhoes/:id" component={CaminhaoDetalhes} />
      <Route path="/culturas" component={Culturas} />
      <Route path="/culturas/:id" component={CulturaDetalhes} />
      <Route path="/abastecimento" component={Abastecimento} />
      <Route path="/estoque" component={Estoque} />
      <Route path="/estoque/:id" component={EstoqueDetalhes} />
      <Route path="/usuarios" component={Usuarios} />
      <Route path="/usuarios/:id" component={UsuarioDetalhes} />
      <Route path="/safras" component={Safras} />
      <Route path="/safras/:id" component={SafraDetalhes} />
      <Route path="/talhoes" component={Talhoes} />
      <Route path="/talhoes/:id" component={TalhaoDetalhes} />
      <Route path="/perfil" component={UsuarioDetalhes} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
