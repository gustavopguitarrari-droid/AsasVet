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
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (petsError || clientsError) {
    return (
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Erro ao carregar dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
        <PawPrint className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {recentPets.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum animal cadastrado recentemente.</p>
        ) : (
          <ul className="space-y-2">
            {recentPets.map((pet) => {
              const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
              const ownerName = clientMap.get(pet.ownerId) || "Tutor Desconhecido";
              return (
                <li key={pet.id} className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pet.name}</p>
                    <p className="text-xs text-muted-foreground">Tutor: {ownerName}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link to="/cadastro" state={{ activeTab: "animais" }} className="mt-4 block text-right text-sm text-primary hover:underline">
          <span className="flex items-center justify-end">
            Ver Todos <ArrowRight className="ml-1 h-3 w-3" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
};

export default RecentPetsCard;