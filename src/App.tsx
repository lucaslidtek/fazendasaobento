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
import Caminhoes from "@/pages/caminhoes";
import Abastecimento from "@/pages/abastecimento";
import Estoque from "@/pages/estoque";
import Usuarios from "@/pages/usuarios";
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
      <Route path="/colheita" component={Colheita} />
      <Route path="/transporte" component={Transporte} />
      <Route path="/maquinas" component={Maquinas} />
      <Route path="/caminhoes" component={Caminhoes} />
      <Route path="/abastecimento" component={Abastecimento} />
      <Route path="/estoque" component={Estoque} />
      <Route path="/usuarios" component={Usuarios} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
