"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const SubusersSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" /> Gerenciar Subusuários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Aqui você pode adicionar, editar e remover subusuários para sua conta.
          Esta funcionalidade permite que você conceda acesso limitado a outros membros da sua equipe.
        </p>
        <p className="text-sm text-muted-foreground">
          (Funcionalidade em desenvolvimento)
        </p>
      </CardContent>
    </Card>
  );
};

export default SubusersSettings;