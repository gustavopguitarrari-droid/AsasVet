"use client";

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CeoAuth from '@/components/ceo/CeoAuth';
import MetricCard from '@/components/ceo/MetricCard';
import { Users, PawPrint, CalendarCheck, DollarSign, Crown, ArrowUpRight, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  plan_name: string;
  first_name: string;
  last_name: string;
  email: string;
  registered_time: string;
}

const CeoDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['ceoDashboardStats'],
    queryFn: async () => {
      const { count: totalClients, error: clientsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalPets, error: petsError } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true });

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('type', 'Entrada');

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, plan_name, first_name, last_name, email, registered_time')
        .order('registered_time', { ascending: false });

      if (clientsError || petsError || transactionsError || profilesError) {
        throw new Error(clientsError?.message || petsError?.message || transactionsError?.message || profilesError?.message);
      }

      const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

      return {
        totalClients: totalClients || 0,
        totalPets: totalPets || 0,
        totalRevenue,
        profiles: (profiles as Profile[]) || [],
      };
    },
    enabled: isAuthenticated, // A query só roda depois da autenticação
  });

  const planDistribution = useMemo(() => {
    if (!stats?.profiles) return {};
    return stats.profiles.reduce((acc, profile) => {
      const plan = profile.plan_name || 'Não definido';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [stats?.profiles]);

  if (!isAuthenticated) {
    return <CeoAuth onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Painel do CEO</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Clínicas (Usuários)"
            value={stats?.totalClients ?? 0}
            icon={Users}
            isLoading={isLoading}
          />
          <MetricCard
            title="Total de Animais Cadastrados"
            value={stats?.totalPets ?? 0}
            icon={PawPrint}
            isLoading={isLoading}
          />
          <MetricCard
            title="Receita Total (Vendas)"
            value={`R$ ${(stats?.totalRevenue ?? 0).toFixed(2).replace('.', ',')}`}
            icon={DollarSign}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(planDistribution).map(([planName, count]) => (
            <MetricCard
              key={planName}
              title={`Plano: ${planName}`}
              value={count}
              icon={Crown}
              description="Clínicas ativas neste plano"
              isLoading={isLoading}
            />
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Últimos Cadastros</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica/Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center">Carregando...</TableCell></TableRow>
                ) : (
                  stats?.profiles.slice(0, 10).map(profile => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.first_name} {profile.last_name}</TableCell>
                      <TableCell>{profile.plan_name || 'Não definido'}</TableCell>
                      <TableCell>{format(new Date(profile.registered_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CeoDashboard;