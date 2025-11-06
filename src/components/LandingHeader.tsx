"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

const LandingHeader: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-creme-terra/90 backdrop-blur-sm border-b border-marrom-avela/20 p-4 flex items-center justify-between shadow-sm theme-nature-vet">
      {/* Left side: Logo */}
      <div className="flex-shrink-0">
        <Link to="/" className="flex items-center" onClick={handleScrollToTop}>
          <PawPrint className="h-8 w-8 text-verde-folha-seca mr-2" />
          <span className="text-2xl font-bold text-marrom-avela">AsasVet</span>
        </Link>
      </div>

      {/* Right side: Auth Buttons */}
      <div className="flex items-center space-x-4">
        <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "default" }), "text-marrom-avela hover:text-verde-folha-seca transition-colors text-lg font-medium")}>
          Login
        </Link>
        <Link to="/signup" className={cn(buttonVariants({ variant: "default", size: "default" }), "bg-verde-folha-seca hover:bg-verde-folha-seca/90 text-marrom-avela text-lg font-medium")}>
          Cadastre-se
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;