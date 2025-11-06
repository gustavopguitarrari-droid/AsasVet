import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ColorThemeProvider } from "./context/ColorThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Removido: import ErrorBoundary from "./components/ErrorBoundary.tsx"; // Importar ErrorBoundary

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  // Removido: <ErrorBoundary> {/* Adicionado ErrorBoundary aqui */}
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
        <UserProvider>
          <ColorThemeProvider>
            <App />
          </ColorThemeProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  // Removido: </ErrorBoundary>
);