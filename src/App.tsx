import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";
import AgendamentosMedicos from "./pages/AgendamentosMedicos";
import Financeiro from "./pages/Financeiro";
import Caixa from "./pages/Caixa";
import Internacao from "./pages/Internacao";
import Veterinarios from "./pages/Veterinarios";
import Estoque from "./pages/Estoque"; // Importação da nova página de Estoque
import Profile from "./pages/Profile"; // Importação da nova página de Perfil
import Settings from "./pages/Settings"; // Importação da nova página de Configurações
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/painel"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/clients"
            element={
              <Layout>
                <Clients />
              </Layout>
            }
          />
          <Route
            path="/pets"
            element={
              <Layout>
                <Pets />
              </Layout>
            }
          />
          <Route
            path="/consultas"
            element={
              <Layout>
                <Appointments />
              </Layout>
            }
          />
          <Route
            path="/medical-records"
            element={
              <Layout>
                <AgendamentosMedicos />
              </Layout>
            }
          />
          <Route
            path="/financeiro"
            element={
              <Layout>
                <Financeiro />
              </Layout>
            }
          />
          <Route
            path="/caixa"
            element={
              <Layout>
                <Caixa />
              </Layout>
            }
          />
          <Route
            path="/internacao"
            element={
              <Layout>
                <Internacao />
              </Layout>
            }
          />
          <Route
            path="/veterinarios"
            element={
              <Layout>
                <Veterinarios />
              </Layout>
            }
          />
          <Route
            path="/estoque" // Nova rota para Estoque
            element={
              <Layout>
                <Estoque />
              </Layout>
            }
          />
          <Route
            path="/profile" // Nova rota para Perfil
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/settings" // Nova rota para Configurações
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;