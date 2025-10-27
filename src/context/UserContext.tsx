"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format } from 'date-fns';

export interface User {
  id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  logoUrl?: string; // NOVO: URL do logo da clínica do usuário
  role?: string;
  birthday?: string; // YYYY-MM-DD string
  registeredTime: string; // ISO string
  gender?: string;
  phone?: string;
  crmv?: string;
  cpf?: string;
  companyName?: string;
  addressCep?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  colorTheme?: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Tipo corrigido para aceitar atualizações funcionais
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};