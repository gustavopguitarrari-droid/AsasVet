"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingCashierButtonProps {
  onClick: () => void;
}

const FloatingCashierButton: React.FC<FloatingCashierButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-24 right-6 z-50"> {/* Posição acima do botão de chat */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 ease-in-out"
            onClick={onClick}
          >
            <ShoppingCart className="h-7 w-7" />
            <span className="sr-only">Abrir Caixa</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="rounded-lg shadow-md"> {/* Adicionado rounded-lg e shadow-md */}
          Abrir Caixa
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FloatingCashierButton;