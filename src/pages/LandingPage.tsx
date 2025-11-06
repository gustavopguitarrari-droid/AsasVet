"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Removido CardHeader, CardTitle
import { PawPrint, ShieldCheck, CalendarCheck, Users, MessageSquareText, PlayCircle } from 'lucide-react'; // Ícones simplificados, adicionado PlayCircle
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';

// Definindo as características principais para a seção de recursos
const coreFeatures = [
  {
    icon: CalendarCheck,
    title: "Agenda Inteligente",
    description: "Gerencie consultas e procedimentos com facilidade, otimizando seu tempo.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes e Pets",
    description: "Mantenha todos os dados de tutores e animais organizados em um só lugar.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança de Dados",
    description: "Suas informações protegidas com a melhor tecnologia e políticas de segurança.",
  },
  {
    icon: MessageSquareText,
    title: "Suporte Dedicado",
    description: "Conte com nossa equipe de suporte pronta para ajudar sempre que precisar.",
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground theme-neutral-modern">
      <LandingHeader />

      {/* Hero Section - Modern & Minimalist */}
      <section 
        className="relative h-screen flex items-center justify-center text-center p-8 pt-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/vet-landing-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div> {/* Opacidade ajustada para 10% */}
        <div className="relative z-10 max-w-4xl mx-auto text-white space-y-6">
          <PawPrint className="h-24 w-24 mx-auto text-white animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg text-white">
            Simplifique a Gestão da Sua Clínica Veterinária
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            Foco total no cuidado animal, nós cuidamos da burocracia.
          </p>
          <div className="flex justify-center space-x-4 mt-8">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 shadow-lg transition-all duration-300 ease-in-out hover:scale-105")}>
              Comece Grátis
            </Link>
            <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-white border-white hover:bg-white hover:text-primary text-lg px-8 py-4 shadow-lg transition-all duration-300 ease-in-out hover:scale-105")}>
              Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section id="video" className="py-20 px-8 bg-background text-center">
        <h2 className="text-4xl font-bold mb-12 text-primary flex items-center justify-center">
          <PlayCircle className="h-10 w-10 mr-4" /> Veja o AsasVet em Ação
        </h2>
        <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-lg shadow-xl overflow-hidden border-2 border-primary">
          {/* Placeholder for a real system video. Replace 'YOUR_SYSTEM_VIDEO_EMBED_URL' with your actual video URL. */}
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/VIDEO_ID_DO_SEU_SISTEMA" // Substitua 'VIDEO_ID_DO_SEU_SISTEMA' pelo ID real do seu vídeo no YouTube
            title="AsasVet System Showcase"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          (Este é um vídeo de demonstração. Substitua o 'VIDEO_ID_DO_SEU_SISTEMA' no código pelo ID do seu vídeo real no YouTube!)
        </p>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-8 bg-muted text-center">
        <h2 className="text-4xl font-bold mb-12 text-primary">Soluções Essenciais para Sua Clínica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-6 space-y-4 bg-card shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-t-2 border-primary">
              <feature.icon className="h-16 w-16 text-primary" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-md text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Simple Call to Action */}
      <section className="py-20 px-8 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold leading-tight">Pronto para Otimizar sua Gestão?</h2>
          <p className="text-lg text-primary-foreground/90">
            Experimente o AsasVet e descubra como é fácil gerenciar sua clínica.
          </p>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-gray-100 text-xl px-8 py-5 shadow-lg transition-all duration-300 ease-in-out hover:scale-105")}>
            Comece Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 bg-card text-center text-muted-foreground border-t border-border">
        <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
      </footer>
    </div>
  );
};

export default LandingPage;