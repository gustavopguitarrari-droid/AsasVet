import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ColorThemeProvider } from "./context/ColorThemeContext.tsx"; // Importa o ColorThemeProvider

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
    <ColorThemeProvider> {/* Envolve o App com o ColorThemeProvider */}
      <UserProvider>
        <App />
      </UserProvider>
    </ColorThemeProvider>
  </ThemeProvider>
);