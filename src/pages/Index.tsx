import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@/context/SessionContext'; // Importar useSession

const Index = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession(); // Usar useSession para verificar o estado de autenticação

  useEffect(() => {
    // Se ainda está carregando a sessão inicial, não faz nada.
    // O redirecionamento ocorrerá assim que isLoading for false.
    if (isLoading) {
      return;
    }

    // A verificação inicial da sessão foi concluída
    if (session) {
      navigate("/painel", { replace: true }); // Redireciona para o painel se houver sessão
    } else {
      navigate("/login", { replace: true }); // Redireciona para o login se não houver sessão
    }
  }, [navigate, session, isLoading]);

  // Renderiza nulo. A navegação é tratada pelo useEffect.
  // Se houver um atraso, a tela ficará em branco por um breve momento.
  return null;
};

export default Index;