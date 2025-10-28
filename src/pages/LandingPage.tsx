"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PawPrint, DollarSign, Users, ShieldCheck, CalendarCheck, ClipboardList, Hospital, Package, MessageSquareText, Star } from 'lucide-react'; // Novos ícones
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';

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

const features = [
  {
    icon: Users,
    title: "Gestão Completa de Clientes e Pets",
    description: "Mantenha todos os dados de tutores e animais organizados, com histórico médico e informações de contato sempre à mão.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda Inteligente e Consultas",
    description: "Gerencie agendamentos, consultas e procedimentos de forma eficiente, otimizando o tempo da sua equipe.",
  },
  {
    icon: Hospital,
    title: "Controle de Internação e Mapa de Execução",
    description: "Monitore pacientes internados, registre ações diárias e acompanhe o progresso com um mapa de execução intuitivo.",
  },
  {
    icon: DollarSign,
    title: "Caixa e Controle Financeiro",
    description: "Gerencie vendas, transações, fluxo de caixa e tenha uma visão clara da saúde financeira da sua clínica.",
  },
  {
    icon: Package,
    title: "Gestão de Produtos e Estoque",
    description: "Controle seu inventário de produtos e serviços, adicione novos itens e gerencie o estoque de forma simplificada.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança e Confiabilidade de Dados",
    description: "Seus dados protegidos com a melhor tecnologia e políticas de segurança, garantindo a privacidade das informações.",
  },
  {
    icon: MessageSquareText,
    title: "Suporte Dedicado e Rápido",
    description: "Conte com uma equipe de suporte pronta para ajudar, garantindo que você tenha a melhor experiência com a plataforma.",
  },
  {
    icon: ClipboardList,
    title: "Prontuários Médicos Digitais",
    description: "Crie e acesse prontuários completos, com anamnese, exames, diagnósticos e tratamentos, tudo em um só lugar.",
  },
];

const testimonials = [
  {
    quote: "AsasVet transformou a gestão da minha clínica. A organização dos prontuários e a facilidade de agendamento são incríveis!",
    name: "Dra. Camila Santos",
    title: "Veterinária Chefe",
  },
  {
    quote: "Nunca imaginei que um software pudesse simplificar tanto o meu dia a dia. O controle de internação é um diferencial enorme.",
    name: "Dr. Rafael Costa",
    title: "Clínico Geral",
  },
  {
    quote: "O suporte é excelente e a plataforma é super intuitiva. Recomendo a todos os meus colegas veterinários!",
    name: "Ana Paula Lima",
    title: "Gerente Administrativa",
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-8 login-art-bg pt-20">
        <div className="absolute inset-0 bg-black opacity-60"></div> {/* Overlay mais escuro */}
        <div className="relative z-10 max-w-5xl mx-auto text-white space-y-8">
          <PawPrint className="h-28 w-28 mx-auto text-primary-foreground animate-pulse" /> {/* Ícone maior e animado */}
          <h1 className="text-6xl font-extrabold leading-tight drop-shadow-lg">
            AsasVet: A Gestão Veterinária que Você Merece
          </h1>
          <p className="text-2xl text-gray-200 max-w-3xl mx-auto">
            Simplifique o dia a dia da sua clínica com uma plataforma completa e intuitiva.
            Mais tempo para cuidar dos seus pacientes, menos para a burocracia.
          </p>
          <div className="flex justify-center space-x-6 mt-10">
            <Link to="/login" className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-8 py-6 shadow-lg transition-all duration-300 ease-in-out hover:scale-105")}>
              Entrar
            </Link>
            <Link to="/signup" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "text-white border-white hover:bg-white hover:text-primary text-xl px-8 py-6 shadow-lg transition-all duration-300 ease-in-out hover:scale-105")}>
              Cadastre-se Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 bg-muted text-center">
        <h2 className="text-5xl font-extrabold mb-16 text-primary">Recursos que Transformam sua Clínica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-6 bg-card shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-t-4 border-primary">
              <feature.icon className="h-20 w-20 text-primary" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
              <p className="text-lg text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-8 bg-background text-center">
        <h2 className="text-5xl font-extrabold mb-16 text-primary">O que Nossos Clientes Dizem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-6 bg-card shadow-lg border-l-4 border-secondary">
              <Star className="h-12 w-12 text-yellow-500" fill="currentColor" />
              <p className="text-lg italic text-foreground">"{testimonial.quote}"</p>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-2">
                  {testimonial.name.charAt(0)}
                </div>
                <p className="font-bold text-lg text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-24 px-8 bg-muted text-center">
        <h2 className="text-5xl font-extrabold mb-16 text-primary">Escolha o Plano Ideal para Você</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "flex flex-col justify-between p-10 border-4 transition-all duration-300 ease-in-out transform hover:-translate-y-2",
                plan.highlight ? "border-primary shadow-2xl scale-105" : "border-border shadow-lg"
              )}
            >
              <div>
                <h3 className="text-3xl font-bold mb-4 text-foreground">{plan.name}</h3>
                <p className="text-5xl font-extrabold text-primary mb-8">{plan.price}</p>
                <ul className="space-y-4 text-left text-lg text-muted-foreground mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="h-6 w-6 mr-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full text-xl py-6",
                  plan.highlight ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
                )}
              >
                {plan.buttonText}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="py-24 px-8 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl font-extrabold leading-tight">Pronto para Transformar sua Clínica?</h2>
          <p className="text-xl text-primary-foreground/90">
            Junte-se a centenas de veterinários que já estão otimizando sua gestão com AsasVet.
            Experimente agora e descubra um novo nível de eficiência!
          </p>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-gray-100 text-2xl px-10 py-7 shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
            Comece Gratuitamente
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 bg-card text-center text-muted-foreground border-t border-border">
        <p className="text-lg">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
        <p className="mt-3 text-md">Um desenvolvimento Agronegócios Guitarrari®</p>
      </footer>
    </div>
  );
};

export default LandingPage;