"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, User, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Pet, Client } from "@/types/cadastro";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Equino: MoreHorizontal,
  Bovino: MoreHorizontal,
  Outros: MoreHorizontal,
};

const RecentPetsCard: React.FC = () => {
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const { data: recentPets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['recentPetsDashboard', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) {
        console.error("Erro ao buscar últimos animais cadastrados:", error);
        throw error;
      }
      return data as Pet[];
    },
    enabled: !!userId,
  });

  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['allClientsForRecentPets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, name') // Only need id and name
        .eq('user_id', userId);
      if (error) {
        console.error("Erro ao buscar clientes para últimos animais:", error);
        throw error;
      }
      return data as Client[];
    },
    enabled: !!userId,
  });

  const clientMap = React.useMemo(() => {
    return new Map(clients.map(client => [client.id, client.name]));
  }, [clients]);

  if (isLoadingPets || isLoadingClients) {
    return (
      <Card className={cn("col-span-1 bg-yellow-600 text-white shadow-md")}> {/* Adicionada cor de fundo */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-white" /> {/* Ícone branco */}
        </CardHeader>
        <CardContent>
          <p className="text-white/80">Carregando...</p> {/* Texto branco */}
        </CardContent>
      </Card>
    );
  }

  if (petsError || clientsError) {
    return (
      <Card className={cn("col-span-1 bg-yellow-600 text-white shadow-md")}> {/* Adicionada cor de fundo */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-white" /> {/* Ícone branco */}
        </CardHeader>
        <CardContent>
          <p className="text-white/80">Erro ao carregar dados.</p> {/* Texto branco */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/cadastro" state={{ activeTab: "animais" }} className="block"> {/* O card inteiro é um link */}
      <Card className={cn("col-span-1 bg-yellow-600 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer")}> {/* Adicionada cor de fundo e estilos de hover */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          {recentPets.length === 0 ? (
            <p className="text-white/80 text-sm">Nenhum animal cadastrado recentemente.</p>
          ) : (
            <ul className="space-y-2">
              {recentPets.map((pet) => {
                const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                const ownerName = clientMap.get(pet.ownerId) || "Tutor Desconhecido";
                return (
                  <li key={pet.id} className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-white/80" /> {/* Ícone branco */}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pet.name}</p>
                      <p className="text-xs text-white/80">Tutor: {ownerName}</p> {/* Texto branco */}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {/* Removido o link "Ver Todos" */}
        </CardContent>
      </Card>
    </Link>
  );
};

export default RecentPetsCard;