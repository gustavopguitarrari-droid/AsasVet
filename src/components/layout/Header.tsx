import React from "react";
import { useLocation } from "react-router-dom";
import UserProfile from "@/components/UserProfile";

const Header = () => {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Painel";
      case "/clients":
        return "Clientes";
      case "/pets":
        return "Animais";
      case "/appointments":
        return "Consultas";
      case "/medical-records":
        return "Agendamentos Médicos"; // Título atualizado
      case "/financeiro":
        return "Financeiro";
      case "/caixa":
        return "Caixa";
      case "/internacao":
        return "Internação";
      case "/veterinarios":
        return "Veterinários";
      default:
        return "Simples Vet";
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-background p-4 shadow-sm">
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      <UserProfile />
    </header>
  );
};

export default Header;