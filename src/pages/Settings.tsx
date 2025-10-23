"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold">Configurações</h2>
      <p className="text-muted-foreground">Gerencie as preferências da sua conta e do aplicativo.</p>

      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Notificações por E-mail</Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">Notificações por SMS</Label>
            <Switch id="sms-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="two-factor-auth">Autenticação de Dois Fatores</Label>
            <Switch id="two-factor-auth" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="session-management">Gerenciamento de Sessões</Label>
            {/* Placeholder para um botão ou link para gerenciar sessões */}
            <span className="text-sm text-muted-foreground">Em breve</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;