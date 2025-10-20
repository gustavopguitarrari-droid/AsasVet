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
  { name: "Padrão", value: "default", colorClass: "bg-primary" },
  { name: "Verde", value: "green", colorClass: "bg-green-500" }, // Usando green-500 já definido
  { name: "Roxo", value: "purple", colorClass: "bg-purple-600" }, // Nova cor para o botão
  { name: "Laranja", value: "orange", colorClass: "bg-orange-500" }, // Nova cor para o botão
  { name: "Ciano", value: "teal", colorClass: "bg-teal-500" }, // Nova cor para o botão
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