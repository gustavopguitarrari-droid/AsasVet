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

interface RecentPetsCardProps {
  className?: string; // Adicionado prop className
}

const RecentPetsCard: React.FC<RecentPetsCardProps> = ({ className }) => {
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;

  const { data: recentPets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['recentPetsDashboard', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("RecentPetsCard: Erro ao buscar últimos animais cadastrados:", error);
        throw error;
      }

      // Mapear snake_case para camelCase para corresponder à interface Pet
      return data.map(dbPet => ({
        id: dbPet.id,
        name: dbPet.name,
        species: dbPet.species as Pet["species"],
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender as Pet["gender"],
        color: dbPet.color,
        weight: dbPet.weight || undefined,
        observations: dbPet.observations || undefined,
        photoUrl: dbPet.photo_url || undefined,
        ownerId: dbPet.owner_id, // Mapeamento crucial
        organization_id: dbPet.organization_id,
      }));
    },
    enabled: !!organizationId,
  });

  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Pick<Client, 'id' | 'name'>[]>({
    queryKey: ['allClientsForRecentPets', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('organization_id', organizationId);
      if (error) {
        console.error("RecentPetsCard: Erro ao buscar clients para últimos animais:", error);
        throw error;
      }
      return data as Pick<Client, 'id' | 'name'>[];
    },
    enabled: !!organizationId,
  });

  const clientMap = React.useMemo(() => {
    return new Map(clients.map(client => [client.id, client.name]));
  }, [clients]);

  if (isLoadingPets || isLoadingClients) {
    return (
      <Card className={cn("col-span-1 shadow-md flex flex-col h-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-current" />
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-current/80">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (petsError || clientsError) {
    return (
      <Card className={cn("col-span-1 shadow-md flex flex-col h-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-current" />
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-current/80">Erro ao carregar dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/cadastro" state={{ activeTab: "animais" }} className="block">
      <Card className={cn("col-span-1 shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Últimos Animais Cadastrados</CardTitle>
          <PawPrint className="h-4 w-4 text-current" />
        </CardHeader>
        <CardContent className="flex-1">
          {recentPets.length === 0 ? (
            <p className="text-current/80 text-sm">Nenhum animal cadastrado recentemente.</p>
          ) : (
            <ul className="space-y-2">
              {recentPets.map((pet) => {
                const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                const ownerName = clientMap.get(pet.ownerId) || "Tutor Desconhecido";
                return (
                  <li key={pet.id} className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-current/80" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pet.name}</p>
                      <p className="text-xs text-current/80">Tutor: {ownerName}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default RecentPetsCard;