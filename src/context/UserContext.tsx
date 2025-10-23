"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format } from 'date-fns'; // Importar format para a data de registro

interface User {
  name: string;
  lastName: string; // Novo campo
  email: string;
  // gender: 'masculino' | 'feminino'; // Removido
  avatarUrl?: string;
  role: string; // Novo campo
  birthday?: string; // Novo campo (formato YYYY-MM-DD)
  registeredTime: string; // Novo campo (formato YYYY-MM-DD HH:mm)
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { ReactNode }) => {
  // Dados de usuário mock para demonstração inicial
  const [user, setUser] = useState<User | null>({
    name: "João",
    lastName: "Silva", // Adicionado
    email: "joao.silva@example.com",
    // gender: "masculino", // Removido
    avatarUrl: undefined, // Alterado para undefined
    role: "Veterinário", // Adicionado
    birthday: "1990-05-15", // Adicionado
    registeredTime: format(new Date(), "yyyy-MM-dd HH:mm"), // Adicionado
  });

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