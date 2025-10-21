import React from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { cn } from "@/lib/utils";
import FloatingChatButton from "@/components/FloatingChatButton"; // Importar o novo componente

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Ajusta os tamanhos do sidebar com base no estado de recolhimento
  // Diminuído de 8 para 6 quando recolhido
  const sidebarSize = isSidebarCollapsed ? 6 : 18;
  // minSize e maxSize devem ser os mesmos que defaultSize para fixar o tamanho do painel
  const sidebarMinSize = sidebarSize;
  const sidebarMaxSize = sidebarSize;

  const handleChatButtonClick = () => {
    console.log("Botão de chat clicado!");
    // Futuramente, aqui será a lógica para abrir o chat
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={sidebarSize}
          minSize={sidebarMinSize}
          maxSize={sidebarMaxSize}
          className="transition-all duration-300 ease-in-out relative"
        >
          <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
          {/* O botão de recolher/expandir foi movido para o Sidebar.tsx */}
        </ResizablePanel>
        <ResizablePanel defaultSize={100 - sidebarSize}>
          <div className="flex h-full flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <FloatingChatButton onClick={handleChatButtonClick} /> {/* Adicionado o botão flutuante aqui */}
    </div>
  );
};

export default Layout;