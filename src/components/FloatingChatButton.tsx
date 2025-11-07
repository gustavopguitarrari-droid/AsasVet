"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingChatButtonProps {
  onClick: () => void;
  onClose: () => void; // Adicionado onClose
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 ease-in-out"
            onClick={onClick}
          >
            <MessageCircle className="h-7 w-7" />
            <span className="sr-only">Abrir Chat de Atendimento</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="rounded-lg shadow-md"> {/* Adicionado rounded-lg e shadow-md */}
          Abrir Chat de Atendimento
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FloatingChatButton;