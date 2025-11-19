"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpenCheck, AlertTriangle, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DrugDetailsDialog from "@/components/DrugDetailsDialog";

interface DrugInfo {
  id: string;
  name: string;
  active_principle: string;
  manufacturer: string;
  indications: string;
  contraindications: string;
  dosage: {
    dogs: string;
    cats: string;
  };
  presentations: string[];
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: keyof DrugInfo;
  direction: SortDirection;
}

const Bulario = () => {
  const { setPageTitle } = usePageTitle();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DrugInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<'name' | 'active_principle' | 'manufacturer'>('name');

  useEffect(() => {
    setPageTitle("Bulario");
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
    setCurrentPage(1); // Reset page on new search
    try {
      const { data, error: dbError } = await supabase
        .from('medications')
        .select('*')
        .ilike(filterBy, `%${searchTerm.trim()}%`);

      if (dbError) throw dbError;

      setSearchResults(data || []);
    } catch (err: any) {
      setError(err.message);
      showError(`Erro ao buscar no bulário: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    let sortableItems = [...searchResults];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [searchResults, sortConfig]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedResults.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);

  const handleSort = (key: keyof DrugInfo) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (drug: DrugInfo) => {
    setSelectedDrug(drug);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <BookOpenCheck className="h-8 w-8 mr-3 text-primary" />
          Bulario
        </h2>
      </div>

      <div className="flex flex-col md:flex-row w-full items-center space-y-2 md:space-y-0 md:space-x-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground">Filtrar por:</span>
          <Select value={filterBy} onValueChange={(value) => setFilterBy(value as any)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="active_principle">Princípio Ativo</SelectItem>
              <SelectItem value="manufacturer">Fabricante</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-center p-4 border border-destructive bg-destructive/10 rounded-md">
          <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')}>
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('manufacturer')}>
                  Fabricante
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Buscando...
                </TableCell>
              </TableRow>
            ) : paginatedResults.length > 0 ? (
              paginatedResults.map((drug) => (
                <TableRow key={drug.id} onClick={() => handleRowClick(drug)} className="cursor-pointer">
                  <TableCell className="font-medium">{drug.name}</TableCell>
                  <TableCell>{drug.manufacturer || <span className="text-muted-foreground">N/A</span>}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {hasSearched ? `Nenhum resultado para "${searchTerm}".` : "Digite um termo e clique em buscar para ver os resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {[...Array(totalPages).keys()].map(pageNumber => (
              <PaginationItem key={pageNumber}>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber + 1); }} isActive={currentPage === pageNumber + 1}>
                  {pageNumber + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <DrugDetailsDialog
        drug={selectedDrug}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default Bulario;