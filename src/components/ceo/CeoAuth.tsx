"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { showError } from '@/utils/toast';

interface CeoAuthProps {
  onSuccess: () => void;
}

const CeoAuth: React.FC<CeoAuthProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // A senha é verificada contra uma variável de ambiente
    if (password === import.meta.env.VITE_CEO_DASHBOARD_PASSWORD) {
      onSuccess();
    } else {
      showError("Senha incorreta.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" /> Acesso Restrito
          </CardTitle>
          <CardDescription>
            Por favor, insira a senha para acessar o Painel do CEO.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CeoAuth;