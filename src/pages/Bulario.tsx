"use client";

import React, { useEffect } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpenCheck } from "lucide-react";

const Bulario = () => {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Bulário");
    return () => setPageTitle("");
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <BookOpenCheck className="h-8 w-8 mr-3 text-primary" />
          Bulário Digital
        </h2>
      </div>
      <p className="text-muted-foreground">
        Consulte informações sobre medicamentos veterinários de forma rápida e fácil.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Medicamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Digite o nome do medicamento ou princípio ativo..."
              className="pl-9"
            />
          </div>
          <div className="mt-8 text-center text-muted-foreground">
            <p>(Funcionalidade em desenvolvimento)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bulario;