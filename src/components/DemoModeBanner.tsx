"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const DemoModeBanner: React.FC = () => {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check session storage to see if the user previously dismissed the banner
    const dismissed = sessionStorage.getItem('demoModeBannerDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('demoModeBannerDismissed', 'true');
  };

  if (!user || !user.isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 text-white p-3 shadow-lg flex items-center justify-between flex-wrap gap-2",
      "md:flex-row md:justify-center"
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-center md:justify-start">
        <Crown className="h-6 w-6" />
        <p className="text-sm font-medium text-center md:text-left">
          Você está no modo de demonstração (Plano Vet Domiciliar).
          <span className="hidden md:inline ml-1">
            Alguns recursos podem ser limitados.
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to="/settings" state={{ activeTab: "my-plan" }}>
          <Button variant="secondary" size="sm" className="bg-white text-yellow-600 hover:bg-gray-100">
            Atualizar Plano
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </Button>
      </div>
    </div>
  );
};

export default DemoModeBanner;