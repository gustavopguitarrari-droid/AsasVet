import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ColorThemeProvider } from "./context/ColorThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
    <UserProvider> {/* UserProvider deve envolver o ColorThemeProvider */}
      <ColorThemeProvider>
        <App />
      </ColorThemeProvider>
    </UserProvider>
  </ThemeProvider>
);