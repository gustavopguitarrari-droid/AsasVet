"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

const ImportDataSettings: React.FC = () => {
  const handleImportData = () => {
    // Lógica de importação de dados aqui
    showSuccess("Funcionalidade de importação de dados em desenvolvimento!");
    console.log("Importar dados de outro sistema clicado.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UploadCloud className="mr-2 h-5 w-5" /> Importar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Importe dados de clientes, animais, agendamentos e outros registros de outro sistema para o AsasVet.
        </p>
        <Button onClick={handleImportData} className="w-full md:w-auto">
          <UploadCloud className="mr-2 h-4 w-4" /> Iniciar Importação
        </Button>
        <p className="text-sm text-muted-foreground">
          (Funcionalidade de importação em desenvolvimento. Suporte a formatos específicos será adicionado.)
        </p>
      </CardContent>
    </Card>
  );
};

export default ImportDataSettings;