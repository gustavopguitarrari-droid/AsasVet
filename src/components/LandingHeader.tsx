"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

const LandingHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-landingPage-lp-creme-terra/90 backdrop-blur-sm border-b border-landingPage-lp-marrom-avela/20 p-2 flex items-center justify-between shadow-lg theme-nature-vet">
      {/* Left side: Logo */}
      <div className="flex-shrink-0">
        <Link to="/" className="flex items-center">
          <PawPrint className="h-6 w-6 text-landingPage-lp-verde-folha-seca mr-2" />
          <span className="text-xl font-bold text-landingPage-lp-marrom-avela">AsasVet</span>
        </Link>
      </div>

      {/* Right side: Auth Buttons */}
      <div className="flex items-center space-x-2">
        <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-landingPage-lp-marrom-avela hover:text-landingPage-lp-verde-folha-seca transition-colors text-base font-medium")}>
          Login
        </Link>
        <Link to="/signup" className={cn(buttonVariants({ variant: "default", size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium")}>
          Experimente Grátis
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;