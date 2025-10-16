import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button"; // Importar Button
import { ChevronLeft, ChevronRight } from "lucide-react"; // Importar ícones
import { cn } from "@/lib/utils"; // Importar cn

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarSize = isSidebarCollapsed ? 5 : 18;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="relative"> {/* Adicionado relative para posicionamento absoluto do botão */}
        <ResizablePanel
          defaultSize={sidebarSize}
          minSize={sidebarSize}
          maxSize={sidebarSize}
          className="transition-all duration-300 ease-in-out"
        >
          <Sidebar isCollapsed={isSidebarCollapsed} /> {/* onToggleCollapse não é mais necessário aqui */}
        </ResizablePanel>
        {/* A ResizableHandle foi removida */}
        <ResizablePanel defaultSize={100 - sidebarSize}> {/* Ajusta o tamanho do painel de conteúdo */}
          <div className="flex h-full flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>

        {/* Botão de recolher/expandir a sidebar movido para cá */}
        <Button
          variant="default"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full z-20", // z-index aumentado para garantir que fique acima
            "h-8 w-8", // Tamanho fixo para o botão
            isSidebarCollapsed ? "left-[5%] -translate-x-1/2" : "left-[18%] -translate-x-1/2", // Posiciona na borda da sidebar
            "transition-all duration-300 ease-in-out" // Adiciona transição para o movimento
          )}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;