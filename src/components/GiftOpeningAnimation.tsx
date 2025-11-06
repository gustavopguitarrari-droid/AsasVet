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
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 text-white relative overflow-hidden">
      <div className={cn(
        "relative z-10 flex flex-col items-center text-center space-y-6 transition-all duration-1000 ease-in-out",
        isOpening ? "opacity-0 scale-150" : "opacity-100 scale-100"
      )}>
        <Gift className="h-32 w-32 text-white drop-shadow-lg animate-bounce-slow" />
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
          Você acaba de encontrar o melhor presente para o médico veterinário!
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Um sistema completo para otimizar sua clínica e cuidar melhor dos seus pacientes.
        </p>
        <Button
          onClick={handleOpenGift}
          size="lg"
          className="bg-white hover:bg-gray-100 text-primary text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105"
          disabled={isOpening}
        >
          Abrir Presente
        </Button>
      </div>
    </div>
  );
};

export default GiftOpeningAnimation;