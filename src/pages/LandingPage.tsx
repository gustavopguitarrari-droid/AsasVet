"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  CalendarCheck,
  Users,
  MessageSquareText,
  Leaf,
  Heart,
  Briefcase,
  PawPrint,
  Lightbulb,
  TrendingUp,
  Clock,
  ClipboardList, // Para Prontuários
  Hospital, // Para Internação
  DollarSign, // Para Financeiro
  Stethoscope, // Para Equipe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';

// Definindo as características principais para a seção de recursos
const coreFeatures = [
  {
    icon: CalendarCheck,
    title: "Agenda Inteligente",
    description: "Gerencie consultas e procedimentos com facilidade, otimizando seu tempo e evitando conflitos.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes e Pets",
    description: "Mantenha todos os dados de tutores e animais organizados, com histórico e informações essenciais.",
  },
  {
    icon: ClipboardList,
    title: "Prontuários Digitais",
    description: "Acesse e atualize prontuários médicos de forma rápida e segura, a qualquer momento.",
  },
  {
    icon: Hospital,
    title: "Controle de Internação",
    description: "Monitore pacientes internados, ações diárias e status de recuperação em tempo real.",
  },
  {
    icon: DollarSign,
    title: "Financeiro Simplificado",
    description: "Gerencie receitas, despesas e débitos de animais com relatórios claros e intuitivos.",
  },
  {
    icon: Stethoscope,
    title: "Gestão de Equipe",
    description: "Organize a escala de trabalho, perfis de veterinários e enfermeiros de forma eficiente.",
  },
];

