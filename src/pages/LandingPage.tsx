"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CalendarCheck, Users, MessageSquareText, PlayCircle } from 'lucide-react';
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

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-verde-bambu text-marrom-avela theme-nature-vet">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-8 pt-20 bg-verde-bambu text-marrom-avela">
        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg animate-fade-in-down">
            A Gestão Veterinária que Você Sempre Sonhou
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto opacity-90 animate-fade-in-up">
            Otimize seu tempo, organize sua clínica e foque no que realmente importa: o bem-estar dos animais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-verde-folha-seca hover:bg-verde-folha-seca/90 text-marrom-avela text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Teste Grátis Agora
            </Link>
            <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-marrom-avela border-marrom-avela hover:bg-verde-folha-seca hover:text-marrom-avela text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Já sou Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section (Placeholder) */}
      <section className="py-24 px-8 bg-creme-terra text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-verde-folha-seca">Veja o AsasVet em Ação</h2>
        <div className="max-w-4xl mx-auto bg-bege-areia rounded-lg shadow-xl overflow-hidden relative aspect-video flex items-center justify-center">
          <PlayCircle className="h-24 w-24 text-verde-folha-seca opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
          <p className="absolute bottom-4 text-sm text-marrom-avela/80">
            (Placeholder de vídeo - clique para simular a reprodução)
          </p>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24 px-8 bg-verde-bambu text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-verde-folha-seca">Recursos Essenciais para o Seu Sucesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-5 bg-creme-terra shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-t-4 border-verde-folha-seca rounded-xl">
              <feature.icon className="h-16 w-16 text-verde-folha-seca" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-marrom-avela">{feature.title}</h3>
              <p className="text-lg text-marrom-avela/80">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-8 bg-verde-folha-seca text-marrom-avela text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Transforme a Gestão da Sua Clínica Hoje!</h2>
          <p className="text-xl text-marrom-avela/90">
            Junte-se a centenas de veterinários que já estão otimizando seus processos com o AsasVet.
          </p>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-marrom-avela text-creme-terra hover:bg-marrom-avela/90 text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
            Teste Sua Jornada Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 bg-creme-terra text-marrom-avela/80 border-t border-marrom-avela/20">
        <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
      </footer>
    </div>
  );
};

export default LandingPage;