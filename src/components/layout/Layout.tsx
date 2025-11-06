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
      return isSidebarCollapsed ? 80 : 280; // Tamanho em pixels para recolhido/expandido
    }
    return 64; // Altura em pixels para o menu superior
  }, [isSidebarCollapsed, layoutDirection]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction={layoutDirection}>
        <ResizablePanel
          // Usar 'defaultSize' para definir o tamanho inicial e 'collapsedSize' para o tamanho recolhido
          // O controle de recolhimento/expansão será feito diretamente pelo CSS do Sidebar
          defaultSize={layoutDirection === "horizontal" ? 280 : 64} // Tamanho inicial em pixels
          minSize={layoutDirection === "horizontal" ? 80 : 64} // Tamanho mínimo em pixels
          maxSize={layoutDirection === "horizontal" ? 280 : 64} // Tamanho máximo em pixels
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
        <ResizablePanel defaultSize={100 - (layoutDirection === "horizontal" ? 280 : 64)}> {/* Ajustar defaultSize aqui */}
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