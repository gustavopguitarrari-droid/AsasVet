import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { UserProvider } from "./context/UserContext.tsx"; // Importa o UserProvider

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
    <UserProvider> {/* Envolve o App com o UserProvider */}
      <App />
    </UserProvider>
  </ThemeProvider>
);