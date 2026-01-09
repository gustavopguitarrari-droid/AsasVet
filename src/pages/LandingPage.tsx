"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { PawPrint, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import LandingHeader from '@/components/LandingHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Definição dos planos para a Landing Page
interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  badgeText: string;
  badgeColorClass: string;
}

const availablePlans: Plan[] = [
  {
    id: "vet-domiciliar",
    name: "ASAS VERDES",
    price: "R$ 119,90/mês",
    features: ["1 Subusuário", "Gerenciamento de Clientes e Pets", "Agenda Básica"],
    badgeText: "Básico",
    badgeColorClass: "bg-green-500",
  },
  {
    id: "clinica-vet",
    name: "ASAS ROXAS",
    price: "R$ 200,00/mês",
    features: ["3 Subusuários", "Gerenciamento Completo", "Internação", "Caixa e Financeiro", "Suporte Prioritário"],
    badgeText: "Premium",
    badgeColorClass: "bg-purple-500",
  },
  {
    id: "hospital-vet",
    name: "ASAS DOURADAS",
    price: "R$ 299,90/mês",
    features: ["10 Subusuários", "Todos os recursos Premium", "Relatórios Avançados", "Integrações Personalizadas", "Suporte Dedicado 24/7"],
    badgeText: "Empresarial",
    badgeColorClass: "bg-blue-500",
  },
];

const LandingPage: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const textToType = "Muito mais que Simples. Aqui você ganha ASAS!";
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDelay = 1500; // 1.5 segundos de pausa

  useEffect(() => {
    const handleTyping = () => {
      const currentText = isDeleting
        ? textToType.substring(0, typedText.length - 1)
        : textToType.substring(0, typedText.length + 1);

      setTypedText(currentText);

      if (!isDeleting && currentText === textToType) {
        // Pausa no final antes de apagar
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    let delay = isDeleting ? deletingSpeed : typingSpeed;

    // Adiciona a pausa após a primeira frase
    if (!isDeleting && typedText === "Muito mais que Simples.") {
      delay = pauseDelay;
    }

    const typingTimeout = setTimeout(handleTyping, delay);

    return () => clearTimeout(typingTimeout);
  }, [typedText, isDeleting, loopNum]);

  return (
    <div className="min-h-screen bg-landingPage-lp-creme-terra text-landingPage-lp-marrom-avela theme-nature-vet flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <main id="hero" className="relative flex-1 flex items-center justify-center text-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/vet-landing-bg.png')" }}>
          <div className="absolute inset-0 bg-landingPage-lp-marrom-avela opacity-50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-landingPage-lp-creme-terra drop-shadow-lg h-48 md:h-56">
            {typedText}
            <span className="typing-cursor"></span>
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto text-landingPage-lp-creme-terra/90 animate-fade-in-up">
            Organize consultas, prontuários e finanças em um só lugar. Mais tempo para o que realmente importa: cuidar dos animais.
          </p>
          <div className="mt-10 animate-fade-in-up">
            <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-landingPage-lp-verde-folha-seca hover:bg-landingPage-lp-verde-folha-seca/90 text-white text-xl px-10 py-6 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-105")}>
              Crie sua Conta Grátis
            </Link>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-landingPage-lp-marrom-avela">Sobre o AsasVet</h2>
            <p className="text-lg text-landingPage-lp-marrom-avela/80">
                O AsasVet nasceu da necessidade de simplificar a gestão de clínicas veterinárias, permitindo que os profissionais foquem no que fazem de melhor: cuidar dos animais. Nossa plataforma intuitiva centraliza agendamentos, prontuários, finanças e muito mais, otimizando o tempo e melhorando a organização do seu negócio.
            </p>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-24 px-8 bg-landingPage-lp-creme-terra text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-landingPage-lp-marrom-avela">Planos Simples e Transparentes</h2>
        <p className="text-lg text-landingPage-lp-marrom-avela/80 mb-16">Escolha o plano que melhor se adapta ao seu crescimento.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {availablePlans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col justify-between p-6 space-y-4 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border-b-4 border-landingPage-lp-verde-folha-seca rounded-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-landingPage-lp-marrom-avela">{plan.name}</h3>
                  <Badge className={cn("text-white", plan.badgeColorClass, "text-base px-3 py-1")}>
                    {plan.badgeText}
                  </Badge>
                </div>
                <p className="text-4xl font-extrabold text-landingPage-lp-verde-folha-seca mb-6">{plan.price}</p>
                <ul className="space-y-2 text-lg text-landingPage-lp-marrom-avela/90 mb-6 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-landingPage-lp-verde-folha-seca" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full bg-landingPage-lp-verde-folha-seca hover:bg-landingPage-lp-verde-folha-seca/90 text-white text-xl px-10 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-105")}>
                Comece Agora
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="py-6 px-8 bg-landingPage-lp-creme-terra/90 text-landingPage-lp-marrom-avela/80 border-t border-landingPage-lp-verde-folha-seca/20 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left space-y-2 sm:space-y-0">
          <p className="text-sm">&copy; {new Date().getFullYear()} AsasVet. Todos os direitos reservados.</p>
          <p className="text-xs">Um desenvolvimento Agronegócios Guitarrari®</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;