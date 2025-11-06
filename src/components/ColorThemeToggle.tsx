"use client";

import React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorTheme } from "@/context/ColorThemeContext";
import { cn } from "@/lib/utils";

const colorThemes = [
  { name: "Padrão (Nature Vet)", value: "nature-vet", colorClass: "bg-verde-folha-seca" }, // Renomeado e valor ajustado
  { name: "Laranja Pôr do Sol", value: "orange", colorClass: "bg-orange-500" },
  { name: "Azul Oceano", value: "blue", colorClass: "bg-blue-500" },
  { name: "Verde Esmeralda", value: "green", colorClass: "bg-green-500" },
  { name: "Púrpura Real", value: "purple", colorClass: "bg-purple-600" },
  { name: "Rosa Chiclete", value: "pink", colorClass: "bg-pink-500" },
  { name: "Amarelo Dourado", value: "yellow", colorClass: "bg-yellow-500" },
  { name: "Vermelho Rubi", value: "red", colorClass: "bg-red-500" },
  { name: "Azul-Esverdeado", value: "teal-blue", colorClass: "bg-teal-blue-500" },
];

const ColorThemeToggle = () => {
  const { setColorTheme } = useColorTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Selecionar tema de cor</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {colorThemes.map((theme) => (
          <DropdownMenuItem key={theme.value} onClick={() => setColorTheme(theme.value as any)}>
            <div className="flex items-center">
              <span className={cn("h-4 w-4 rounded-full mr-2", theme.colorClass)}></span>
              {theme.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorThemeToggle;