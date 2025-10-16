import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/clients":
        return "Clientes";
      case "/pets":
        return "Animais";
      case "/appointments":
        return "Consultas";
      case "/medical-records":
        return "Prontuários Médicos";
      case "/login":
        return "Login";
      case "/register":
        return "Registrar";
      default:
        return "Simples Vet";
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-background p-4 shadow-sm">
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      {/* Aqui você pode adicionar elementos como perfil do usuário, notificações, etc. */}
    </header>
  );
};

export default Header;