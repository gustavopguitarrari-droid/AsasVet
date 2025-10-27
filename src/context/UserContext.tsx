"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format } from 'date-fns';

export interface User { // Adicionado 'export' aqui
  id?: string; // Adicionado ID do usuário
  name?: string; // Tornar opcional
  lastName?: string; // Tornar opcional
  email?: string; // Tornar opcional
  avatarUrl?: string;
  role?: string; // Tornar opcional
  birthday?: string;
  registeredTime: string;
  gender?: string; // Adicionado campo de gênero
  colorTheme?: string; // NOVO: Tema de cor do usuário
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Tipagem ajustada
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