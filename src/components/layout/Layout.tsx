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

  // Calcula o tamanho atual do sidebar com base no estado de recolhimento e direção do layout
  const currentSidebarSize = React.useMemo(() => {
    if (layoutDirection === "horizontal") {
      return isSidebarCollapsed ? 6 : 18; // 6% para recolhido, 18% para expandido
    }
    return 8; // Tamanho fixo para o menu superior (8% da altura)
  }, [isSidebarCollapsed, layoutDirection]);

  // Lida com o redimensionamento manual do sidebar pelo usuário
  const handleSidebarResize = (newSize: number) => {
    if (layoutDirection === "horizontal") {
      // Se o usuário redimensionar manualmente, atualiza o estado de recolhimento
      if (newSize <= 6) { // Considera "recolhido" se o tamanho for 6% ou menos
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    }
    // Para layout vertical, o redimensionamento é de altura e não afeta o estado de "recolhimento"
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction={layoutDirection}>
        <ResizablePanel
          size={currentSidebarSize} // Usar 'size' para controlar o tamanho dinamicamente
          onResize={handleSidebarResize} // Adicionar handler para redimensionamento manual
          minSize={layoutDirection === "horizontal" ? 6 : 8}
          maxSize={layoutDirection === "horizontal" ? 25 : 10}
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
        <ResizablePanel defaultSize={100 - currentSidebarSize}> {/* Ajustar defaultSize aqui */}
          <div className="flex h-full flex-col">
            {layoutDirection === "horizontal" && <Header layoutDirection={layoutDirection} />}
            <main className="flex-1 overflow-y-auto p-6">
              {layoutDirection === "vertical" && (
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