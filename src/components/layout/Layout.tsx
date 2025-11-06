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
import { usePageTitle } from "@/context/PageTitleContext"; // Importar usePageTitle

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [isCashierDialogOpen, setIsCashierDialogOpen] = React.useState(false);
  const { user } = useUser();
  const { pageTitle } = usePageTitle(); // Obter o título da página do contexto

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
      <Header layoutDirection={layoutDirection} />
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction={layoutDirection}>
          <ResizablePanel
            defaultSize={layoutDirection === "horizontal" ? 280 : 64}
            minSize={layoutDirection === "horizontal" ? 80 : 64}
            maxSize={layoutDirection === "horizontal" ? 280 : 64}
            className={cn(
              "transition-all duration-300 ease-in-out relative",
              layoutDirection === "vertical" && "flex-shrink-0"
            )}
          >
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebar}
              layoutDirection={layoutDirection}
            />
          </ResizablePanel>
          <ResizablePanel defaultSize={100 - (layoutDirection === "horizontal" ? 280 : 64)}>
            <div className="flex h-full flex-col">
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
              <MadeWithDyad />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <FloatingCashierButton onClick={handleCashierButtonClick} />
      <FloatingChatButton onClick={handleChatButtonClick} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
      <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} />
      {user?.isDemoMode && <DemoModeBanner />}
    </div>
  );
};

export default Layout;