"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CalendarCheck, Users, MessageSquareText, Leaf, Heart, Briefcase, PawPrint, Lightbulb, TrendingUp, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-verde-bambu text-marrom-avela theme-nature-vet">
      <LandingHeader />

      {/* Hero Section */}
      <section className="landing-page-hero-bg relative min-h-screen flex items-center justify-center text-center p-8 pt-20">
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-creme-terra drop-shadow-lg animate-fade-in-down">
            Cuidado Veterinário Simplificado
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto text-creme-terra/90 animate-fade-in-up">
            Otimize seu tempo, organize sua clínica e foque no que realmente importa: o bem-estar dos animais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-verde-folha-seca hover:bg-verde-folha-seca/90 text-marrom-avela text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Comece Sua Jornada Gratuita
            </Link>
            <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-creme-terra border-creme-terra hover:bg-creme-terra/20 hover:text-creme-terra text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Já sou Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Modernized */}
      <section id="about" className="py-24 px-8 bg-creme-terra text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-verde-folha-seca">Nossa Missão</h2>
            <p className="text-lg md:text-xl text-marrom-avela/90 leading-relaxed">
              Na AsasVet, acreditamos que a paixão por animais deve ser acompanhada por uma gestão eficiente e descomplicada. Desenvolvemos uma plataforma intuitiva e completa, pensada para veterinários que buscam excelência no atendimento e otimização de suas rotinas.
            </p>
            <p className="text-lg md:text-xl text-marrom-avela/90 leading-relaxed">
              Nossa missão é empoderar clínicas e profissionais, liberando tempo para o que realmente importa: cuidar da saúde e felicidade dos pets. Com a AsasVet, você tem mais controle, mais organização e mais tempo para o que ama fazer.
            </p>
            <Link to="/signup" className={cn(buttonVariants({ variant: "link" }), "text-verde-folha-seca hover:text-verde-folha-seca/80 text-lg font-semibold flex items-center")}>
              Conheça Nossa História <Leaf className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="relative h-96 w-full bg-verde-bambu rounded-lg shadow-xl overflow-hidden">
            {/* Placeholder para uma imagem ou ilustração moderna */}
            <img src="/public/images/vet-landing-bg.png" alt="Veterinário cuidando de um animal" className="absolute inset-0 w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center bg-verde-folha-seca/30">
              <PawPrint className="h-24 w-24 text-creme-terra opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section - Modernized */}
      <section id="features" className="py-24 px-8 bg-verde-folha-seca text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-marrom-avela">Recursos Essenciais para o Seu Sucesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-5 bg-creme-terra shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-b-4 border-marrom-avela rounded-xl">
              <div className="p-4 rounded-full bg-verde-bambu text-verde-folha-seca shadow-md">
                <feature.icon className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-marrom-avela">{feature.title}</h3>
              <p className="text-lg text-marrom-avela/80">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section - New Section */}
      <section id="why-choose-us" className="py-24 px-8 bg-bege-areia text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-verde-folha-seca">Por Que Escolher AsasVet?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {whyChooseUs.map((item, index) => (
            <Card key={index} className="flex flex-col items-center p-8 space-y-5 bg-creme-terra shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 border-l-4 border-marrom-avela rounded-xl">
              <div className="p-4 rounded-full bg-verde-folha-seca text-creme-terra shadow-md">
                <item.icon className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-marrom-avela">{item.title}</h3>
              <p className="text-lg text-marrom-avela/80">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section - Modernized */}
      <section className="py-24 px-8 bg-verde-bambu text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-creme-terra">O Que Nossos Clientes Dizem</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="p-10 bg-creme-terra shadow-xl border-l-8 border-verde-folha-seca relative">
            <CardContent className="space-y-6">
              <p className="text-xl md:text-2xl italic text-marrom-avela leading-relaxed">
                "O AsasVet revolucionou a forma como gerencio minha clínica. A agenda é intuitiva, o cadastro de pacientes é completo e o suporte é impecável. Recomendo a todos os colegas!"
              </p>
              <p className="text-lg font-semibold text-verde-folha-seca flex items-center justify-center">
                <Heart className="h-6 w-6 mr-2" /> Dra. Sofia Mendes, Veterinária
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-8 bg-verde-folha-seca text-marrom-avela text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Pronto para Transformar Sua Clínica?</h2>
          <p className="text-xl text-marrom-avela/90">
            Experimente o AsasVet e descubra uma nova era na gestão veterinária.
          </p>
          <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-marrom-avela text-creme-terra hover:bg-marrom-avela/90 text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
            Comece Seu Teste Gratuito
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 bg-creme-terra text-marrom-avela/80 border-t border-marrom-avela/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <PawPrint className="h-6 w-6 text-verde-folha-seca mr-2" />
            <span className="text-lg font-bold text-marrom-avela">AsasVet</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
          <p className="text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;