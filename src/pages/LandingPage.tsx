"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';

const LandingPage: React.FC = () => {
  // Lógica da animação de digitação
  const [typedAsas, setTypedAsas] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const wordToType = "ASAS";
  const typingSpeed = 200;
  const deletingSpeed = 150;
  const pauseDelay = 3000;

  useEffect(() => {
    const handleTyping = () => {
      setTypedAsas(current => {
        const isFullText = current === wordToType;
        const isEmptyText = current === '';

        if (isDeleting) {
          if (isEmptyText) {
            setIsDeleting(false);
            return wordToType.substring(0, 1);
          }
          return wordToType.substring(0, current.length - 1);
        } else {
          if (isFullText) {
            return current;
          }
          return wordToType.substring(0, current.length + 1);
        }
      });
    };

    const typingInterval = setInterval(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearInterval(typingInterval);
  }, [isDeleting, wordToType]);

  useEffect(() => {
    if (!isDeleting && typedAsas === wordToType) {
      const timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDelay);
      return () => clearTimeout(timeoutId);
    }
  }, [typedAsas, isDeleting, wordToType]);

  return (
    <div className="min-h-screen bg-landingPage-lp-creme-terra text-landingPage-lp-marrom-avela theme-nature-vet flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <main id="hero" className="relative flex-1 flex items-center justify-center md:justify-end text-center md:text-right p-8 md:p-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/vet-landing-bg-2.png')" }}>
          {/* A div de overlay foi removida para mostrar a imagem original */}
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-mono font-extrabold leading-tight text-green-900 drop-shadow-lg animate-fade-in-down">
            Muito mais que simples, aqui você ganha{' '}
            <span className="text-golden">{typedAsas}</span>
            <span className="typing-cursor text-golden"></span>
          </h1>
          <div className="mt-32 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
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