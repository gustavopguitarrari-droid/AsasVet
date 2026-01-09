import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import Appointments from "./pages/Appointments";
import AgendamentosMedicos from "./pages/AgendamentosMedicos";
import Financeiro from "./pages/Financeiro"; // Restaurado
// import Caixa from "./pages/Caixa"; // Removido
import Internacao from "./pages/Internacao";
import Veterinarios from "./pages/Veterinarios";
import Products from "./pages/Products"; // Import the new Products page
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import ConsultationPage from "./pages/Consultation";
import SignUp from "./pages/SignUp";
import { SessionContextProvider } from "./context/SessionContext";
import ScrollToTop from "./components/ScrollToTop";
import { PageTitleProvider } from "./context/PageTitleContext";
import React from "react"; // Removido useState e useEffect, pois não são mais necessários para a animação
import Vendas from "./pages/Vendas"; // Importar a nova página de Vendas
import ContasAReceber from "./pages/ContasAReceber"; // Importar a nova página
import FluxoDeCaixa from "./pages/FluxoDeCaixa"; // Importar a nova página
import Reports from "./pages/Reports"; // Importar a nova página de Relatórios
import Despesas from "./pages/Despesas"; // Importar a nova página de Despesas
import Bulario from "./pages/Bulario"; // NOVO: Importar a página Bulário
import CeoDashboard from "./pages/CeoDashboard"; // NOVO: Importar o painel do CEO
import ResetPassword from "./pages/ResetPassword";

// Removido: const queryClient = new QueryClient();

const App = () => {
  // Removido: const [showLandingPage, setShowLandingPage] = useState(false);
  // Removido: useEffect para verificar sessionStorage
  // Removido: handleAnimationComplete

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SessionContextProvider>
          <PageTitleProvider>
            <ScrollToTop />
            <Routes>
              <Route
                path="/"
                element={<LandingPage />} // Renderiza a LandingPage diretamente
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/ceo-dashboard" element={<CeoDashboard />} />
              
              {/* Rotas Protegidas */}
              <Route
                path="/painel"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cadastro"
                element={
                  <ProtectedRoute>
                    <Cadastro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultas"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medical-records"
                element={
                  <ProtectedRoute>
                    <AgendamentosMedicos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/vendas"
                element={
                  <ProtectedRoute>
                    <Vendas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/contas-a-receber"
                element={
                  <ProtectedRoute>
                    <ContasAReceber />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/fluxo-de-caixa"
                element={
                  <ProtectedRoute>
                    <FluxoDeCaixa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/relatorios"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/despesas"
                element={
                  <ProtectedRoute>
                    <Despesas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <ProtectedRoute>
                    <Financeiro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bulario"
                element={
                  <ProtectedRoute>
                    <Bulario />
                  </ProtectedRoute>
                }
              />
              {/* Removida a rota /caixa */}
              <Route
                path="/internacao"
                element={
                  <ProtectedRoute>
                    <Internacao />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/veterinarios"
                element={
                  <ProtectedRoute>
                    <Veterinarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products" // NEW ROUTE
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultation/:appointmentId"
                element={
                  <ProtectedRoute>
                    <ConsultationPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTitleProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;