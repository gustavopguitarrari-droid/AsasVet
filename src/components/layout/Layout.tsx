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
import ChatDialog from "@/components/ChatDialog";
import FloatingCashierButton from "@/components/FloatingCashierButton"; // NOVO: Importar o botão do caixa
import CashierDialog from "@/components/CashierDialog"; // NOVO: Importar o diálogo do caixa

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [isCashierDialogOpen, setIsCashierDialogOpen] = React.useState(false); // NOVO: Estado para o diálogo do caixa

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChatButtonClick = () => {
    setIsChatDialogOpen(true);
  };

  const handleCashierButtonClick = () => { // NOVO: Handler para o botão do caixa
    setIsCashierDialogOpen(true);
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
      <FloatingCashierButton onClick={handleCashierButtonClick} /> {/* NOVO: Botão do caixa */}
      <FloatingChatButton onClick={handleChatButtonClick} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
      <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} /> {/* NOVO: Diálogo do caixa */}
    </div>
  );
};

export default Layout;