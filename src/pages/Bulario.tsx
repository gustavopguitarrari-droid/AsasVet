"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpenCheck, AlertTriangle, ArrowUpDown, PlusCircle, Edit, Trash2, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MedicationFormDialog, { MedicationFormValues } from "@/components/bulario/MedicationFormDialog";
import { uploadMedicationPhotoToSupabase, deleteMedicationPhotoFromSupabase } from "@/utils/supabaseStorage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { createProxyUrl } from "@/utils/imageProxy";

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
  photo_url?: string | null;
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: keyof DrugInfo;
  direction: SortDirection;
}

const Bulario = () => {
  const { setPageTitle } = usePageTitle();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<'name' | 'active_principle' | 'manufacturer'>('name');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [drugToEdit, setDrugToEdit] = useState<DrugInfo | null>(null);
  const [drugToDelete, setDrugToDelete] = useState<DrugInfo | null>(null);

  useEffect(() => {
    setPageTitle("Bulario");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: allMedications = [], isLoading, error } = useQuery<DrugInfo[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from('medications')
        .select('*')
        .order('name', { ascending: true });

      if (dbError) {
        showError(`Erro ao carregar bulário: ${dbError.message}`);
        throw dbError;
      }
      return data || [];
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (formData: MedicationFormValues) => {
      let photoUrl: string | null = null;
      const { data: insertedDrug, error: insertError } = await supabase
        .from('medications')
        .insert({
          name: formData.name,
          active_principle: formData.active_principle,
          manufacturer: formData.manufacturer,
          indications: formData.indications,
          contraindications: formData.contraindications,
          dosage: formData.dosage,
          presentations: formData.presentations.split(',').map(p => p.trim()),
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      if (formData.photo_url && formData.photo_url.startsWith('data:image')) {
        photoUrl = await uploadMedicationPhotoToSupabase(formData.photo_url, insertedDrug.id);
        if (!photoUrl) throw new Error("Falha no upload da foto.");

        const { error: updateError } = await supabase
          .from('medications')
          .update({ photo_url: photoUrl })
          .eq('id', insertedDrug.id);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      showSuccess("Medicamento adicionado com sucesso!");
      setIsAddDialogOpen(false);
    },
    onError: (err: any) => showError(`Erro: ${err.message}`),
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async (data: MedicationFormValues & { id: string }) => {
      let newPhotoUrl = data.photo_url;
      if (data.photo_url && data.photo_url.startsWith('data:image')) {
        if (drugToEdit?.photo_url) {
          await deleteMedicationPhotoFromSupabase(drugToEdit.photo_url);
        }
        newPhotoUrl = await uploadMedicationPhotoToSupabase(data.photo_url, data.id);
      } else if (!data.photo_url && drugToEdit?.photo_url) {
        await deleteMedicationPhotoFromSupabase(drugToEdit.photo_url);
        newPhotoUrl = null;
      }

      const { error } = await supabase
        .from('medications')
        .update({
          name: data.name,
          active_principle: data.active_principle,
          manufacturer: data.manufacturer,
          indications: data.indications,
          contraindications: data.contraindications,
          dosage: data.dosage,
          presentations: data.presentations.split(',').map(p => p.trim()),
          photo_url: newPhotoUrl,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      showSuccess("Medicamento atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setDrugToEdit(null);
    },
    onError: (err: any) => showError(`Erro: ${err.message}`),
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (drug: DrugInfo) => {
      if (drug.photo_url) {
        await deleteMedicationPhotoFromSupabase(drug.photo_url);
      }
      const { error } = await supabase.from('medications').delete().eq('id', drug.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      showSuccess("Medicamento excluído com sucesso!");
    },
    onError: (err: any) => showError(`Erro: ${err.message}`),
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBy]);

  const filteredAndSortedResults = useMemo(() => {
    let filteredItems = [...allMedications];
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
      filteredItems = filteredItems.filter(drug => {
        const valueToFilter = drug[filterBy]?.toString().toLowerCase() || '';
        return valueToFilter.includes(lowerCaseSearchTerm);
      });
    }
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filteredItems;
  }, [allMedications, searchTerm, filterBy, sortConfig]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / itemsPerPage);

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

  const handleEditClick = (e: React.MouseEvent, drug: DrugInfo) => {
    e.stopPropagation();
    setDrugToEdit(drug);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, drug: DrugInfo) => {
    e.stopPropagation();
    setDrugToDelete(drug);
  };

  const handleConfirmDelete = () => {
    if (drugToDelete) {
      deleteMedicationMutation.mutate(drugToDelete);
      setDrugToDelete(null);
    }
  };

  const handleSubmit = (data: MedicationFormValues) => {
    if (drugToEdit) {
      updateMedicationMutation.mutate({ ...data, id: drugToEdit.id });
    } else {
      addMedicationMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <BookOpenCheck className="h-8 w-8 mr-3 text-primary" />
          Bulario
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Medicamento
        </Button>
      </div>

      <div className="flex flex-col md:flex-row w-full items-center space-y-2 md:space-y-0 md:space-x-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      {error && (
        <div className="flex items-center justify-center p-4 border border-destructive bg-destructive/10 rounded-md">
          <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
          <p className="text-destructive">{error.message}</p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')}>
                  Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('manufacturer')}>
                  Fabricante <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">Carregando bulário...</TableCell></TableRow>
            ) : paginatedResults.length > 0 ? (
              paginatedResults.map((drug) => (
                <TableRow key={drug.id} onClick={() => handleRowClick(drug)} className="cursor-pointer">
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={createProxyUrl(drug.photo_url)} alt={drug.name} crossOrigin="anonymous" />
                      <AvatarFallback><Pill /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{drug.name}</TableCell>
                  <TableCell>{drug.manufacturer || <span className="text-muted-foreground">N/A</span>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => handleEditClick(e, drug)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => handleDeleteClick(e, drug)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">{searchTerm ? `Nenhum resultado para "${searchTerm}".` : "Nenhum medicamento cadastrado."}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} /></PaginationItem>
            {[...Array(totalPages).keys()].map(pageNumber => (
              <PaginationItem key={pageNumber}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber + 1); }} isActive={currentPage === pageNumber + 1}>{pageNumber + 1}</PaginationLink></PaginationItem>
            ))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <DrugDetailsDialog drug={selectedDrug} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
      <MedicationFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={addMedicationMutation.isPending}
      />
      {drugToEdit && (
        <MedicationFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleSubmit}
          isSubmitting={updateMedicationMutation.isPending}
          initialData={{...drugToEdit, presentations: Array.isArray(drugToEdit.presentations) ? drugToEdit.presentations : []}}
        />
      )}
      <AlertDialog open={!!drugToDelete} onOpenChange={() => setDrugToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o medicamento "{drugToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bulario;