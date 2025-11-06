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

  // NOVO: Estado para a direção do layout, lido do localStorage
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

  // NOVO: Ajusta os tamanhos e a direção do painel com base em layoutDirection
  const sidebarSize = layoutDirection === "horizontal" ? (isSidebarCollapsed ? 6 : 18) : 8; // 8% de altura para o menu superior
  const sidebarMinSize = sidebarSize;
  const sidebarMaxSize = layoutDirection === "horizontal" ? sidebarSize : 10; // Max 10% para o menu superior

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction={layoutDirection}>
        <ResizablePanel
          defaultSize={sidebarSize}
          minSize={sidebarMinSize}
          maxSize={sidebarMaxSize}
          className={cn(
            "transition-all duration-300 ease-in-out relative",
            layoutDirection === "vertical" && "flex-shrink-0" // Garante que o painel superior não encolha
          )}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            layoutDirection={layoutDirection} // Passa a nova prop
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={100 - sidebarSize}>
          <div className="flex h-full flex-col">
            {layoutDirection === "horizontal" && <Header layoutDirection={layoutDirection} />} {/* Renderiza Header apenas se o menu for lateral */}
            <main className="flex-1 overflow-y-auto p-6">
              {layoutDirection === "vertical" && ( // Exibe o título da página se o menu for superior
                <h1 className="text-3xl font-bold mb-6">{pageTitle || "AsasVet"}</h1>
              )}
              {children}
            </main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <FloatingCashierButton onClick={handleCashierButtonClick} />
      <FloatingChatButton onClick={handleChatButtonClick} />
      <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
      <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} />
      {user?.isDemoMode && <DemoModeBanner />}
    </div>
  );
};

export default Layout;