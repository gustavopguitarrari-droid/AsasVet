"use client";

import React from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle, // Re-adicionado
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad }
 from "@/components/made-with-dyad";
import { cn } from "@/lib/utils";
import FloatingChatButton from "@/components/FloatingChatButton";
import ChatDialog from "@/components/ChatDialog";
import FloatingCashierButton from "@/components/FloatingCashierButton";
import CashierDialog from "@/components/CashierDialog";
import DemoModeBanner from "@/components/DemoModeBanner";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavCollapsed, setIsNavCollapsed] = React.useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [isCashierDialogOpen, setIsCashierDialogOpen] = React.useState(false);
  const { user } = useUser();
  const { pageTitle } = usePageTitle();

  const toggleNav = () => {
    setIsNavCollapsed(prev => !prev);
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
        // Removido defaultSize e collapsedSize, pois o tamanho será controlado pelo 'size'
        collapsible={true}
        onCollapse={() => setIsNavCollapsed(true)}
        onExpand={() => setIsNavCollapsed(false)}
        size={isNavCollapsed ? 4 : 18} // Tamanho dinâmico baseado no estado
        minSize={4} // Adicionado minSize para evitar que o painel seja menor que o collapsedSize
        maxSize={18} // Adicionado maxSize para evitar que o painel seja maior que o defaultSize
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out",
        )}
      >
        <Sidebar isCollapsed={isNavCollapsed} onToggleCollapse={toggleNav} />
      </ResizablePanel>
      <ResizableHandle withHandle /> {/* Re-adicionado o handle */}
      <ResizablePanel
        size={isNavCollapsed ? 96 : 82} // Tamanho dinâmico para o conteúdo principal
        className="w-full"
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <main>{children}</main>
          </div>
          <MadeWithDyad />
        </div>
      </ResizablePanel>

      <FloatingCashierButton onClick={handleCashierButtonClick} />
      <FloatingChatButton onClick={handleChatButtonClick} onClose={() => setIsChatDialogOpen(false)} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
      <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} />
      {user?.isDemoMode && <DemoModeBanner />}
    </ResizablePanelGroup>
  );
};

export default Layout;