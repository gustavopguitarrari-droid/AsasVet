"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Pet } from "@/types/cadastro"; // Importar a interface Pet

const COLORS = [
  "#3b82f6", // blue-500
  "#22c55e", // green-500
  "#f59e0b", // yellow-500
  "#a855f7", // purple-500
  "#ef4444", // red-500
  "#14b8a6", // teal-500
  "#ec4899", // pink-500
  "#6b7280", // gray-500
];

const PetsBySpeciesChart: React.FC = () => {
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const { data: pets = [], isLoading, error } = useQuery<Pet[]>({
    queryKey: ['petsBySpeciesChart', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('species'); // Apenas a coluna 'species' é necessária
      if (error) {
        console.error("Erro ao buscar animais por espécie:", error);
        throw error;
      }
      return data as Pet[];
    },
    enabled: !!userId,
  });

  const chartData = React.useMemo(() => {
    const speciesCounts: { [key: string]: number } = {};
    pets.forEach(pet => {
      speciesCounts[pet.species] = (speciesCounts[pet.species] || 0) + 1;
    });

    return Object.entries(speciesCounts).map(([species, count]) => ({
      name: species,
      value: count,
    }));
  }, [pets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Animais por Espécie</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Nenhum animal cadastrado para exibir.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PetsBySpeciesChart;