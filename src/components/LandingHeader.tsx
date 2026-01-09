"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

const LandingHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-landingPage-lp-creme-terra/90 backdrop-blur-sm border-b border-landingPage-lp-marrom-avela/20 p-4 flex items-center justify-between shadow-lg theme-nature-vet">
      {/* Left side: Logo and Nav */}
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center">
          <PawPrint className="h-8 w-8 text-landingPage-lp-verde-folha-seca mr-2" />
          <span className="text-2xl font-bold text-landingPage-lp-marrom-avela">AsasVet</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#about" className={cn(buttonVariants({ variant: "ghost" }), "text-landingPage-lp-marrom-avela hover:text-landingPage-lp-verde-folha-seca transition-colors text-lg font-medium")}>
            Sobre
          </a>
          <a href="#plans" className={cn(buttonVariants({ variant: "ghost" }), "text-landingPage-lp-marrom-avela hover:text-landingPage-lp-verde-folha-seca transition-colors text-lg font-medium")}>
            Planos
          </a>
        </nav>
      </div>

      {/* Right side: Auth Buttons */}
      <div className="flex items-center space-x-4">
        <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "default" }), "text-landingPage-lp-marrom-avela hover:text-landingPage-lp-verde-folha-seca transition-colors text-lg font-medium")}>
          Login
        </Link>
        <Link to="/signup" className={cn(buttonVariants({ variant: "default", size: "default" }), "bg-landingPage-lp-verde-folha-seca hover:bg-landingPage-lp-verde-folha-seca/90 text-white text-lg font-medium")}>
          Cadastre-se
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;