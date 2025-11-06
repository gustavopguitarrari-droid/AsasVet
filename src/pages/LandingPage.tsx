"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CalendarCheck, Users, MessageSquareText, PlayCircle } from 'lucide-react'; // Removido Quote
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
    title: "Gestão Completa de Clientes e Pets",
    description: "Mantenha todos os dados de tutores e animais organizados, com histórico e informações essenciais.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança e Privacidade de Dados",
    description: "Suas informações protegidas com criptografia de ponta e políticas de segurança rigorosas.",
  },
  {
    icon: MessageSquareText,
    title: "Suporte Dedicado e Rápido",
    description: "Conte com nossa equipe de suporte especializada, pronta para ajudar sempre que precisar.",
  },
];

// Dados de depoimentos (exemplo) - REMOVIDO

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground theme-neutral-modern">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-8 pt-20 login-art-bg text-white">
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg animate-fade-in-down">
            A Gestão Veterinária que Você Sempre Sonhou
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto opacity-90 animate-fade-in-up">
            Otimize seu tempo, organize sua clínica e foque no que realmente importa: o bem-estar dos animais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-white hover:bg-gray-100 text-primary text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Comece Grátis Agora
            </Link>
            <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-white border-white hover:bg-white hover:text-primary text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Já sou Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section (Placeholder) */}
      <section className="py-24 px-8 bg-muted text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-primary">Veja o AsasVet em Ação</h2>
        <div className="max-w-4xl mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl overflow-hidden relative aspect-video flex items-center justify-center">
          <PlayCircle className="h-24 w-24 text-primary opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
          <p className="absolute bottom-4 text-sm text-muted-foreground">
            (Placeholder de vídeo - clique para simular a reprodução)
          </p>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24 px-8 bg-background text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-primary">Recursos Essenciais para o Seu Sucesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-5 bg-card shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-t-4 border-primary rounded-xl">
              <feature.icon className="h-16 w-16 text-primary" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-lg text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section - REMOVIDO */}

      {/* Call to Action */}
      <section className="py-24 px-8 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Transforme a Gestão da Sua Clínica Hoje!</h2>
          <p className="text-xl text-primary-foreground/90">
            Junte-se a centenas de veterinários que já estão otimizando seus processos com o AsasVet.
          </p>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-gray-100 text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
            Comece Sua Jornada Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 bg-card text-center text-muted-foreground border-t border-border">
        <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
      </footer>
    </div>
  );
};

export default LandingPage;