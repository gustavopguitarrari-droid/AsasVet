"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Users as UsersIcon, Home, Calendar, IdCard, Mail, Phone, MapPin, Eye, Edit, Trash2, Scale } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpeciesFilter from "@/components/SpeciesFilter";
import PetDetailsDialog from "@/components/PetDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import PetForm, { PetFormValues } from "@/components/PetForm";
import { Client, Pet } from "@/types/cadastro";
import { format, parseISO, isValid } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { uploadImageToSupabase, deleteImageFromSupabase } from "@/utils/supabaseStorage";
import ClientDetailsDialog from "@/components/ClientDetailsDialog";
import { useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";
import CadastroLegend from "@/components/CadastroLegend"; // Importar o novo componente

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const Cadastro = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<string>("tutores");

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state]);

  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [petSearchTerm, setPetSearchTerm] = useState<string>("");
  const [isPetDetailsDialogOpen, setIsPetDetailsDialogOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState<boolean>(false);
  const [isEditPetDialogOpen, setIsEditPetDialogOpen] = useState<boolean>(false);
  const [petToEdit, setPetToEdit] = useState<Pet | undefined>(undefined);
  const [defaultOwnerIdForPet, setDefaultOwnerIdForPet] = useState<string | undefined>(undefined);
  const [defaultOwnerNameForPet, setDefaultOwnerNameForPet] = useState<string | undefined>(undefined);

  const [clientSearchTerm, setClientSearchTerm] = useState<string>("");
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
  const [isClientDetailsDialogOpen, setIsClientDetailsDialogOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientPetsDialogOpen, setIsClientPetsDialogOpen] = useState<boolean>(false);
  const [clientToViewPets, setClientToViewPets] = useState<Client | null>(null);

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePreviewAlt, setImagePreviewAlt] = useState("");

  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['clients', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;

      return data.map(dbClient => ({
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        cpf: dbClient.cpf,
        dateOfBirth: dbClient.date_of_birth,
        address: {
          cep: dbClient.address_cep || '',
          street: dbClient.address_street || '',
          number: dbClient.address_number || '',
          complement: dbClient.address_complement || undefined,
          neighborhood: dbClient.address_neighborhood || '',
          city: dbClient.address_city || '',
          state: dbClient.address_state || '',
        },
        observations: dbClient.observations || undefined,
        photoUrl: dbClient.photo_url || undefined,
      }));
    },
    enabled: !!userId,
  });

  const { data: pets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['pets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*');
      if (error) throw error;
      return data.map(dbPet => ({
        id: dbPet.id,
        name: dbPet.name,
        species: dbPet.species,
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender,
        color: dbPet.color,
        weight: dbPet.weight || undefined,
        observations: dbPet.observations || undefined,
        photoUrl: dbPet.photo_url || undefined,
        ownerId: dbPet.owner_id,
      }));
    },
    enabled: !!userId,
  });

  const addClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      if (!userId) {
        throw new Error("User not authenticated.");
      }

      const { data: existingCpf, error: cpfCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('cpf', data.cpf)
        .single();

      if (cpfCheckError && cpfCheckError.code !== 'PGRST116') {
        throw new Error("Erro ao verificar CPF existente.");
      }
      if (existingCpf) {
        throw new Error("CPF já cadastrado.");
      }

      let photoUrl: string | null = null;
      let newClientId: string | undefined;

      const { data: insertedClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          cpf: data.cpf,
          date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
          address_cep: data.address.cep,
          address_street: data.address.street,
          address_number: data.address.number,
          address_complement: data.address.complement,
          address_neighborhood: data.address.neighborhood,
          address_city: data.address.city,
          address_state: data.address.state,
          observations: data.observations,
          photo_url: null,
        })
        .select('id')
        .single();

      if (insertError || !insertedClient) {
        throw insertError || new Error("Failed to create client.");
      }
      newClientId = insertedClient.id;

      if (data.photoUrl) {
        photoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'clients', newClientId);
        if (!photoUrl) {
          await supabase.from('clients').delete().eq('id', newClientId);
          throw new Error("Failed to upload client photo.");
        }

        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({ photo_url: photoUrl })
          .eq('id', newClientId)
          .select()
          .single();
        if (updateError) {
          throw updateError;
        }
        return updatedClient;
      } else {
        const { data: finalClient, error: fetchFinalClientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', newClientId)
          .single();
        if (fetchFinalClientError) {
          throw fetchFinalClientError;
        }
        return finalClient;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients', userId] });
      showSuccess("Tutor adicionado com sucesso!");
      setIsAddClientDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao adicionar tutor: ${error.message}`);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues & { id: string }) => {
      if (!userId) throw new Error("User not authenticated.");

      const oldClient = clients.find(c => c.id === data.id);
      let newPhotoUrl: string | null | undefined = data.photoUrl;

      const { data: existingCpf, error: cpfCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('cpf', data.cpf)
        .neq('id', data.id)
        .single();

      if (cpfCheckError && cpfCheckError.code !== 'PGRST116') {
        throw new Error("Erro ao verificar CPF existente.");
      }
      if (existingCpf) {
        throw new Error("CPF já cadastrado para outro tutor.");
      }

      if (data.photoUrl !== oldClient?.photoUrl) {
        if (oldClient?.photoUrl) {
          await deleteImageFromSupabase(oldClient.photoUrl);
        }
        if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
          newPhotoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'clients', data.id);
          if (!newPhotoUrl) throw new Error("Failed to upload new client photo.");
        } else if (!data.photoUrl) {
          newPhotoUrl = null;
        }
      } else {
        newPhotoUrl = oldClient?.photoUrl;
      }

      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          cpf: data.cpf,
          date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
          address_cep: data.address.cep,
          address_street: data.address.street,
          address_number: data.address.number,
          address_complement: data.address.complement,
          address_neighborhood: data.address.neighborhood,
          address_city: data.address.city,
          address_state: data.address.state,
          observations: data.observations,
          photo_url: newPhotoUrl,
        })
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return updatedClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', userId] });
      showSuccess("Tutor atualizado com sucesso!");
      setIsEditClientDialogOpen(false);
      setIsClientDetailsDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao atualizar tutor: ${error.message}`);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (!userId) throw new Error("User not authenticated.");

      const { data: clientToDelete, error: fetchError } = await supabase
        .from('clients')
        .select('photo_url')
        .eq('id', clientId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (clientToDelete?.photo_url) {
        await deleteImageFromSupabase(clientToDelete.photo_url);
      }

      const { data: petsToDelete, error: fetchPetsError } = await supabase
        .from('pets')
        .select('id, photo_url')
        .eq('owner_id', clientId);

      if (fetchPetsError) {
        throw fetchPetsError;
      }

      for (const pet of petsToDelete || []) {
        if (pet.photo_url) {
          await deleteImageFromSupabase(pet.photo_url);
        }
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId);
      if (error) {
        throw error;
      }
      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', userId] });
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Tutor e seus animais excluídos com sucesso!");
      setIsClientDetailsDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao excluir tutor: ${error.message}`);
    },
  });

  const addPetMutation = useMutation({
    mutationFn: async (data: PetFormValues) => {
      if (!userId) throw new Error("User not authenticated.");

      let photoUrl: string | null = null;
      let newPetId: string | undefined;

      const { data: insertedPet, error: insertError } = await supabase
        .from('pets')
        .insert({
          owner_id: data.ownerId,
          name: data.name,
          species: data.species,
          breed: data.breed,
          age: data.age,
          gender: data.gender,
          color: data.color,
          weight: data.weight,
          observations: data.observations,
          photo_url: null,
        })
        .select('id')
        .single();

      if (insertError || !insertedPet) {
        throw insertError || new Error("Failed to create pet.");
      }
      newPetId = insertedPet.id;

      if (data.photoUrl) {
        photoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'pets', newPetId);
        if (!photoUrl) {
          await supabase.from('pets').delete().eq('id', newPetId);
          throw new Error("Failed to upload pet photo.");
        }

        const { data: updatedPet, error: updateError } = await supabase
          .from('pets')
          .update({ photo_url: photoUrl })
          .eq('id', newPetId)
          .select()
          .single();
        if (updateError) {
          throw updateError;
        }
        return updatedPet;
      }
      const { data: finalPet, error: fetchFinalPetError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', newPetId)
        .single();
      if (fetchFinalPetError) {
        throw fetchFinalPetError;
      }
      return finalPet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Animal adicionado com sucesso!");
      setIsAddPetDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao adicionar animal: ${error.message}`);
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async (data: PetFormValues & { id: string }) => {
      if (!userId) throw new Error("User not authenticated.");

      const oldPet = pets.find(p => p.id === data.id);
      let newPhotoUrl: string | null | undefined = data.photoUrl;

      if (data.photoUrl !== oldPet?.photoUrl) {
        if (oldPet?.photoUrl) {
          await deleteImageFromSupabase(oldPet.photoUrl);
        }
        if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
          newPhotoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'pets', data.id);
          if (!newPhotoUrl) throw new Error("Failed to upload new pet photo.");
        } else if (!data.photoUrl) {
          newPhotoUrl = null;
        }
      } else {
        newPhotoUrl = oldPet?.photoUrl;
      }

      const { data: updatedPet, error } = await supabase
        .from('pets')
        .update({
          owner_id: data.ownerId,
          name: data.name,
          species: data.species,
          breed: data.breed,
          age: data.age,
          gender: data.gender,
          color: data.color,
          weight: data.weight,
          observations: data.observations,
          photo_url: newPhotoUrl,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return updatedPet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Animal atualizado com sucesso!");
      setIsEditPetDialogOpen(false);
      setIsPetDetailsDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao atualizar animal: ${error.message}`);
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      if (!userId) throw new Error("User not authenticated.");

      const { data: petToDelete, error: fetchError } = await supabase
        .from('pets')
        .select('photo_url')
        .eq('id', petId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (petToDelete?.photo_url) {
        await deleteImageFromSupabase(petToDelete.photo_url);
      }

      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);
      if (error) {
        throw error;
      }
      return petId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Animal excluído com sucesso!");
      setIsPetDetailsDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao excluir animal: ${error.message}`);
    },
  });

  const handleSelectSpecies = (species: string) => {
    setSelectedSpecies(species);
  };

  const handleAddClient = (data: ClientFormValues) => {
    addClientMutation.mutate(data);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsEditClientDialogOpen(true);
    setIsClientDetailsDialogOpen(false);
  };

  const handleUpdateClient = (data: ClientFormValues) => {
    if (!clientToEdit) {
      console.error("handleUpdateClient: clientToEdit is null, cannot update.");
      return;
    }
    updateClientMutation.mutate({ ...data, id: clientToEdit.id });
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o tutor ${clientName} e todos os seus animais? Esta ação não pode ser desfeita.`)) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleClientRowClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsDialogOpen(true);
  };

  const handleAddPet = (data: PetFormValues) => {
    addPetMutation.mutate(data);
  };

  const handleEditPet = (pet: Pet) => {
    setPetToEdit(pet);
    setIsEditPetDialogOpen(true);
    setIsPetDetailsDialogOpen(false);
  };

  const handleUpdatePet = (data: PetFormValues) => {
    if (!petToEdit) {
      console.error("handleUpdatePet: petToEdit is null, cannot update.");
      return;
    }
    updatePetMutation.mutate({ ...data, id: petToEdit.id });
  };

  const handleDeletePet = (petId: string, petName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o animal ${petName}? Esta ação não pode ser desfeita.`)) {
      deletePetMutation.mutate(petId);
    }
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;
    const owner = clients.find(client => client.id === pet.ownerId);
    const matchesSearch =
      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      (owner?.name.toLowerCase().includes(petSearchTerm.toLowerCase()));
    return matchesSpecies && matchesSearch;
  });

  const handlePetRowClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsPetDetailsDialogOpen(true);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.cpf.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.address.city.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.address.state.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleViewClientPets = (client: Client) => {
    setClientToViewPets(client);
    setIsClientPetsDialogOpen(true);
  };

  const [isNestedAddPetDialogOpen, setIsNestedAddPetDialogOpen] = useState(false);

  const handleAddPetForClient = (client: Client) => {
    setDefaultOwnerIdForPet(client.id);
    setDefaultOwnerNameForPet(client.name);
    setIsNestedAddPetDialogOpen(true);
  };

  const handleNestedAddPetClose = () => {
    setIsNestedAddPetDialogOpen(false);
    setDefaultOwnerIdForPet(undefined);
    setDefaultOwnerNameForPet(undefined);
  };

  const handleNestedAddPetSubmit = (data: PetFormValues) => {
    addPetMutation.mutate(data, {
      onSuccess: () => {
        handleNestedAddPetClose();
      },
      onError: (error) => {
        showError(`Erro ao adicionar animal: ${error.message}`);
      }
    });
  };

  const handleImageClick = (imageUrl: string | null, imageAlt: string) => {
    if (imageUrl) {
      setImagePreviewUrl(imageUrl);
      setImagePreviewAlt(imageAlt);
      setIsImagePreviewOpen(true);
    }
  };

  if (isLoadingClients || isLoadingPets) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando dados de cadastro...</p>
      </div>
    );
  }

  if (clientsError || petsError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: {clientsError?.message || petsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cadastro de Tutores e Animais</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="tutores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
            <UsersIcon className="h-5 w-5 mr-2" /> Tutores
          </TabsTrigger>
          <TabsTrigger value="animais" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
            <Dog className="h-5 w-5 mr-2" /> Animais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutores" className="mt-4">
          <CadastroLegend /> {/* Adicionado o componente de legenda aqui */}
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar tutores..."
                  className="pl-9 w-64"
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="font-bold">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tutor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Tutor</DialogTitle>
                  </DialogHeader>
                  <ClientForm
                    key={isAddClientDialogOpen ? "open" : "closed"}
                    onSubmit={handleAddClient}
                    onCancel={() => setIsAddClientDialogOpen(false)}
                    isSubmittingParent={addClientMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Animais</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    const petsOfClient = pets.filter(pet => pet.ownerId === client.id);
                    const firstNameInitial = client.name ? client.name.charAt(0) : '';
                    const lastNameInitial = client.name.split(' ').pop()?.charAt(0) || '';
                    const initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();

                    return (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="w-[60px] relative group">
                          <Avatar 
                            className="h-9 w-9 group-hover:scale-150 group-hover:z-10 transition-transform duration-200 ease-in-out cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handleImageClick(client.photoUrl || null, client.name); }}
                          >
                            {client.photoUrl ? (
                              <AvatarImage src={client.photoUrl} alt={client.name} />
                            ) : (
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium" onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          {client.name}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          {client.cpf}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          {client.dateOfBirth && isValid(parseISO(client.dateOfBirth))
                            ? format(parseISO(client.dateOfBirth), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          <div className="flex items-center text-sm mb-1">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1"
                              >
                                <MapPin className="h-4 w-4" />
                                <span className="sr-only">Ver Endereço</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="font-semibold mb-1">Endereço de {client.name}</p>
                              <p className="text-sm">{client.address.street}, {client.address.number} {client.address.complement}</p>
                              <p className="text-sm">{client.address.neighborhood}, {client.address.city} - {client.address.state}</p>
                              <p className="text-xs text-muted-foreground">CEP: {client.address.cep}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          {petsOfClient.length > 0 ? (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewClientPets(client); }}>
                              {petsOfClient.length} Animal{petsOfClient.length > 1 ? 's' : ''}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nenhum</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAddPetForClient(client); }}>
                              Adicionar Animal
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id, client.name); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum tutor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="animais" className="mt-4">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <SpeciesFilter selectedSpecies={selectedSpecies} onSelectSpecies={handleSelectSpecies} />
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar animais por nome, raça ou tutor..."
                className="pl-9"
                value={petSearchTerm}
                onChange={(e) => setPetSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddPetDialogOpen} onOpenChange={setIsAddPetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-bold" disabled={clients.length === 0}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {defaultOwnerNameForPet ? `Adicionar Animal para ${defaultOwnerNameForPet}` : "Adicionar Novo Animal"}
                  </DialogTitle>
                </DialogHeader>
                <PetForm
                  key={isAddPetDialogOpen ? "open" : "closed"}
                  onSubmit={handleAddPet}
                  onCancel={() => setIsAddPetDialogOpen(false)}
                  allClients={clients}
                  defaultOwnerId={defaultOwnerIdForPet}
                  defaultOwnerName={defaultOwnerNameForPet}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Peso (KG)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet) => {
                    const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                    const owner = clients.find(client => client.id === pet.ownerId);
                    const initials = pet.name.charAt(0).toUpperCase();
                    return (
                      <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="w-[60px] relative group">
                          <Avatar 
                            className="h-9 w-9 group-hover:scale-150 group-hover:z-10 transition-transform duration-200 ease-in-out cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handleImageClick(pet.photoUrl || null, pet.name); }}
                          >
                            {pet.photoUrl ? (
                              <AvatarImage src={pet.photoUrl} alt={pet.name} />
                            ) : (
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                {initials || <Dog className="h-5 w-5" />}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-bold flex items-center" onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {pet.name}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {pet.species}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {pet.breed}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {owner ? owner.name : "N/A"}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {pet.age}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {pet.gender}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {pet.color}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          {pet.weight !== undefined && pet.weight !== null ? `${pet.weight.toFixed(1)} KG` : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditPet(pet); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeletePet(pet.id, pet.name); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      Nenhum animal encontrado para a espécie selecionada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PetDetailsDialog
            pet={selectedPet ? { ...selectedPet, owner: clients.find(c => c.id === selectedPet.ownerId)?.name || "N/A" } : null}
            isOpen={isPetDetailsDialogOpen}
            onClose={() => setIsPetDetailsDialogOpen(false)}
            onEdit={handleEditPet}
            onDelete={handleDeletePet}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isClientPetsDialogOpen} onOpenChange={setIsClientPetsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Animais de {clientToViewPets?.name}</DialogTitle>
            <DialogDescription>
              Lista de todos os animais vinculados a {clientToViewPets?.name}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20 mb-4">
            {clientToViewPets ? (
              (() => {
                const petsOfClient = pets.filter(pet => pet.ownerId === clientToViewPets.id);
                return petsOfClient.length > 0 ? (
                  <div className="space-y-3">
                    {petsOfClient.map(pet => {
                      const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                      const initials = pet.name.charAt(0).toUpperCase();
                      return (
                        <div key={pet.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                          <div className="flex items-center">
                            <Avatar 
                              className="h-9 w-9 mr-3 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); handleImageClick(pet.photoUrl || null, pet.name); }}
                            >
                              {pet.photoUrl ? (
                                <AvatarImage src={pet.photoUrl} alt={pet.name} />
                              ) : (
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                  {initials || <Dog className="h-5 w-5" />}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{pet.name} ({pet.species})</p>
                              <p className="text-sm text-muted-foreground">Raça: {pet.breed} | Idade: {pet.age} | Peso: {pet.weight !== undefined && pet.weight !== null ? `${pet.weight.toFixed(1)} KG` : "N/A"}</p>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPet(pet)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePet(pet.id, pet.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Nenhum animal cadastrado para este tutor.</p>
                );
              })()
            ) : (
              <p className="text-center text-muted-foreground">Selecione um tutor para ver seus animais.</p>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientPetsDialogOpen(false)}>Fechar</Button>
            <Button onClick={() => handleAddPetForClient(clientToViewPets!)} disabled={!clientToViewPets}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Animal para {clientToViewPets?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ClientDetailsDialog
        client={selectedClient}
        isOpen={isClientDetailsDialogOpen}
        onClose={() => setIsClientDetailsDialogOpen(false)}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onViewPets={handleViewClientPets}
      />

      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tutor</DialogTitle>
          </DialogHeader>
          {clientToEdit && (
            <ClientForm
              key={clientToEdit.id}
              onSubmit={handleUpdateClient}
              onCancel={() => setIsEditClientDialogOpen(false)}
              initialData={clientToEdit}
              isSubmittingParent={updateClientMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPetDialogOpen} onOpenChange={setIsEditPetDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Animal</DialogTitle>
          </DialogHeader>
          {petToEdit && (
            <PetForm
              key={petToEdit.id}
              onSubmit={handleUpdatePet}
              onCancel={() => setIsEditPetDialogOpen(false)}
              initialData={petToEdit}
              allClients={clients}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isNestedAddPetDialogOpen} onOpenChange={handleNestedAddPetClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {defaultOwnerNameForPet ? `Adicionar Animal para ${defaultOwnerNameForPet}` : "Adicionar Novo Animal"}
            </DialogTitle>
          </DialogHeader>
          <PetForm
            key={isNestedAddPetDialogOpen ? "open" : "closed"}
            onSubmit={handleNestedAddPetSubmit}
            onCancel={handleNestedAddPetClose}
            allClients={clients}
            defaultOwnerId={defaultOwnerIdForPet}
            defaultOwnerName={defaultOwnerNameForPet}
          />
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        isOpen={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        imageUrl={imagePreviewUrl}
        imageAlt={imagePreviewAlt}
      />
    </div>
  );
};

export default Cadastro;