// Novos recursos para a seção "Por Que Escolher AsasVet?"
const whyChooseUs = [
  {
    icon: Lightbulb,
    title: "Inovação Constante",
    description: "Atualizações regulares com as melhores tecnologias para sua clínica.",
  },
  {
    icon: TrendingUp,
    title: "Otimização de Processos",
    description: "Reduza o tempo gasto em tarefas administrativas e aumente a produtividade.",
  },
  {
    icon: Clock,
    title: "Economia de Tempo",
    description: "Automatize tarefas e tenha mais tempo para o que realmente importa: seus pacientes.",
  },
  {
    icon: Heart,
    title: "Foco no Bem-Estar Animal",
    description: "Ferramentas que facilitam o acompanhamento e o cuidado com cada pet.",
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-landingPage-lp-verde-bambu text-landingPage-lp-marrom-avela theme-nature-vet">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center p-8 pt-20 overflow-hidden">
        {/* Background image with a subtle green overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/vet-landing-bg.png')" }}>
          <div className="absolute inset-0 bg-landingPage-lp-verde-folha-seca opacity-70"></div> {/* Green overlay */}
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-landingPage-lp-creme-terra drop-shadow-lg animate-fade-in-down">
            Gestão Veterinária Intuitiva e Completa
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto text-landingPage-lp-creme-terra/90 animate-fade-in-up">
            Simplifique sua clínica, maximize seu tempo e eleve o cuidado com os animais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-landingPage-lp-marrom-avela hover:bg-landingPage-lp-marrom-avela/90 text-landingPage-lp-creme-terra text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Comece Grátis
            </Link>
            <a href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-landingPage-lp-creme-terra border-landingPage-lp-creme-terra hover:bg-landingPage-lp-creme-terra/20 hover:text-landingPage-lp-creme-terra text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Saiba Mais
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 bg-landingPage-lp-creme-terra text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-landingPage-lp-verde-folha-seca">Recursos Essenciais para o Seu Sucesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-5 bg-landingPage-lp-verde-bambu shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-b-4 border-landingPage-lp-verde-folha-seca rounded-xl">
              <div className="p-4 rounded-full bg-landingPage-lp-creme-terra text-landingPage-lp-marrom-avela shadow-md">
                <feature.icon className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-landingPage-lp-marrom-avela">{feature.title}</h3>
              <p className="text-lg text-landingPage-lp-marrom-avela/80">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-8 bg-landingPage-lp-verde-folha-seca text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-landingPage-lp-marrom-avela">Nossa Paixão: Cuidar de Quem Cuida</h2>
            <p className="text-lg md:text-xl text-landingPage-lp-marrom-avela/90 leading-relaxed">
              Na AsasVet, acreditamos que a paixão por animais deve ser acompanhada por uma gestão eficiente e descomplicada. Desenvolvemos uma plataforma intuitiva e completa, pensada para veterinários que buscam excelência no atendimento e otimização de suas rotinas.
            </p>
            <p className="text-lg md:text-xl text-landingPage-lp-marrom-avela/90 leading-relaxed">
              Nossa missão é empoderar clínicas e profissionais, liberando tempo para o que realmente importa: cuidar da saúde e felicidade dos pets. Com a AsasVet, você tem mais controle, mais organização e mais tempo para o que ama fazer.
            </p>
            <Link to="/signup" className={cn(buttonVariants({ variant: "link" }), "text-landingPage-lp-marrom-avela hover:text-landingPage-lp-marrom-avela/80 text-lg font-semibold flex items-center")}>
              Conheça Nossa História <Leaf className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="relative h-96 w-full bg-landingPage-lp-verde-bambu rounded-xl shadow-xl overflow-hidden"> {/* Alterado para rounded-xl */}
            <img src="/public/images/vet-landing-bg.png" alt="Veterinário cuidando de um animal" className="absolute inset-0 w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center bg-landingPage-lp-verde-folha-seca/30">
              <PawPrint className="h-24 w-24 text-landingPage-lp-creme-terra opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-24 px-8 bg-landingPage-lp-bege-areia text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-landingPage-lp-verde-folha-seca">Por Que Escolher AsasVet?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {whyChooseUs.map((item, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-5 bg-landingPage-lp-creme-terra shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-l-4 border-landingPage-lp-verde-folha-seca rounded-xl">
              <div className="p-4 rounded-full bg-landingPage-lp-verde-folha-seca text-landingPage-lp-creme-terra shadow-md">
                <item.icon className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-landingPage-lp-marrom-avela">{item.title}</h3>
              <p className="text-lg text-landingPage-lp-marrom-avela/80">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-8 bg-landingPage-lp-verde-bambu text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-landingPage-lp-creme-terra">O Que Nossos Clientes Dizem</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="p-10 bg-landingPage-lp-creme-terra shadow-xl border-l-8 border-landingPage-lp-verde-folha-seca relative rounded-xl"> {/* Adicionado rounded-xl */}
            <CardContent className="space-y-6">
              <p className="text-xl md:text-2xl italic text-landingPage-lp-marrom-avela leading-relaxed">
                "O AsasVet revolucionou a forma como gerencio minha clínica. A agenda é intuitiva, o cadastro de pacientes é completo e o suporte é impecável. Recomendo a todos os colegas!"
              </p>
              <p className="text-lg font-semibold text-landingPage-lp-verde-folha-seca flex items-center justify-center">
                <Heart className="h-6 w-6 mr-2" /> Dra. Sofia Mendes, Veterinária
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-8 bg-landingPage-lp-verde-folha-seca text-landingPage-lp-marrom-avela text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Pronto para Transformar Sua Clínica?</h2>
          <p className="text-xl text-landingPage-lp-marrom-avela/90">
            Experimente o AsasVet e descubra uma nova era na gestão veterinária.
          </p>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-landingPage-lp-marrom-avela text-landingPage-lp-creme-terra hover:bg-landingPage-lp-marrom-avela/90 text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
            Comece Seu Teste Gratuito
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 bg-landingPage-lp-creme-terra text-landingPage-lp-marrom-avela/80 border-t border-landingPage-lp-verde-folha-seca/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <PawPrint className="h-6 w-6 text-landingPage-lp-verde-folha-seca mr-2" />
            <span className="text-lg font-bold text-landingPage-lp-marrom-avela">AsasVet</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
          <p className="text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;