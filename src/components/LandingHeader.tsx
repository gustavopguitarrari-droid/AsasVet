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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <Link to="/" className="flex items-center text-2xl font-bold text-primary" onClick={handleScrollToTop}>
          <PawPrint className="h-8 w-8 mr-2" />
          AsasVet
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
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
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-4">
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