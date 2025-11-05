import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PawPrint, CalendarDays, Settings, DollarSign, Bed, Stethoscope, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardConfigurator from "@/components/DashboardConfigurator";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Importar os novos componentes de gráfico
import AppointmentsMonthlyChart from "@/components/charts/AppointmentsMonthlyChart";
import AppointmentsWeeklyChart from "@/components/charts/AppointmentsWeeklyChart";
import RevenueMonthlyChart from "@/components/charts/RevenueMonthlyChart";
import PetsBySpeciesChart from "@/components/charts/PetsBySpeciesChart";
import AverageWaitingTimeCard from "@/components/AverageWaitingTimeCard";
import AverageConsultationTimeCard from "@/components/AverageConsultationTimeCard";
import UpcomingEventsCard from "@/components/UpcomingEventsCard";
import RecentPetsCard from "@/components/RecentPetsCard";
import WaitingAppointmentsCard from "@/components/WaitingAppointmentsCard"; // NOVO: Importar o novo card

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
  category: "overview" | "financial" | "animalHealth" | "recentActivity";
}

const initialDashboardConfig: DashboardItemConfig[] = [
  { id: "totalClients", name: "Total de Tutores", isVisible: true, category: "overview" },
  { id: "totalPets", name: "Total de Animais", isVisible: true, category: "overview" },
  { id: "scheduledAppointments", name: "Consultas Agendadas", isVisible: true, category: "overview" },
  { id: "waitingAppointments", name: "Consultas Em Espera", isVisible: true, category: "overview" },
  { id: "averageWaitingTime", name: "Média de Tempo de Espera", isVisible: true, category: "overview" },
  { id: "averageConsultationTime", name: "Média de Tempo da Consulta", isVisible: true, category: "overview" },
  { id: "recentPets", name: "Últimos Animais Cadastrados", isVisible: true, category: "overview" },
  { id: "upcomingEvents", name: "Próximos Eventos", isVisible: true, category: "recentActivity" },
  { id: "financialSummary", name: "Resumo Financeiro", isVisible: true, category: "financial" },
  { id: "cashFlow", name: "Fluxo de Caixa", isVisible: true, category: "financial" },
  // Itens de 'Saúde Animal' movidos para 'overview'
  { id: "internmentStatus", name: "Status de Internação", isVisible: true, category: "overview" },
  { id: "veterinariansOnDuty", name: "Veterinários de Plantão", isVisible: true, category: "overview" },
  { id: "medicalRecordsSummary", name: "Resumo da Agenda", isVisible: true, category: "overview" },
  // Novos itens de gráfico movidos para 'overview'
  { id: "appointmentsMonthlyChart", name: "Consultas por Mês (Gráfico)", isVisible: true, category: "overview" },
  { id: "appointmentsWeeklyChart", name: "Consultas por Semana (Gráfico)", isVisible: true, category: "overview" },
  { id: "revenueMonthlyChart", name: "Receita por Mês (Gráfico)", isVisible: true, category: "financial" },
  { id: "petsBySpeciesChart", name: "Animais por Espécie (Gráfico)", isVisible: true, category: "overview" },
];

