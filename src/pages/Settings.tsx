"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MyPlanSettings from "@/components/settings/MyPlanSettings";
import ClinicDetailsSettings from "@/components/settings/ClinicDetailsSettings";
import ImportDataSettings from "@/components/settings/ImportDataSettings";
import { useUser } from "@/context/UserContext";
import { addDays, isAfter, parseISO, isValid } from "date-fns";

const Settings = () => {
  const location = useLocation();
  const { user: appUser } = useUser();
  const [activeTab, setActiveTab] = useState("security");

  // Check for trial expiration
  let isTrialExpired = false;
  if (appUser) {
    const registrationDate = parseISO(appUser.registeredTime);
    if (isValid(registrationDate)) {
      const expirationDate = addDays(registrationDate, 7);
      const isTrialPlan = appUser.planName === 'Plano Básico' || appUser.planName === 'Vet Domiciliar';
      isTrialExpired = isTrialPlan && isAfter(new Date(), expirationDate);
    }
  }

  useEffect(() => {
    if (isTrialExpired) {
      // If trial is expired, force 'my-plan' tab
      setActiveTab('my-plan');
    } else if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state, isTrialExpired]);

  return (
    <div className="space-y-6 w-full p-4">
      <h2 className="text-3xl font-bold">Configurações</h2>
      <p className="text-muted-foreground">Gerencie as preferências da sua conta e do aplicativo.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="security" disabled={isTrialExpired} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Geral</TabsTrigger>
          <TabsTrigger value="my-plan" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Meu Plano</TabsTrigger>
          <TabsTrigger value="personalization" disabled={isTrialExpired} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Personalização</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="mt-4 space-y-6">
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
                <span className="text-sm text-muted-foreground">Em breve</span>
              </div>
            </CardContent>
          </Card>

          <ImportDataSettings />
        </TabsContent>

        <TabsContent value="my-plan" className="mt-4">
          <MyPlanSettings />
        </TabsContent>

        <TabsContent value="personalization" className="mt-4">
          <ClinicDetailsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;