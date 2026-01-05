"use client";

import React, { useRef, useState, useEffect } from "react";
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
import CashierDialog from "@/components/CashierDialog";
import DemoModeBanner from "@/components/DemoModeBanner";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavCollapsed, setIsNavCollapsed] = React.useState(true);
  const [isChatDialogOpen, setIsChatDialogOpen] = React.useState(false);
  const [isCashierDialogOpen, setIsCashierDialogOpen] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const { user } = useUser();
  const isMobile = useIsMobile();
  const sidebarPanelRef = useRef<React.ElementRef<typeof ResizablePanel>>(null);

  useEffect(() => {
    if (!isMobile) {
      sidebarPanelRef.current?.collapse();
      document.documentElement.style.setProperty('--sidebar-width', '5%');
    }
  }, [isMobile]);

  const toggleNav = () => {
    if (sidebarPanelRef.current) {
      if (sidebarPanelRef.current.isCollapsed()) {
        sidebarPanelRef.current.expand();
      } else {
        sidebarPanelRef.current.collapse();
      }
    }
  };

  const updateSidebarState = (size: number) => {
    document.documentElement.style.setProperty('--sidebar-width', `${size}%`);
    setIsNavCollapsed(size <= 5);
  };

  const handleChatButtonClick = () => {
    setIsChatDialogOpen(true);
  };

  const handleCashierButtonClick = () => {
    setIsCashierDialogOpen(true);
  };

  if (isMobile) {
    return (
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
          <Header onCashierClick={handleCashierButtonClick} onMenuClick={() => setIsMobileNavOpen(true)} />
          <div className="flex-1 overflow-y-auto px-4">
            <main className="flex flex-col">{children}</main>
          </div>
          <MadeWithDyad />
        </div>
        <SheetContent side="left" className="p-0 w-[250px]">
          <Sidebar isCollapsed={false} onToggleCollapse={() => setIsMobileNavOpen(false)} />
        </SheetContent>
        <FloatingChatButton onClick={handleChatButtonClick} onClose={() => setIsChatDialogOpen(false)} />
        <ChatDialog isOpen={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} />
        <CashierDialog isOpen={isCashierDialogOpen} onClose={() => setIsCashierDialogOpen(false)} />
        {user?.isDemoMode && <DemoModeBanner />}
      </Sheet>
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex h-screen w-screen overflow-hidden"
    >
      <ResizablePanel
        ref={sidebarPanelRef}
        defaultSize={12}
        collapsedSize={5}
        collapsible={true}
        onCollapse={() => updateSidebarState(5)}
        onExpand={() => setIsNavCollapsed(false)}
        onResize={updateSidebarState}
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out",
          "rounded-r-xl shadow-lg"
        )}
      >
        <Sidebar isCollapsed={isNavCollapsed} onToggleCollapse={toggleNav} />
      </ResizablePanel>
      <ResizablePanel className="bg-background">
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          <Header onCashierClick={handleCashierButtonClick} />
          <div className="flex-1 overflow-y-auto px-4">
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