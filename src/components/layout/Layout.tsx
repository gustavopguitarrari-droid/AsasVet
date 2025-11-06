"use client";

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
import FloatingCashierButton from "@/components/FloatingCashierButton";
import CashierDialog from "@/components/CashierDialog";
import DemoModeBanner from "@/components/DemoModeBanner";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [isCashierDialogOpen, setIsCashierDialogOpen] = React.useState(false);
  const { user } = useUser();
  const { pageTitle } = usePageTitle();

  const [layoutDirection, setLayoutDirection] = React.useState<"horizontal" | "vertical">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('layoutDirection') as "horizontal" | "vertical") || "horizontal";
    }
    return "horizontal";
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChatButtonClick = () => {
    setIsChatDialogOpen(true);
  };

  const handleCashierButtonClick = () => {
    setIsCashierDialogOpen(true);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* Sempre renderiza o Header principal, que agora condicionalmente inclui a navegação horizontal */}
      <Header layoutDirection={layoutDirection} />

      {layoutDirection === "horizontal" ? (
        // Layout horizontal: Sidebar vertical + Conteúdo principal (redimensionável)
        <div className="flex flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSize={280} // Largura padrão para sidebar vertical
              minSize={80}
              maxSize={280}
              className="transition-all duration-300 ease-in-out relative"
            >
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebar}
              />
            </ResizablePanel>
            <ResizablePanel defaultSize={720}> {/* Largura restante, assumindo 1000 total */}
              <div className="flex h-full flex-col">
                <main className="flex-1 overflow-y-auto p-6">
                  {children}
                </main>
                <MadeWithDyad />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        // Layout vertical: Header (inclui navegação horizontal) + Conteúdo principal (div simples)
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <main>{children}</main>
          </div>
          <MadeWithDyad />
        </div>
      )}

      <FloatingCashierButton onClick={handleCashierButtonClick} />
      <FloatingChatButton onClick={handleChatButtonClick} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
      <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} />
      {user?.isDemoMode && <DemoModeBanner />}
    </div>
  );
};

export default Layout;