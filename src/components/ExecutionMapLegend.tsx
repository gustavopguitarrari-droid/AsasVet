"use client";

import React from "react";
import { Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ExecutionMapLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-card shadow-sm">
      <h3 className="text-lg font-semibold mr-4">Legenda:</h3>
      <div className="flex items-center space-x-2">
        <Badge className={cn("h-7 w-7 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground")}>
          2
        </Badge>
        <span className="text-sm text-muted-foreground">Ações Pendentes</span>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={cn("h-7 w-7 p-0 flex items-center justify-center rounded-full bg-green-600 text-white")}>
          <Check className="h-4 w-4" />
        </Badge>
        <span className="text-sm text-muted-foreground">Todas as Ações Concluídas</span>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={cn("h-7 w-7 p-0 flex items-center justify-center rounded-full border-dashed border-muted-foreground/50 bg-background")}>
          <Plus className="h-4 w-4 text-primary opacity-100" />
        </Badge>
        <span className="text-sm text-muted-foreground">Nenhuma Ação Agendada</span>
      </div>
    </div>
  );
};

export default ExecutionMapLegend;