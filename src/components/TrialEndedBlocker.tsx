"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrialEndedBlocker: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToPlans = () => {
    navigate('/settings', { state: { activeTab: 'my-plan' } });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-yellow-100/80 backdrop-blur-sm">
      <Card className="w-full max-w-md text-center shadow-2xl border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-yellow-800">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Seu período de teste terminou!
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Para continuar utilizando todos os recursos do AsasVet, por favor, escolha um de nossos planos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleNavigateToPlans}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Crown className="mr-2 h-4 w-4" /> Ver Planos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialEndedBlocker;