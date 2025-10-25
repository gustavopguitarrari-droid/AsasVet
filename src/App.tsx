import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import Appointments from "./pages/Appointments";
import AgendamentosMedicos from "./pages/AgendamentosMedicos";
import Financeiro from "./pages/Financeiro";
import Caixa from "./pages/Caixa";
import Internacao from "./pages/Internacao";
import Veterinarios from "./pages/Veterinarios";
import Estoque from "./pages/Estoque";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Importar a página de Login
import { SessionContextProvider } from "./context/SessionContext"; // Importar o SessionContextProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Envolve todo o aplicativo com o SessionContextProvider */}
          <Routes>
            <Route path="/login" element={<Login />} /> {/* Rota para a página de Login */}
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
              path="/cadastro"
              element={
                <Layout>
                  <Cadastro />
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
              path="/estoque"
              element={
                <Layout>
                  <Estoque />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;