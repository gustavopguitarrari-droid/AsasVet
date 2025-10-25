"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format } from 'date-fns';

interface User {
  name: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  birthday?: string;
  registeredTime: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Inicializa como null

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