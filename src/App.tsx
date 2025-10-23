import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes"; // Renomeado de Clients para Clientes
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";
import AgendamentosMedicos from "./pages/AgendamentosMedicos";
import Financeiro from "./pages/Financeiro";
import Caixa from "./pages/Caixa";
import Internacao from "./pages/Internacao";
import Veterinarios from "./pages/Veterinarios";
import Estoque from "./pages/Estoque";
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
            path="/clientes" {/* Rota atualizada para /clientes */}
            element={
              <Layout>
                <Clientes />
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
            path="/appointments"
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
            path="/estoque"
            element={
              <Layout>
                <Estoque />
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