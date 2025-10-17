import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PawPrint, CalendarDays, Settings, DollarSign, Bed, Stethoscope, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardConfigurator from "@/components/DashboardConfigurator";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Importar componentes de Tabs

// Importar os novos componentes de gráfico
import AppointmentsMonthlyChart from "@/components/charts/AppointmentsMonthlyChart";
import AppointmentsWeeklyChart from "@/components/charts/AppointmentsWeeklyChart";
import RevenueMonthlyChart from "@/components/charts/RevenueMonthlyChart";
import PetsBySpeciesChart from "@/components/charts/PetsBySpeciesChart";

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
  category: "overview" | "financial" | "animalHealth" | "recentActivity"; // Adicionar nova categoria
}

const initialDashboardConfig: DashboardItemConfig[] = [
  { id: "totalClients", name: "Total de Clientes", isVisible: true, category: "overview" },
  { id: "totalPets", name: "Total de Animais", isVisible: true, category: "overview" },
  { id: "scheduledAppointments", name: "Consultas Agendadas", isVisible: true, category: "overview" },
  { id: "recentActivity", name: "Atividade Recente", isVisible: true, category: "recentActivity" }, // Mover para nova categoria
  { id: "financialSummary", name: "Resumo Financeiro", isVisible: true, category: "financial" },
  { id: "cashFlow", name: "Fluxo de Caixa", isVisible: true, category: "financial" },
  { id: "internmentStatus", name: "Status de Internação", isVisible: true, category: "animalHealth" },
  { id: "veterinariansOnDuty", name: "Veterinários de Plantão", isVisible: true, category: "animalHealth" },
  { id: "medicalRecordsSummary", name: "Resumo de Prontuários", isVisible: true, category: "animalHealth" },
  // Novos itens de gráfico
  { id: "appointmentsMonthlyChart", name: "Consultas por Mês (Gráfico)", isVisible: true, category: "animalHealth" },
  { id: "appointmentsWeeklyChart", name: "Consultas por Semana (Gráfico)", isVisible: true, category: "animalHealth" },
  { id: "revenueMonthlyChart", name: "Receita por Mês (Gráfico)", isVisible: true, category: "financial" },
  { id: "petsBySpeciesChart", name: "Animais por Espécie (Gráfico)", isVisible: true, category: "animalHealth" },
];

const Dashboard = () => {
  const [isConfiguratorOpen, setIsConfiguratorOpen] = React.useState(false);
  const [dashboardConfig, setDashboardConfig] = React.useState<DashboardItemConfig[]>(
    initialDashboardConfig
  );
  const [activeTab, setActiveTab] = React.useState<"overview" | "financial" | "animalHealth" | "recentActivity">("recentActivity"); // Definir a primeira aba como 'Atividade Recente'

  const { user } = useUser();

  React.useEffect(() => {
    const savedConfig = localStorage.getItem("dashboardConfig");
    if (savedConfig) {
      setDashboardConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveConfig = (newConfig: DashboardItemConfig[]) => {
    setDashboardConfig(newConfig);
    localStorage.setItem("dashboardConfig", JSON.stringify(newConfig));
  };

  const getCardComponent = (item: DashboardItemConfig) => {
    const baseCardClasses = "text-white shadow-md";
    const iconClasses = "h-4 w-4 text-white";
    const textMutedClasses = "text-white/80";

    switch (item.id) {
      case "totalClients":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-1", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className={textMutedClasses}>+20.1% do mês passado</p>
            </CardContent>
          </Card>
        );
      case "totalPets":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-2", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <PawPrint className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,120</div>
              <p className={textMutedClasses}>+18.5% do mês passado</p>
            </CardContent>
          </Card>
        );
      case "scheduledAppointments":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-3", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
              <CalendarDays className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className={textMutedClasses}>+5% do dia anterior</p>
            </CardContent>
          </Card>
        );
      case "recentActivity":
        return (
          <Card key={item.id} className="bg-muted text-foreground shadow-md">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Nenhuma atividade recente para mostrar.</p>
            </CardContent>
          </Card>
        );
      case "financialSummary":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-6", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resumo Financeiro</CardTitle>
              <DollarSign className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 12.500,00</div>
              <p className={textMutedClasses}>Receita do mês</p>
            </CardContent>
          </Card>
        );
      case "cashFlow":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-7", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
              <DollarSign className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 5.230,00</div>
              <p className={textMutedClasses}>Saldo atual</p>
            </CardContent>
          </Card>
        );
      case "internmentStatus":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-8", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status de Internação</CardTitle>
              <Bed className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Animais</div>
              <p className={textMutedClasses}>Atualmente internados</p>
            </CardContent>
          </Card>
        );
      case "veterinariansOnDuty":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-9", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veterinários de Plantão</CardTitle>
              <Stethoscope className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 Veterinários</div>
              <p className={textMutedClasses}>Disponíveis hoje</p>
            </CardContent>
          </Card>
        );
      case "medicalRecordsSummary":
        return (
          <Card key={item.id} className={cn("bg-sidebar-item-bg-5", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resumo de Prontuários</CardTitle>
              <FileText className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50 Prontuários</div>
              <p className={textMutedClasses}>Atualizados esta semana</p>
            </CardContent>
          </Card>
        );
      case "appointmentsMonthlyChart":
        return <AppointmentsMonthlyChart key={item.id} />;
      case "appointmentsWeeklyChart":
        return <AppointmentsWeeklyChart key={item.id} />;
      case "revenueMonthlyChart":
        return <RevenueMonthlyChart key={item.id} />;
      case "petsBySpeciesChart":
        return <PetsBySpeciesChart key={item.id} />;
      default:
        return null;
    }
  };

  const getGreeting = () => {
    if (!user) {
      return "Bem-vindo(a) ao Simples Vet!";
    }
    const prefix = user.gender === "feminino" ? "Dra." : "Dr.";
    return `Bem-vindo(a) ${prefix} ${user.name}!`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{getGreeting()}</h2>
          <p className="text-muted-foreground">
            Visão geral do seu consultório veterinário.
          </p>
        </div>
        <Button
          onClick={() => setIsConfiguratorOpen(true)}
          variant="default"
          className="bg-purple-600 text-white hover:bg-purple-700 font-bold"
        >
          <Settings className="mr-2 h-4 w-4" /> Configurar Painel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "financial" | "animalHealth" | "recentActivity")} className="w-full">
        <TabsList className="grid w-full grid-cols-4"> {/* Aumentar para 4 colunas */}
          <TabsTrigger value="recentActivity">Atividade Recente</TabsTrigger> {/* Nova ordem */}
          <TabsTrigger value="animalHealth">Saúde Animal</TabsTrigger> {/* Nova ordem */}
          <TabsTrigger value="overview">Visão Geral</TabsTrigger> {/* Nova ordem */}
          <TabsTrigger value="financial">Financeiro</TabsTrigger> {/* Nova ordem */}
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "overview")
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "financial")
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
        <TabsContent value="animalHealth" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "animalHealth")
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
        <TabsContent value="recentActivity" className="mt-4"> {/* Conteúdo para a nova aba */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "recentActivity")
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
      </Tabs>

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