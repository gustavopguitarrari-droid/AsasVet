"use client";

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import LandingPageHeader from '@/components/LandingPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, PawPrint, CalendarDays, DollarSign, Bed, Stethoscope, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Gestão de Clientes e Pets",
    description: "Cadastre tutores e seus animais com detalhes completos e histórico.",
    icon: Users,
  },
  {
    title: "Agenda Inteligente",
    description: "Organize consultas, vacinas e cirurgias com facilidade e lembretes.",
    icon: CalendarDays,
  },
  {
    title: "Internação e Mapa de Execução",
    description: "Controle pacientes internados, baias e ações diárias de forma visual.",
    icon: Bed,
  },
  {
    title: "Financeiro e Caixa",
    description: "Gerencie entradas, saídas, fluxo de caixa e relatórios financeiros.",
    icon: DollarSign,
  },
  {
    title: "Estoque Otimizado",
    description: "Mantenha o controle de produtos, medicamentos e insumos da clínica.",
    icon: Package,
  },
  {
    title: "Equipe e Escala",
    description: "Gerencie sua equipe de veterinários e organize a escala de trabalho.",
    icon: Stethoscope,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/painel', { replace: true });
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingPageHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary to-blue-700 text-primary-foreground flex items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='20' cy='20' r='8' fill='white' opacity='0.1'/><circle cx='80' cy='50' r='6' fill='white' opacity='0.08'/><circle cx='50' cy='80' r='7' fill='white' opacity='0.12'/></svg>')]"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              AsasVet: A Gestão Veterinária Completa na Palma da Sua Mão
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Simplifique o dia a dia da sua clínica com agendamentos, prontuários, internação, financeiro e muito mais. Tudo em um só lugar.
            </p>
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 rounded-full shadow-lg">
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
              Recursos que Transformam Sua Clínica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col items-center p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-secondary text-secondary-foreground text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
          <p className="text-xs mt-2">Um desenvolvimento Agronegócios Guitarrari®</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;