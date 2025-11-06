"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button'; // Importar buttonVariants
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

const LandingHeader: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border p-4 flex items-center justify-between shadow-sm theme-neutral-modern">
      {/* Left side: Navigation Links (hidden on small screens) */}
      <nav className="hidden md:flex space-x-6 flex-1 justify-start">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-lg font-medium" onClick={handleScrollToTop}>
          Início
        </Link>
        <a href="#features" className="text-muted-foreground hover:text-primary transition-colors text-lg font-medium">
          Serviços
        </a>
        <a href="#plans" className="text-muted-foreground hover:text-primary transition-colors text-lg font-medium">
          Plano
        </a>
      </nav>

      {/* Center: Logo (always visible) */}
      <div className="flex-shrink-0 absolute left-1/2 -translate-x-1/2"> {/* Centraliza o logo */}
        <Link to="/" className="flex items-center text-3xl font-bold text-primary opacity-75 hover:opacity-100 transition-opacity duration-300" onClick={handleScrollToTop}>
          <PawPrint className="h-10 w-10 mr-2" />
          AsasVet
        </Link>
      </div>

      {/* Right side: Auth Buttons */}
      <div className="flex items-center space-x-4 flex-1 justify-end">
        <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "default" }), "text-lg font-medium")}>
          Login
        </Link>
        <Link to="/signup" className={cn(buttonVariants({ variant: "default", size: "default" }), "text-lg font-medium")}>
          Cadastre-se
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;