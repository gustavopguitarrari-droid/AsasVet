"use client";

import React, { useMemo } from "react";
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
import { format, isThisMonth, parseISO } from "date-fns";
import { Transaction } from "@/types/cashier";

// Importar os novos componentes de gráfico
import AppointmentsMonthlyChart from "@/components/charts/AppointmentsMonthlyChart";
import AppointmentsWeeklyChart from "@/components/charts/AppointmentsWeeklyChart";
import RevenueMonthlyChart from "@/components/charts/RevenueMonthlyChart";
import PetsBySpeciesChart from "@/components/charts/PetsBySpeciesChart";
import AverageWaitingTimeCard from "@/components/AverageWaitingTimeCard";
import AverageConsultationTimeCard from "@/components/AverageConsultationTimeCard";
import UpcomingEventsCard from "@/components/UpcomingEventsCard";
import RecentPetsCard from "@/components/RecentPetsCard";
import WaitingAppointmentsCard from "@/components/WaitingAppointmentsCard";

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
  category: "overview" | "financial" | "recentActivity";
  order: number;
}

const initialDashboardConfig: DashboardItemConfig[] = [
  { id: "totalClients", name: "Total de Tutores", isVisible: true, category: "overview", order: 0 },
  { id: "totalPets", name: "Total de Animais", isVisible: true, category: "overview", order: 1 },
  { id: "scheduledAppointments", name: "Consultas Agendadas", isVisible: true, category: "overview", order: 2 },
  { id: "waitingAppointments", name: "Consultas Em Espera", isVisible: true, category: "overview", order: 3 },
  { id: "averageWaitingTime", name: "Média de Tempo de Espera", isVisible: true, category: "overview", order: 4 },
  { id: "averageConsultationTime", name: "Média de Tempo da Consulta", isVisible: true, category: "overview", order: 5 },
  { id: "recentPets", name: "Últimos Animais Cadastrados", isVisible: true, category: "recentActivity", order: 0 },
  { id: "upcomingEvents", name: "Próximos Eventos", isVisible: true, category: "recentActivity", order: 1 },
  { id: "financialSummary", name: "Resumo Financeiro", isVisible: true, category: "financial", order: 0 },
  { id: "cashFlow", name: "Fluxo de Caixa", isVisible: true, category: "financial", order: 1 },
  { id: "internmentStatus", name: "Status de Internação", isVisible: true, category: "overview", order: 6 },
  { id: "veterinariansOnDuty", name: "Veterinários de Plantão", isVisible: true, category: "overview", order: 7 },
  { id: "medicalRecordsSummary", name: "Eventos Pendentes", isVisible: true, category: "overview", order: 8 },
  { id: "appointmentsMonthlyChart", name: "Consultas por Mês (Gráfico)", isVisible: true, category: "overview", order: 9 },
  { id: "appointmentsWeeklyChart", name: "Consultas por Semana (Gráfico)", isVisible: true, category: "overview", order: 10 },
  { id: "revenueMonthlyChart", name: "Receita por Mês (Gráfico)", isVisible: true, category: "financial", order: 2 },
  { id: "petsBySpeciesChart", name: "Animais por Espécie (Gráfico)", isVisible: true, category: "overview", order: 11 },
];

const dashboardCardClasses = [
  "bg-dashboard-card-1",
  "bg-dashboard-card-2",
  "bg-dashboard-card-3",
  "bg-dashboard-card-4",
  "bg-dashboard-card-5",
  "bg-dashboard-card-6",
  "bg-dashboard-card-7",
  "bg-dashboard-card-8",
  "bg-dashboard-card-9",
  "bg-dashboard-card-10",
  "bg-dashboard-card-11",
  "bg-dashboard-card-12",
];

