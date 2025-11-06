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
import Estoque from "./pages/Estoque";
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

// Removido: const queryClient = new QueryClient();

const App = () => (
  // Removido: <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SessionContextProvider>
          <PageTitleProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
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
                path="/financeiro"
                element={
                  <ProtectedRoute>
                    <Financeiro />
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
                path="/estoque"
                element={
                  <ProtectedRoute>
                    <Estoque />
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
  // Removido: </QueryClientProvider>
);

export default App;