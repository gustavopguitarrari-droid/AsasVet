"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

const LandingPageHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background shadow-sm">
      <Link to="/" className="flex items-center text-2xl font-bold text-primary">
        AsasVet <PawPrint className="h-6 w-6 ml-2 text-primary" />
      </Link>
      <nav className="space-x-4">
        <Button asChild variant="ghost">
          <Link to="/login">Entrar</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Cadastrar</Link>
        </Button>
      </nav>
    </header>
  );
};

export default LandingPageHeader;