const Dashboard = () => {
  const [isConfiguratorOpen, setIsConfiguratorOpen] = React.useState(false);
  const [dashboardConfig, setDashboardConfig] = React.useState<DashboardItemConfig[]>(
    initialDashboardConfig
  );
  const [activeTab, setActiveTab] = React.useState<"overview" | "financial" | "recentActivity">("recentActivity");
  const [vetsOnDutyToday, setVetsOnDutyToday] = React.useState<number>(0);

  const { user } = useUser();
  const userId = user?.id;
  const organizationId = user?.organizationId;

  const { data: totalClients = 0, isLoading: isLoadingClients } = useQuery<number>({
    queryKey: ['totalClients', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return 0;
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('organization_id', organizationId);
      if (error) {
        console.error("Erro ao buscar contagem de clientes:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId && !!organizationId,
  });

  const { data: totalPets = 0, isLoading: isLoadingPets } = useQuery<number>({
    queryKey: ['totalPets', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return 0;
      const { count, error } = await supabase
        .from('pets')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);
      if (error) {
        console.error("Erro ao buscar contagem de pets:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId && !!organizationId,
  });

  const { data: scheduledAppointmentsCount = 0, isLoading: isLoadingScheduledAppointments } = useQuery<number>({
    queryKey: ['scheduledAppointmentsCount', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return 0;
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'Agendada');
      if (error) {
        console.error("Erro ao buscar contagem de consultas agendadas (appointments):", error);
        throw error;
      }
      console.log("Contagem de consultas agendadas (appointments) do Supabase:", count);
      return count || 0;
    },
    enabled: !!userId && !!organizationId,
  });

  const { data: internedPatientsCount = 0, isLoading: isLoadingInternedPatients } = useQuery<number>({
    queryKey: ['internedPatientsCount', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return 0;
      const { count, error } = await supabase
        .from('interned_patients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .neq('status', 'Alta')
        .neq('status', 'Óbito');
      if (error) {
        console.error("Erro ao buscar contagem de pacientes internados:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId && !!organizationId,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) {
        console.error("Erro ao buscar transações:", error);
        throw error;
      }
      return data as Transaction[];
    },
    enabled: !!organizationId,
  });

  const { data: totalEvents = 0, isLoading: isLoadingEvents } = useQuery<number>({
    queryKey: ['totalEvents', organizationId],
    queryFn: async () => {
      if (!organizationId) return 0;
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'Agendada'); // Conta apenas eventos pendentes
      if (error) {
        console.error("Erro ao buscar contagem de eventos:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!organizationId,
  });

  const financialSummary = useMemo(() => {
    if (!transactions) return { monthRevenue: 0, currentBalance: 0 };

    const now = new Date();
    const monthRevenue = transactions
      .filter(tx => tx.type === 'Entrada' && isThisMonth(parseISO(tx.date)))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalRevenue = transactions
      .filter(tx => tx.type === 'Entrada')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalExpenses = transactions
      .filter(tx => tx.type === 'Saída')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const currentBalance = totalRevenue - totalExpenses;

    return { monthRevenue, currentBalance };
  }, [transactions]);

  React.useEffect(() => {
    const savedConfigString = localStorage.getItem("dashboardConfig");
    let savedConfig: DashboardItemConfig[] = [];
    if (savedConfigString) {
      try {
        savedConfig = JSON.parse(savedConfigString);
      } catch (error) {
        console.error("Erro ao analisar a configuração salva do painel:", error);
      }
    }

    const savedConfigMap = new Map(savedConfig.map(item => [item.id, item]));

    const mergedConfig = initialDashboardConfig.map(initialItem => {
      const savedItem = savedConfigMap.get(initialItem.id);
      if (savedItem) {
        return {
          ...initialItem,
          isVisible: savedItem.isVisible,
          category: savedItem.category,
          order: savedItem.order !== undefined ? savedItem.order : initialItem.order,
        };
      }
      return initialItem;
    });

    setDashboardConfig(mergedConfig);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem(`teamSchedule_${organizationId}`);
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
  }, [organizationId]);

  const handleSaveConfig = (newConfig: DashboardItemConfig[]) => {
    setDashboardConfig(newConfig);
    localStorage.setItem("dashboardConfig", JSON.stringify(newConfig));
  };

  const getCardComponent = (item: DashboardItemConfig) => {
    const baseCardClasses = "shadow-md text-foreground";
    const iconClasses = "h-4 w-4 text-foreground";
    const textMutedClasses = "text-muted-foreground";
    const cardBgClass = dashboardCardClasses[item.order % dashboardCardClasses.length];

    switch (item.id) {
      case "totalClients":
        return (
          <Link to="/cadastro" key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tutores</CardTitle>
                <Users className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingClients ? "..." : totalClients.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      case "totalPets":
        return (
          <Link to="/cadastro" state={{ activeTab: "animais" }} key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
                <PawPrint className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPets ? "..." : totalPets.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      case "scheduledAppointments":
        return (
          <Link to="/medical-records" key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
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
      case "waitingAppointments":
        return <WaitingAppointmentsCard key={item.id} />;
      case "averageWaitingTime":
        return <AverageWaitingTimeCard key={item.id} className={cardBgClass} />;
      case "averageConsultationTime":
        return <AverageConsultationTimeCard key={item.id} className={cardBgClass} />;
      case "recentPets":
        return <RecentPetsCard key={item.id} className={cardBgClass} />;
      case "upcomingEvents":
        return <UpcomingEventsCard key={item.id} className={cardBgClass} />;
      case "financialSummary":
        return (
          <Link to="/financeiro" key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumo Financeiro</CardTitle>
                <DollarSign className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingTransactions ? "..." : `R$ ${financialSummary.monthRevenue.toFixed(2).replace('.', ',')}`}
                </div>
                <p className={textMutedClasses}>Receita do mês</p>
              </CardContent>
            </Card>
          </Link>
        );
      case "cashFlow":
        return (
          <Link to="/financeiro/fluxo-de-caixa" key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
                <DollarSign className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", financialSummary.currentBalance >= 0 ? "text-green-600" : "text-red-600")}>
                  {isLoadingTransactions ? "..." : `R$ ${financialSummary.currentBalance.toFixed(2).replace('.', ',')}`}
                </div>
                <p className={textMutedClasses}>Saldo atual</p>
              </CardContent>
            </Card>
          </Link>
        );
      case "internmentStatus":
        return (
          <Link to="/internacao" key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
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
            <Card className={cn(cardBgClass, baseCardClasses)}>
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
          <Link to="/medical-records" key={item.id} className="block">
            <Card className={cn(cardBgClass, baseCardClasses)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Pendentes</CardTitle>
                <FileText className={iconClasses} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingEvents ? "..." : `${totalEvents.toLocaleString('pt-BR')} Evento${totalEvents !== 1 ? 's' : ''}`}
                </div>
                <p className={textMutedClasses}>Eventos pendentes na agenda</p>
              </CardContent>
            </Card>
          </Link>
        );
      case "appointmentsMonthlyChart":
        return <AppointmentsMonthlyChart key={item.id} className={cardBgClass} />;
      case "appointmentsWeeklyChart":
        return <AppointmentsWeeklyChart key={item.id} className={cardBgClass} />;
      case "revenueMonthlyChart":
        return (
          <Link to="/financeiro/relatorios" key={item.id} className="block">
            <RevenueMonthlyChart className={cardBgClass} transactions={transactions} isLoading={isLoadingTransactions} />
          </Link>
        );
      case "petsBySpeciesChart":
        return <PetsBySpeciesChart key={item.id} className={cardBgClass} />;
      default:
        return null;
    }
  };

  const getGreeting = () => {
    if (!user) {
      return "Bem-vindo(a)!";
    }
    const prefix = user.gender === "Feminino" ? "Dra." : "Dr.";
    return `Bem-vindo(a) ${prefix} ${user.name}!`;
  };

  const firstNameInitial = user?.name ? user.name.charAt(0) : '';
  const lastNameInitial = user?.lastName ? user.lastName.charAt(0) : '';
  const initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {user?.logoUrl ? (
            <img 
              src={user.logoUrl} 
              alt={user.companyName || "Logo da Clínica"} 
              className="h-32 w-auto mr-4 object-contain"
            />
          ) : (
            <div className="h-32 w-32 flex items-center justify-center bg-muted text-muted-foreground mr-4 rounded-lg shadow-sm">
              <PawPrint className="h-20 w-20" />
            </div>
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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "financial" | "recentActivity")} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="recentActivity" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Atividade Recente</TabsTrigger>
          <TabsTrigger value="overview" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Financeiro</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "overview")
              .sort((a, b) => a.order - b.order)
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "financial")
              .sort((a, b) => a.order - b.order)
              .map(item => getCardComponent(item))}
          </div>
        </TabsContent>
        <TabsContent value="recentActivity" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboardConfig
              .filter(item => item.isVisible && item.category === "recentActivity")
              .sort((a, b) => a.order - b.order)
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