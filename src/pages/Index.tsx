import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@/context/SessionContext'; // Importar useSession

const Index = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession(); // Usar useSession para verificar o estado de autenticação

  useEffect(() => {
    console.log('Index Page - useEffect triggered. isLoading:', isLoading, 'session:', session);
    if (isLoading) {
      // Ainda carregando a sessão inicial, aguarde.
      // O componente não renderizará nada visualmente neste estado.
      return;
    }

    // A verificação inicial da sessão foi concluída
    if (session) {
      console.log('Index Page - Session found, redirecting to /painel.');
      navigate("/painel", { replace: true }); // Redireciona para o painel se houver sessão
    } else {
      console.log('Index Page - No session, redirecting to /login.');
      navigate("/login", { replace: true }); // Redireciona para o login se não houver sessão
    }
  }, [navigate, session, isLoading]);

  // Renderiza nulo. A navegação é tratada pelo useEffect.
  // Se houver um atraso, a tela ficará em branco por um breve momento.
  return null;
};

export default Index;