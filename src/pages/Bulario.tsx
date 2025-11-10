"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpenCheck, Pill, Dog, Cat, AlertTriangle, Factory } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface DrugInfo {
  id: string;
  name: string;
  principle: string;
  manufacturer: string;
  indications: string;
  contraindications: string;
  dosage: {
    dogs: string;
    cats: string;
  };
  presentations: string[];
}

const Bulario = () => {
  const { setPageTitle } = usePageTitle();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DrugInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setPageTitle("Bulário");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showError("Por favor, digite um termo para buscar.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('vetsmart-bulario', {
        body: JSON.stringify({ query: searchTerm }),
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);

      setSearchResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
      showError(`Erro ao buscar no bulário: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <BookOpenCheck className="h-8 w-8 mr-3 text-primary" />
          Bulário Digital (Simulação Vet Smart)
        </h2>
      </div>
      <p className="text-muted-foreground">
        Consulte informações sobre medicamentos veterinários de forma rápida e fácil.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Medicamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Digite o nome do medicamento ou princípio ativo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Buscando informações...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" /> Erro na Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && hasSearched && searchResults.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum medicamento encontrado para "{searchTerm}".</p>
        </div>
      )}

      {!isLoading && !error && searchResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {searchResults.map((drug) => (
            <Card key={drug.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-primary" />
                    {drug.name}
                  </div>
                  <Badge variant="secondary">{drug.principle}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Factory className="h-4 w-4 mr-2" />
                  <span>{drug.manufacturer}</span>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="indications">
                    <AccordionTrigger>Indicações</AccordionTrigger>
                    <AccordionContent>{drug.indications}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="contraindications">
                    <AccordionTrigger>Contraindicações</AccordionTrigger>
                    <AccordionContent>{drug.contraindications}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="dosage">
                    <AccordionTrigger>Posologia</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <Dog className="h-4 w-4 mr-2 mt-1 shrink-0" />
                          <p><span className="font-semibold">Cães:</span> {drug.dosage.dogs}</p>
                        </div>
                        <div className="flex items-start">
                          <Cat className="h-4 w-4 mr-2 mt-1 shrink-0" />
                          <p><span className="font-semibold">Gatos:</span> {drug.dosage.cats}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="presentations">
                    <AccordionTrigger>Apresentações</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {drug.presentations.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bulario;