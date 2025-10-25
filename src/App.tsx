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
import ProtectedRoute from "./components/ProtectedRoute"; // Importar o ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Envolve todo o aplicativo com o SessionContextProvider */}
          <Routes>
            <Route path="/login" element={<Login />} /> {/* Rota para a página de Login (não protegida) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cadastro"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Cadastro />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultas"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Appointments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AgendamentosMedicos />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/financeiro"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Financeiro />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/caixa"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Caixa />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/internacao"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Internacao />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/veterinarios"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Veterinarios />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/estoque"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Estoque />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
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