import React from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { cn } from "@/lib/utils";

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
          <Button
            variant="default"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full z-20",
              "right-[-20px]",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "border border-border shadow-md"
            )}
          >
            {isSidebarCollapsed ? <ArrowRightToLine className="h-5 w-5" /> : <ArrowLeftToLine className="h-5 w-5" />}
          </Button>
        </ResizablePanel>
        <ResizablePanel defaultSize={100 - sidebarSize}>
          <div className="flex h-full flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
            <MadeWithDyad />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;