const Dashboard = () => {
  const [isConfiguratorOpen, setIsConfiguratorOpen] = React.useState(false);
  const [dashboardConfig, setDashboardConfig] = React.useState<DashboardItemConfig[]>(
    initialDashboardConfig
  );
  const [activeTab, setActiveTab] = React.useState<"overview" | "financial" | "animalHealth" | "recentActivity">("recentActivity"); // 'animalHealth' adicionado novamente
  const [vetsOnDutyToday, setVetsOnDutyToday] = React.useState<number>(0);

  const { user } = useUser();
  const userId = user?.id;
  const organizationId = user?.organizationId; // NOVO: Obter organizationId

  // Query para buscar a contagem de clientes
  const { data: totalClients = 0, isLoading: isLoadingClients } = useQuery<number>({
    queryKey: ['totalClients', userId, organizationId], // NOVO: Adicionado organizationId
    queryFn: async () => {
      if (!userId || !organizationId) return 0; // NOVO: Habilitar query apenas se organizationId estiver disponível
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('organization_id', organizationId); // NOVO: Filtrar por organization_id
      if (error) {
        console.error("Erro ao buscar contagem de clientes:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId && !!organizationId, // NOVO: Habilitar query apenas se userId E organizationId estiverem disponíveis
  });

  // Query para buscar a contagem de pets
  const { data: totalPets = 0, isLoading: isLoadingPets } = useQuery<number>({
    queryKey: ['totalPets', userId, organizationId], // NOVO: Adicionado organizationId
    queryFn: async () => {
      if (!userId || !organizationId) return 0; // NOVO: Habilitar query apenas se organizationId estiver disponível
      const { count, error } = await supabase
        .from('pets')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId); // NOVO: Filtrar por organization_id
      if (error) {
        console.error("Erro ao buscar contagem de pets:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId && !!organizationId, // NOVO: Habilitar query apenas se userId E organizationId estiverem disponíveis
  });

  // Query para buscar a contagem de consultas agendadas (agora da tabela 'events')
  const { data: scheduledAppointmentsCount = 0, isLoading: isLoadingScheduledAppointments } = useQuery<number>({
    queryKey: ['scheduledAppointmentsCount', userId, organizationId], // NOVO: Adicionado organizationId
    queryFn: async () => {
      if (!userId || !organizationId) return 0; // NOVO: Habilitar query apenas se organizationId estiver disponível
      const { count, error } = await supabase
        .from('appointments') // Alterado para 'appointments'
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId) // NOVO: Filtrar por organization_id
        .eq('status', 'Agendada');
      if (error) {
        console.error("Erro ao buscar contagem de consultas agendadas (appointments):", error);
        throw error;
      }
      console.log("Contagem de consultas agendadas (appointments) do Supabase:", count);
      return count || 0;
    },
    enabled: !!userId && !!organizationId, // NOVO: Habilitar query apenas se userId E organizationId estiverem disponíveis
  });

  // NOVO: Query para buscar a contagem de pacientes internados
  const { data: internedPatientsCount = 0, isLoading: isLoadingInternedPatients } = useQuery<number>({
    queryKey: ['internedPatientsCount', userId, organizationId], // NOVO: Adicionado organizationId
    queryFn: async () => {
      if (!userId || !organizationId) return 0; // NOVO: Habilitar query apenas se organizationId estiver disponível
      const { count, error } = await supabase
        .from('interned_patients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('organization_id', organizationId) // NOVO: Filtrar por organization_id
        .neq('status', 'Alta')
        .neq('status', 'Óbito');
      if (error) {
        console.error("Erro ao buscar contagem de pacientes internados:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId && !!organizationId, // NOVO: Habilitar query apenas se userId E organizationId estiverem disponíveis
  });

  React.useEffect(() => {
    const savedConfigString = localStorage.getItem("dashboardConfig");
    let savedConfig: DashboardItemConfig[] = [];
    if (savedConfigString) {
      try {
        savedConfig = JSON.parse(savedConfigString);
      } catch (error) {
        console.error("Erro ao analisar a configuração salva do painel:", error);
        // Se houver um erro, usaremos a configuração inicial
      }
    }

    // Crie um mapa para fácil acesso às configurações salvas
    const savedConfigMap = new Map(savedConfig.map(item => [item.id, item]));

    // Mescle a configuração inicial com a salva
    const mergedConfig = initialDashboardConfig.map(initialItem => {
      const savedItem = savedConfigMap.get(initialItem.id);
      if (savedItem) {
        // Se o item existe na configuração salva, use suas propriedades isVisible e category
        return {
          ...initialItem, // Mantém id e name do initialConfig (para pegar novos nomes se atualizados)
          isVisible: savedItem.isVisible,
          category: savedItem.category,
        };
      }
      // Se não existe na configuração salva, use o item do initialConfig
      return initialItem;
    });

    setDashboardConfig(mergedConfig);
  }, []);

  // Efeito para carregar a escala de veterinários do localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem('teamSchedule');
      if (savedSchedule) {
        try {
          const scheduleMap = new Map<string, string[]>(JSON.parse(savedSchedule));
          const todayKey = format(new Date(), "yyyy-MM-dd");
          const vetsToday = scheduleMap.get(todayKey) || [];
          setVetsOnDutyToday(vetsToday.length);
        } catch (e) {
          console.error("Erro ao carregar a escala do localStorage para o Dashboard:", e);
          setVetsOnDutyToday(0);
        }
      } else {
        setVetsOnDutyToday(0);
      }
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
          <Link to="/cadastro" key={item.id} className="block">
            <Card className={cn("bg-blue-600", baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tutores</CardTitle>
                <Users className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingClients ? "..." : totalClients.toLocaleString('pt-BR')}
                </div>
                {/* <p className={textMutedClasses}>+20.1% do mês passado</p> */}
              </CardContent>
            </Card>
          </Link>
        );
      case "totalPets":
        return (
          <Link to="/cadastro" state={{ activeTab: "animais" }} key={item.id} className="block">
            <Card className={cn("bg-indigo-600", baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
                <PawPrint className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPets ? "..." : totalPets.toLocaleString('pt-BR')}
                </div>
                {/* <p className={textMutedClasses}>+18.5% do mês passado</p> */}
              </CardContent>
            </Card>
          </Link>
        );
      case "scheduledAppointments":
        return (
          <Link to="/medical-records" key={item.id} className="block">
            <Card className={cn("bg-pink-600", baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
                <CalendarDays className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingScheduledAppointments ? (
                    "..."
                  ) : scheduledAppointmentsCount > 0 ? (
                    scheduledAppointmentsCount.toLocaleString('pt-BR')
                  ) : (
                    "Nenhuma"
                  )}
                </div>
                <p className={textMutedClasses}>agendamentos pendentes</p>
              </CardContent>
            </Card>
          </Link>
        );
      case "waitingAppointments": // NOVO: Renderiza o WaitingAppointmentsCard
        return <WaitingAppointmentsCard key={item.id} />;
      case "averageWaitingTime":
        return <AverageWaitingTimeCard key={item.id} />;
      case "averageConsultationTime":
        return <AverageConsultationTimeCard key={item.id} />;
      case "recentPets":
        return <RecentPetsCard key={item.id} />;
      case "upcomingEvents":
        return <UpcomingEventsCard key={item.id} />;
      case "financialSummary":
        return (
          <Card key={item.id} className={cn("bg-green-600", baseCardClasses)}>
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
          <Card key={item.id} className={cn("bg-teal-600", baseCardClasses)}>
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
          <Link to="/internacao" key={item.id} className="block">
            <Card className={cn("bg-purple-600", baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status de Internação</CardTitle>
                <Bed className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingInternedPatients ? (
                    "..."
                  ) : (
                    <>
                      {internedPatientsCount.toLocaleString('pt-BR')}{" "}
                      {internedPatientsCount === 1 ? "Animal" : "Animais"}
                    </>
                  )}
                </div>
                <p className={textMutedClasses}>atualmente internados</p>
              </CardContent>
            </Card>
          </Link>
        );
      case "veterinariansOnDuty":
        return (
          <Link to="/veterinarios" state={{ activeTab: "escala" }} key={item.id} className="block">
            <Card className={cn("bg-orange-600", baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Veterinários de Plantão</CardTitle>
                <Stethoscope className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vetsOnDutyToday} Veterinário{vetsOnDutyToday !== 1 ? 's' : ''}</div>
                <p className={textMutedClasses}>Disponíveis hoje</p>
              </CardContent>
            </Card>
          </Link>
        );
      case "medicalRecordsSummary":
        return (
          <Card key={item.id} className={cn("bg-cyan-600", baseCardClasses)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resumo da Agenda</CardTitle>
              <FileText className={iconClasses} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50 Agendamentos</div>
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
      return "Bem-vindo(a) ao AsasVet!";
    }
    const prefix = user.gender === "Feminino" ? "Dra." : "Dr.";
    return `Bem-vindo(a) ${prefix} ${user.name}!`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {user?.logoUrl && (
            <img
              src={user.logoUrl}
              alt="Logo da Clínica"
              className="h-24 w-auto max-w-[150px] object-contain"
            />
          )}
          <div>
            <h2 className="text-3xl font-bold">{getGreeting()}</h2>
            <p className="text-muted-foreground">
              Visão geral do seu consultório veterinário.
            </p>
            {user?.role === "Administrador" && (
              <p className="text-green-600 font-semibold mt-2">
                (Você está logado como Administrador e tem acesso total ao sistema.)
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => setIsConfiguratorOpen(true)}
          variant="default"
          className="font-bold"
        >
          <Settings className="mr-2 h-4 w-4" /> Configurar Painel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "financial" | "animalHealth" | "recentActivity")} className="w-full"> {/* 'animalHealth' adicionado novamente ao tipo */}
        <TabsList className="grid w-full grid-cols-4 h-auto p-1"> {/* Alterado para grid-cols-4 */}
          <TabsTrigger value="recentActivity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Atividade Recente</TabsTrigger>
          <TabsTrigger value="animalHealth" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Saúde Animal</TabsTrigger> {/* Adicionado novamente */}
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Financeiro</TabsTrigger>
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
        {/* TabsContent para 'animalHealth' adicionado novamente */}
        <TabsContent value="animalHealth" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "animalHealth")
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
        <TabsContent value="recentActivity" className="mt-4">
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