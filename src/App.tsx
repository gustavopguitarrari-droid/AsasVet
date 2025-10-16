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
import MedicalRecords from "./pages/MedicalRecords";
import Financeiro from "./pages/Financeiro"; // Nova importação
import Caixa from "./pages/Caixa"; // Nova importação
import Internacao from "./pages/Internacao"; // Nova importação
import Veterinarios from "./pages/Veterinarios"; // Nova importação
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
            path="/dashboard"
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
                <MedicalRecords />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;