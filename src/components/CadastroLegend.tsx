"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, PawPrint, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CadastroLegend: React.FC = () => {
  return (
    <Card className="border-none shadow-none bg-transparent"> {/* Removido borda e sombra, fundo transparente */}
      <CardContent className="p-0 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 text-muted-foreground"> {/* Reduzido padding e espaçamento, texto muted */}
        <div className="flex items-center space-x-1"> {/* Reduzido space-x */}
          <UserPlus className="h-5 w-5" /> {/* Ícone menor */}
          <span className="font-medium text-base">1. Adicione um Tutor</span> {/* Texto menor */}
        </div>
        <ArrowRight className="h-4 w-4" /> {/* Ícone menor */}
        <div className="flex items-center space-x-1"> {/* Reduzido space-x */}
          <PawPrint className="h-5 w-5" /> {/* Ícone menor */}
          <span className="font-medium text-base">2. Adicione o(s) Animal(is)</span> {/* Texto menor */}
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastroLegend;