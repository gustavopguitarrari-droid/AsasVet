"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, PawPrint, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CadastroLegend: React.FC = () => {
  return (
    <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-6">
        <div className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-lg">1. Adicione um Tutor</span>
        </div>
        <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400 hidden md:block" />
        <div className="flex items-center space-x-2">
          <PawPrint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-lg">2. Adicione o(s) Animal(is)</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastroLegend;