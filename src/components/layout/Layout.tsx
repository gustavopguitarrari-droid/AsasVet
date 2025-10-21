import React from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { cn } from "@/lib/utils";
import FloatingChatButton from "@/components/FloatingChatButton";
import ChatDialog from "@/components/ChatDialog"; // Importar o novo componente ChatDialog

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false); // Novo estado para o diálogo do chat

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChatButtonClick = () => {
    setIsChatDialogOpen(true); // Abre o diálogo do chat
  };

  // Ajusta os tamanhos do sidebar com base no estado de recolhimento
  const sidebarSize = isSidebarCollapsed ? 6 : 18;
  const sidebarMinSize = sidebarSize;
  const sidebarMaxSize = sidebarSize;

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
        </ResizablePanel>
        <ResizablePanel defaultSize={100 - sidebarSize}>
          <div className="flex h-full flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <FloatingChatButton onClick={handleChatButtonClick} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} /> {/* Renderiza o ChatDialog */}
    </div>
  );
};

export default Layout;