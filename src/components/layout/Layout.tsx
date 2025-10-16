import React from "react";
import {
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

  // Ajusta os tamanhos do sidebar com base no estado de recolhimento
  const sidebarSize = isSidebarCollapsed ? 5 : 18;
  // minSize e maxSize devem ser os mesmos que defaultSize para fixar o tamanho do painel
  const sidebarMinSize = sidebarSize;
  const sidebarMaxSize = sidebarSize;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={sidebarSize}
          minSize={sidebarMinSize}
          maxSize={sidebarMaxSize}
          className="transition-all duration-300 ease-in-out relative" // Adiciona 'relative' para posicionamento absoluto do botão
        >
          <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
          {/* O botão de recolher/expandir é posicionado aqui, relativo a este painel */}
          <Button
            variant="default"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full z-20", // z-index maior para garantir que fique por cima
              "right-[-20px]", // Posiciona-o metade para fora, metade para dentro da borda do painel do sidebar
              "bg-indigo-500 text-white hover:bg-indigo-600", // Alterado para uma cor mais vibrante
              "border border-border shadow-md" // Adiciona borda e sombra para parecer um botão distinto
            )}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </ResizablePanel>
        {/* O segundo ResizablePanel ocupará automaticamente o espaço restante */}
        <ResizablePanel defaultSize={100 - sidebarSize}>
          <div className="flex h-full flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;