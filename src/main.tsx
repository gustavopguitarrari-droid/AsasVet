import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ColorThemeProvider } from "./context/ColorThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Importar aqui

const queryClient = new QueryClient(); // Instanciar aqui

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}> {/* Agora é o provedor mais externo */}
    <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
      <UserProvider>
        <ColorThemeProvider>
          <App />
        </ColorThemeProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);