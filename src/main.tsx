import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { UserProvider } from "./context/UserContext.tsx";
import { ColorThemeProvider } from "./context/ColorThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary.tsx"; // Importar ErrorBoundary

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary> {/* Adicionado ErrorBoundary aqui */}
    <QueryClientProvider client={queryClient}>
      {/* ThemeProvider removido */}
        <UserProvider>
          <ColorThemeProvider>
            <App />
          </ColorThemeProvider>
        </UserProvider>
      {/* ThemeProvider removido */}
    </QueryClientProvider>
  </ErrorBoundary>
);