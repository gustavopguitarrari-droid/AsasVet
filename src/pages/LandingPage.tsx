"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button'; // Importar buttonVariants
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PawPrint, DollarSign, Users, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader'; // Importar o novo componente

const plans = [
  {
    name: "Básico",
    price: "R$ 49/mês",
    features: [
      "Gerenciamento de Clientes e Pets",
      "Agenda Básica",
      "1 Usuário",
      "Suporte por E-mail",
    ],
    buttonText: "Começar Grátis",
    highlight: false,
  },
  {
    name: "Premium",
    price: "R$ 99/mês",
    features: [
      "Todos os recursos do Básico",
      "Internação e Mapa de Execução",
      "Caixa e Financeiro Completo",
      "Até 5 Usuários",
      "Suporte Prioritário",
    ],
    buttonText: "Assinar Premium",
    highlight: true,
  },
  {
    name: "Empresarial",
    price: "R$ 199/mês",
    features: [
      "Todos os recursos do Premium",
      "Gerenciamento de Estoque",
      "Relatórios Avançados",
      "Usuários Ilimitados",
      "Suporte Dedicado 24/7",
    ],
    buttonText: "Fale Conosco",
    highlight: false,
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader /> {/* Adiciona o cabeçalho aqui */}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-8 login-art-bg pt-20"> {/* Adicionado pt-20 para compensar o header fixo */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-white space-y-6">
          <PawPrint className="h-24 w-24 mx-auto text-primary-foreground" />
          <h1 className="text-5xl font-bold leading-tight">
            AsasVet: A Gestão Veterinária que Você Merece
          </h1>
          <p className="text-xl text-gray-200">
            Simplifique o dia a dia da sua clínica com uma plataforma completa e intuitiva.
            Mais tempo para cuidar dos seus pacientes, menos para a burocracia.
          </p>
          <div className="flex justify-center space-x-4 mt-8">
            <Link to="/login" className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-primary/90 text-primary-foreground")}>
              Entrar
            </Link>
            <Link to="/login" state={{ view: 'sign_up' }} className={cn(buttonVariants({ size: "lg", variant: "outline" }), "text-white border-white hover:bg-white hover:text-primary")}>
              Cadastre-se
            </Link>
          </div>
        </div >
      </section >

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-muted text-center"> {/* Adicionado id="features" */}
        <h2 className="text-4xl font-bold mb-12">Recursos que Transformam</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <Users className="h-16 w-16 text-primary" />
            <h3 className="text-2xl font-semibold">Gestão de Clientes e Pets</h3>
            <p className="text-muted-foreground">
              Mantenha todos os dados de tutores e animais organizados e acessíveis.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <ShieldCheck className="h-16 w-16 text-primary" />
            <h3 className="text-2xl font-semibold">Segurança e Confiabilidade</h3>
            <p className="text-muted-foreground">
              Seus dados protegidos com a melhor tecnologia e políticas de segurança.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <DollarSign className="h-16 w-16 text-primary" />
            <h3 className="text-2xl font-semibold">Controle Financeiro</h3>
            <p className="text-muted-foreground">
              Gerencie seu caixa, transações e tenha uma visão clara da saúde financeira.
            </p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 px-8 bg-background text-center"> {/* Adicionado id="plans" */}
        <h2 className="text-4xl font-bold mb-12">Escolha o Plano Ideal para Você</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "flex flex-col justify-between p-8 border-2",
                plan.highlight ? "border-primary shadow-lg scale-105" : "border-border"
              )}
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <p className="text-4xl font-extrabold text-primary mb-6">{plan.price}</p>
                <ul className="space-y-3 text-left text-muted-foreground mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/login"
                state={{ view: 'sign_up' }}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full",
                  plan.highlight ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                )}
              >
                {plan.buttonText}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 bg-card text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
        <p className="mt-2">Um desenvolvimento Agronegócios Guitarrari®</p>
      </footer>
    </div >
  );
};

export default LandingPage;