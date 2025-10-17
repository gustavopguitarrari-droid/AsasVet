import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PawPrint, CalendarDays, Settings } from "lucide-react"; // Importando Settings
import { Button } from "@/components/ui/button";
import DashboardConfigurator from "@/components/DashboardConfigurator"; // Importando o novo componente

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
}

const initialDashboardConfig: DashboardItemConfig[] = [
  { id: "totalClients", name: "Total de Clientes", isVisible: true },
  { id: "totalPets", name: "Total de Animais", isVisible: true },
  { id: "scheduledAppointments", name: "Consultas Agendadas", isVisible: true },
  { id: "recentActivity", name: "Atividade Recente", isVisible: true },
];

const Dashboard = () => {
  const [isConfiguratorOpen, setIsConfiguratorOpen] = React.useState(false);
  const [dashboardConfig, setDashboardConfig] = React.useState<DashboardItemConfig[]>(
    initialDashboardConfig
  );

  const handleSaveConfig = (newConfig: DashboardItemConfig[]) => {
    setDashboardConfig(newConfig);
  };

  const getCardComponent = (item: DashboardItemConfig) => {
    switch (item.id) {
      case "totalClients":
        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">+20.1% do mês passado</p>
            </CardContent>
          </Card>
        );
      case "totalPets":
        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,120</div>
              <p className="text-xs text-muted-foreground">+18.5% do mês passado</p>
            </CardContent>
          </Card>
        );
      case "scheduledAppointments":
        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-muted-foreground">+5% do dia anterior</p>
            </CardContent>
          </Card>
        );
      case "recentActivity":
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Nenhuma atividade recente para mostrar.</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Bem-vindo ao Simples Vet!</h2>
          <p className="text-muted-foreground">
            Visão geral do seu consultório veterinário.
          </p>
        </div>
        <Button onClick={() => setIsConfiguratorOpen(true)} variant="outline">
          <Settings className="mr-2 h-4 w-4" /> Configurar Painel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardConfig.filter(item => item.isVisible).map(item => getCardComponent(item))}
      </div>

      <DashboardConfigurator
        open={isConfiguratorOpen}
        onOpenChange={setIsConfiguratorOpen}
        config={dashboardConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default Dashboard;