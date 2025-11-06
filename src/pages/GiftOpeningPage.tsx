"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

const GiftOpeningPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenGift = () => {
    setIsOpening(true);
    // Navega para a LandingPage após a animação
    setTimeout(() => {
      navigate('/'); 
    }, 1000); // A duração deve corresponder à transição CSS
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-blue-500 to-blue-500 p-4 relative overflow-hidden">
      {/* Elementos de fundo para um toque visual */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-white rounded-full mix-blend-overlay animate-pulse-slow delay-500"></div>
      </div>

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center text-center p-8 md:p-12 bg-card/90 backdrop-blur-sm rounded-lg shadow-2xl max-w-md mx-auto transition-all duration-1000 ease-in-out",
          isOpening ? "opacity-0 scale-125" : "opacity-100 scale-100"
        )}
      >
        <Gift className="h-24 w-24 text-primary mb-6 animate-bounce-slow" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Você acaba de encontrar o melhor presente para o médico veterinário!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Abra já e descubra como podemos transformar sua clínica.
        </p>
        <Button
          onClick={handleOpenGift}
          size="lg"
          className="bg-primary hover:bg-primary-darker text-primary-foreground text-xl px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
          disabled={isOpening}
        >
          Abrir Presente
        </Button>
      </div>
    </div>
  );
};

export default GiftOpeningPage;