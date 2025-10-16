import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarSize = isSidebarCollapsed ? 5 : 18;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={sidebarSize}
          minSize={sidebarSize}
          maxSize={sidebarSize}
          className="transition-all duration-300 ease-in-out"
        >
          <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
        </ResizablePanel>
        {/* A ResizableHandle foi removida */}
        <ResizablePanel defaultSize={100 - sidebarSize}> {/* Ajusta o tamanho do painel de conteúdo */}
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