"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-landingPage-lp-creme-terra text-landingPage-lp-marrom-avela theme-nature-vet flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <main id="hero" className="relative flex-1 flex items-center justify-center text-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/vet-landing-bg.png')" }}>
          <div className="absolute inset-0 bg-landingPage-lp-marrom-avela opacity-50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-landingPage-lp-creme-terra drop-shadow-lg animate-fade-in-down">
            A gestão da sua clínica veterinária, simplificada.
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto text-landingPage-lp-creme-terra/90 animate-fade-in-up">
            Organize consultas, prontuários e finanças em um só lugar. Mais tempo para o que realmente importa: cuidar dos animais.
          </p>
          <div className="mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-landingPage-lp-verde-folha-seca hover:bg-landingPage-lp-verde-folha-seca/90 text-white text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Experimente Grátis
            </Link>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="py-6 px-8 bg-landingPage-lp-creme-terra/90 text-landingPage-lp-marrom-avela/80 border-t border-landingPage-lp-verde-folha-seca/20 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left space-y-2 sm:space-y-0">
          <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
          <p className="text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;