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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between shadow-sm theme-neutral-modern"> {/* Fundo semi-transparente */}
      {/* Left side: Logo */}
      <div className="flex-shrink-0">
        <Link to="/" className="flex items-center" onClick={handleScrollToTop}>
          <img src="/images/logooficial.png" alt="AsasVet Logo" className="h-20 w-auto" /> {/* Tamanho do logo ajustado */}
        </Link>
      </div>

      {/* Right side: Auth Buttons */}
      <div className="flex items-center space-x-4">
        <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "default" }), "text-foreground hover:text-primary transition-colors text-lg font-medium")}>
          Login
        </Link>
        <Link to="/signup" className={cn(buttonVariants({ variant: "default", size: "default" }), "bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium")}>
          Cadastre-se
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;