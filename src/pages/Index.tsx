import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '@/context/SessionContext'; // Importar useSession

const Index = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession(); // Usar useSession para verificar o estado de autenticação

  useEffect(() => {
    console.log('Index Page - isLoading:', isLoading, 'session:', session);
    if (!isLoading) {
      if (session) {
        console.log('Index Page - Session found, redirecting to /painel.');
        navigate("/painel");
      } else {
        console.log('Index Page - No session, redirecting to /login.');
        navigate("/login"); // Redireciona para o login se não houver sessão
      }
    }
  }, [navigate, session, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Carregando Simples Vet...</h1>
        <p className="text-xl text-gray-600">
          Você será redirecionado em breve.
        </p>
      </div>
    </div>
  );
};

export default Index;