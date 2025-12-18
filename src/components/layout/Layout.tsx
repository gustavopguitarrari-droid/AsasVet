"use client";

import React, { useRef } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad }
 from "@/components/made-with-dyad";
import { cn } from "@/lib/utils";
import FloatingChatButton from "@/components/FloatingChatButton";
import ChatDialog from "@/components/ChatDialog";
import CashierDialog from "@/components/CashierDialog";
import DemoModeBanner from "@/components/DemoModeBanner";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";

interface LayoutProps {
  children: React.ReactNode; // Added children prop
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavCollapsed, setIsNavCollapsed] = React.useState(true); // Inicia recolhido
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [isCashierDialogOpen, setIsCashierDialogOpen] = React.useState(false);
  const { user } = useUser();
  const { pageTitle } = usePageTitle();

  const sidebarPanelRef = useRef<React.ElementRef<typeof ResizablePanel>>(null); // Criar a ref para o painel da sidebar

  const toggleNav = () => {
    if (sidebarPanelRef.current) {
      if (isNavCollapsed) {
        sidebarPanelRef.current.expand(); // Expande o painel
      } else {
        sidebarPanelRef.current.collapse(); // Recolhe o painel
      }
      // O estado `isNavCollapsed` será atualizado pelos callbacks `onCollapse` e `onExpand` do ResizablePanel
      // Não precisamos mais alterná-lo manualmente aqui.
    }
  };

  const handleChatButtonClick = () => {
    setIsChatDialogOpen(true);
  };

  const handleCashierButtonClick = () => {
    setIsCashierDialogOpen(true);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex h-screen w-screen overflow-hidden"
    >
      <ResizablePanel
        ref={sidebarPanelRef} // Atribuir a ref ao ResizablePanel
        defaultSize={12} // Ajustado de 15 para 12
        collapsedSize={5} // Ajustado de 6 para 5
        collapsible={true}
        onCollapse={() => setIsNavCollapsed(true)} // Atualiza o estado quando o painel recolhe
        onExpand={() => setIsNavCollapsed(false)}   // Atualiza o estado quando o painel expande
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out",
          "rounded-r-xl shadow-lg" // Adicionado rounded-r-xl e shadow-lg
        )}
      >
        <Sidebar isCollapsed={isNavCollapsed} onToggleCollapse={toggleNav} />
      </ResizablePanel>
      <ResizablePanel className="bg-background">
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          <Header onCashierClick={handleCashierButtonClick} />
          <div className="flex-1 overflow-y-auto px-4"> {/* Adicionado px-4 aqui */}
            <main className="flex flex-col">{children}</main>
          </div>
          <MadeWithDyad />
        </div>
      </ResizablePanel>

      <FloatingChatButton onClick={handleChatButtonClick} onClose={() => setIsChatDialogOpen(false)} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
      <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} />
      {user?.isDemoMode && <DemoModeBanner />}
    </ResizablePanelGroup>
  );
};

export default Layout;