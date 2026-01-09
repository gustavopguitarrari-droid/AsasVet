"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';

const LandingPage: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const textToType = "Muito mais que Simples. Aqui você ganha ASAS!";
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDelay = 1500; // 1.5 segundos de pausa

  useEffect(() => {
    const handleTyping = () => {
      const currentText = isDeleting
        ? textToType.substring(0, typedText.length - 1)
        : textToType.substring(0, typedText.length + 1);

      setTypedText(currentText);

      if (!isDeleting && currentText === textToType) {
        // Pausa no final antes de apagar
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    let delay = isDeleting ? deletingSpeed : typingSpeed;

    // Adiciona a pausa após a primeira frase
    if (!isDeleting && typedText === "Muito mais que Simples.") {
      delay = pauseDelay;
    }

    const typingTimeout = setTimeout(handleTyping, delay);

    return () => clearTimeout(typingTimeout);
  }, [typedText, isDeleting, loopNum]);

  return (
    <div className="min-h-screen bg-landingPage-lp-creme-terra text-landingPage-lp-marrom-avela theme-nature-vet flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <main id="hero" className="relative flex-1 flex items-center justify-center text-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/vet-landing-bg.png')" }}>
          <div className="absolute inset-0 bg-landingPage-lp-marrom-avela opacity-50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-landingPage-lp-creme-terra drop-shadow-lg h-48 md:h-56">
            {typedText}
            <span className="typing-cursor"></span>
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto text-landingPage-lp-creme-terra/90 animate-fade-in-up">
            Organize consultas, prontuários e finanças em um só lugar. Mais tempo para o que realmente importa: cuidar dos animais.
          </p>
          <div className="mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-landingPage-lp-verde-folha-seca hover:bg-landingPage-lp-verde-folha-seca/90 text-white text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Crie sua Conta Grátis
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