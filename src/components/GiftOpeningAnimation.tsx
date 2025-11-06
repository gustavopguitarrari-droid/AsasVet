"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftOpeningAnimationProps {
  onAnimationComplete: () => void;
}

const GiftOpeningAnimation: React.FC<GiftOpeningAnimationProps> = ({ onAnimationComplete }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const handleOpenGift = () => {
    setIsOpening(true);
    // Inicia a animação de fade-out e zoom
    setTimeout(() => {
      setShowContent(false); // Remove o conteúdo após a animação
      onAnimationComplete(); // Notifica o componente pai para mostrar a LandingPage
    }, 1000); // Duração da animação em milissegundos
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 text-primary-foreground relative overflow-hidden">
      <div className={cn(
        "relative z-10 flex flex-col items-center text-center space-y-6 transition-all duration-1000 ease-in-out",
        isOpening ? "opacity-0 scale-150" : "opacity-100 scale-100"
      )}>
        <Gift className="h-32 w-32 text-primary-foreground drop-shadow-lg animate-bounce-slow" />
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
          Você acaba de encontrar o melhor presente para o médico veterinário!
        </h1>
        <Button
          onClick={handleOpenGift}
          size="lg"
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-2xl px-12 py-7 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105"
          disabled={isOpening}
        >
          Abrir Presente
        </Button>
      </div>
    </div>
  );
};

export default GiftOpeningAnimation;