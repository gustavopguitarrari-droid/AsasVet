"use client";

import React from "react";
import { Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ExecutionMapLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2"> {/* Removido p-2 bg-card shadow-md rounded-lg */}
      <div className="flex items-center space-x-1"> {/* Reduzido space-x */}
        <Badge className={cn("h-6 w-6 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground")}> {/* Reduzido h e w */}
          2
        </Badge>
        <span className="text-xs text-muted-foreground">Ações Pendentes</span> {/* Reduzido para text-xs */}
      </div>
      <div className="flex items-center space-x-1"> {/* Reduzido space-x */}
        <Badge className={cn("h-6 w-6 p-0 flex items-center justify-center rounded-full bg-green-600 text-white")}> {/* Reduzido h e w */}
          <Check className="h-3 w-3" /> {/* Reduzido h e w */}
        </Badge>
        <span className="text-xs text-muted-foreground">Todas as Ações Concluídas</span> {/* Reduzido para text-xs */}
      </div>
      <div className="flex items-center space-x-1"> {/* Reduzido space-x */}
        <Badge className={cn("h-6 w-6 p-0 flex items-center justify-center rounded-full border-dashed border-muted-foreground/50 bg-background")}> {/* Reduzido h e w */}
          <Plus className="h-3 w-3 text-primary opacity-100" /> {/* Reduzido h e w */}
        </Badge>
        <span className="text-xs text-muted-foreground">Nenhuma Ação Agendada</span> {/* Reduzido para text-xs */}
      </div>
    </div>
  );
};

export default ExecutionMapLegend;