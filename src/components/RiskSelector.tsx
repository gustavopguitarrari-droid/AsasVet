"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface RiskOption {
  label: string;
  value: RiskLevel;
  colorClass: string;
}

const riskOptions: RiskOption[] = [
  { label: "Sem risco", value: "Sem risco", colorClass: "bg-green-500" },
  { label: "Baixo", value: "Baixo", colorClass: "bg-blue-500" },
  { label: "Médio", value: "Médio", colorClass: "bg-orange-500" },
  { label: "Alto", value: "Alto", colorClass: "bg-red-500" },
  { label: "Emergência", value: "Emergência", colorClass: "bg-red-700" },
];

interface RiskSelectorProps {
  value: RiskLevel;
  onValueChange: (risk: RiskLevel) => void;
}

const RiskSelector: React.FC<RiskSelectorProps> = ({ value, onValueChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {riskOptions.map((option) => (
        <Tooltip key={option.value} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-200",
                option.colorClass,
                value === option.value
                  ? "ring-2 ring-offset-2 ring-current scale-110"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => onValueChange(option.value)}
            >
              <span className="sr-only">{option.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{option.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default RiskSelector;