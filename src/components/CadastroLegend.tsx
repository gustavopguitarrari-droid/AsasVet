"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, PawPrint, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CadastroLegend: React.FC = () => {
  return (
    <Card className="bg-primary text-primary-foreground shadow-lg">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-6">
        <div className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6 text-primary-foreground" />
          <span className="font-semibold text-lg">1. Adicione um Tutor</span>
        </div>
        <ArrowRight className="h-5 w-5 text-primary-foreground" />
        <div className="flex items-center space-x-2">
          <PawPrint className="h-6 w-6 text-primary-foreground" />
          <span className="font-semibold text-lg">2. Adicione o(s) Animal(is)</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastroLegend;