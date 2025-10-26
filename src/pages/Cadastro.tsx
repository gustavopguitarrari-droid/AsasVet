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
import { PlusCircle, Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Users as UsersIcon, Home, Calendar, IdCard, Mail, Phone, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpeciesFilter from "@/components/SpeciesFilter";
import PetDetailsDialog from "@/components/PetDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import PetForm, { PetFormValues } from "@/components/PetForm"; // Importar PetForm
import { Client, Pet } from "@/types/cadastro";
import { format, parseISO, isValid } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar ScrollArea
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { uploadImageToSupabase, deleteImageFromSupabase } from "@/utils/supabaseStorage";
import ClientDetailsDialog from "@/components/ClientDetailsDialog"; // Importar o novo ClientDetailsDialog

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

  const [activeTab, setActiveTab] = useState<string>("tutores");

  // Estados para a aba de Animais
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [petSearchTerm, setPetSearchTerm] = useState<string>("");
  const [isPetDetailsDialogOpen, setIsPetDetailsDialogOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState<boolean>(false); // Mantido para adicionar pet de forma geral
  const [isEditPetDialogOpen, setIsEditPetDialogOpen] = useState<boolean>(false);
  const [petToEdit, setPetToEdit] = useState<Pet | undefined>(undefined);
  const [defaultOwnerIdForPet, setDefaultOwnerIdForPet] = useState<string | undefined>(undefined);
  const [defaultOwnerNameForPet, setDefaultOwnerNameForPet] = useState<string | undefined>(undefined); // NOVO: Nome do tutor padrão

  // Estados para a aba de Tutores
  const [clientSearchTerm, setClientSearchTerm] = useState<string>("");
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
  const [isClientDetailsDialogOpen, setIsClientDetailsDialogOpen] = useState<boolean>(false); // Novo estado para detalhes do cliente
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); // Novo estado para cliente selecionado
  const [isClientPetsDialogOpen, setIsClientPetsDialogOpen] = useState<boolean>(false);
  const [clientToViewPets, setClientToViewPets] = useState<Client | null>(null);

  // --- Queries ---
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['clients', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;

      // Transform flat Supabase data into nested Client interface
      return data.map(dbClient => ({
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        cpf: dbClient.cpf,
        dateOfBirth: dbClient.date_of_birth, // Supabase returns 'date_of_birth'
        address: {
          cep: dbClient.address_cep || '', // Provide default empty string for nullable fields
          street: dbClient.address_street || '',
          number: dbClient.address_number || '',
          complement: dbClient.address_complement || undefined, // Optional
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
      // RLS on 'pets' table ensures only pets belonging to the user's clients are returned
      const { data, error } = await supabase
        .from('pets')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // --- Mutations ---
  const addClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      if (!userId) {
        console.error("addClientMutation: User not authenticated, userId is null.");
        throw new Error("User not authenticated.");
      }
      console.log("addClientMutation: Attempting to add new client with data:", data);

      // 1. Check for duplicate CPF
      const { data: existingCpf, error: cpfCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('cpf', data.cpf)
        .single();

      if (cpfCheckError && cpfCheckError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error("addClientMutation: Error checking for duplicate CPF:", cpfCheckError);
        throw new Error("Erro ao verificar CPF existente.");
      }
      if (existingCpf) {
        console.log("addClientMutation: Duplicate CPF found:", data.cpf);
        throw new Error("CPF já cadastrado.");
      }
      console.log("addClientMutation: CPF is unique, proceeding with client creation.");


      let photoUrl: string | null = null;
      let newClientId: string | undefined;

      // First, insert client without photo_url to get an ID
      console.log("addClientMutation: Inserting client without photo_url to get an ID.");
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
          photo_url: null, // Set to null initially
        })
        .select('id')
        .single();

      if (insertError || !insertedClient) {
        console.error("addClientMutation: Error inserting client to get ID:", insertError);
        throw insertError || new Error("Failed to create client.");
      }
      newClientId = insertedClient.id;
      console.log("addClientMutation: Client inserted with temporary ID:", newClientId);

      if (data.photoUrl) {
        console.log("addClientMutation: Photo URL provided, attempting upload.");
        photoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'clients', newClientId);
        if (!photoUrl) {
          console.error("addClientMutation: Failed to upload client photo. Deleting temporary client.");
          // If photo upload fails, delete the temporary client and throw error
          await supabase.from('clients').delete().eq('id', newClientId);
          throw new Error("Failed to upload client photo.");
        }
        console.log("addClientMutation: Photo uploaded, public URL:", photoUrl);

        // Update the client with the photo URL
        console.log("addClientMutation: Updating client with photo_url.");
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({ photo_url: photoUrl })
          .eq('id', newClientId)
          .select()
          .single();
        if (updateError) {
          console.error("addClientMutation: Error updating client with photo_url:", updateError);
          throw updateError;
        }
        console.log("addClientMutation: Client updated with photo_url:", updatedClient);
        return updatedClient;

      } else {
        console.log("addClientMutation: No photo URL provided, returning inserted client.");
        // No photo, just return the inserted client
        // The client was already inserted to get an ID, so we just need to return it.
        // No need to re-insert.
        const { data: finalClient, error: fetchFinalClientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', newClientId)
          .single();
        if (fetchFinalClientError) {
          console.error("addClientMutation: Error fetching final client after no photo upload:", fetchFinalClientError);
          throw fetchFinalClientError;
        }
        return finalClient;
      }
    },
    onSuccess: (data) => {
      console.log("addClientMutation: Client added successfully, invalidating queries. Data:", data);
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
      let newPhotoUrl: string | null | undefined = data.photoUrl; // Can be Base64, public URL, or undefined (removed)

      // 1. Check for duplicate CPF, excluding the current client being updated
      const { data: existingCpf, error: cpfCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('cpf', data.cpf)
        .neq('id', data.id) // Exclude the current client from the check
        .single();

      if (cpfCheckError && cpfCheckError.code !== 'PGRST116') {
        console.error("updateClientMutation: Error checking for duplicate CPF:", cpfCheckError);
        throw new Error("Erro ao verificar CPF existente.");
      }
      if (existingCpf) {
        console.log("updateClientMutation: Duplicate CPF found for another client:", data.cpf);
        throw new Error("CPF já cadastrado para outro tutor.");
      }
      console.log("updateClientMutation: CPF is unique or belongs to current client, proceeding with update.");


      // If photo changed (new Base64 or removed)
      if (data.photoUrl !== oldClient?.photoUrl) {
        // Delete old image if it existed
        if (oldClient?.photoUrl) {
          console.log("updateClientMutation: Deleting old client photo:", oldClient.photoUrl);
          await deleteImageFromSupabase(oldClient.photoUrl);
        }
        // Upload new image if it's a Base64 string
        if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
          console.log("updateClientMutation: Uploading new client photo.");
          newPhotoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'clients', data.id);
          if (!newPhotoUrl) throw new Error("Failed to upload new client photo.");
          console.log("updateClientMutation: New photo uploaded, public URL:", newPhotoUrl);
        } else if (!data.photoUrl) {
          console.log("updateClientMutation: Client photo explicitly removed.");
          newPhotoUrl = null; // Photo was explicitly removed
        }
      } else {
        newPhotoUrl = oldClient?.photoUrl; // Photo didn't change, keep existing URL
        console.log("updateClientMutation: Client photo did not change, keeping existing URL:", newPhotoUrl);
      }

      console.log("updateClientMutation: Updating client in DB with data:", data);
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
        console.error("updateClientMutation: Error updating client in DB:", error);
        throw error;
      }
      console.log("updateClientMutation: Client updated successfully in DB:", updatedClient);
      return updatedClient;
    },
    onSuccess: () => {
      console.log("updateClientMutation: Client updated successfully, invalidating queries.");
      queryClient.invalidateQueries({ queryKey: ['clients', userId] });
      showSuccess("Tutor atualizado com sucesso!");
      setIsEditClientDialogOpen(false);
      setIsClientDetailsDialogOpen(false); // Close details dialog if open
    },
    onError: (error) => {
      console.error("updateClientMutation: Error updating client:", error);
      showError(`Erro ao atualizar tutor: ${error.message}`);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("deleteClientMutation: Attempting to delete client with ID:", clientId);

      // First, get the client to delete their photo
      console.log("deleteClientMutation: Fetching client to delete photo.");
      const { data: clientToDelete, error: fetchError } = await supabase
        .from('clients')
        .select('photo_url')
        .eq('id', clientId)
        .single();

      if (fetchError) {
        console.error("deleteClientMutation: Error fetching client for photo deletion:", fetchError);
        throw fetchError;
      }

      // Delete client's photo from storage if it exists
      if (clientToDelete?.photo_url) {
        console.log("deleteClientMutation: Deleting client photo from storage:", clientToDelete.photo_url);
        await deleteImageFromSupabase(clientToDelete.photo_url);
      }

      // Get all pets associated with this client to delete their photos
      console.log("deleteClientMutation: Fetching pets associated with client for photo deletion.");
      const { data: petsToDelete, error: fetchPetsError } = await supabase
        .from('pets')
        .select('id, photo_url')
        .eq('owner_id', clientId);

      if (fetchPetsError) {
        console.error("deleteClientMutation: Error fetching pets for photo deletion:", fetchPetsError);
        throw fetchPetsError;
      }

      // Delete each pet's photo
      for (const pet of petsToDelete || []) {
        if (pet.photo_url) {
          console.log("deleteClientMutation: Deleting pet photo from storage:", pet.photo_url);
          await deleteImageFromSupabase(pet.photo_url);
        }
      }

      // Deleting the client will cascade delete associated pets due to foreign key ON DELETE CASCADE
      console.log("deleteClientMutation: Deleting client from DB.");
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId);
      if (error) {
        console.error("deleteClientMutation: Error deleting client from DB:", error);
        throw error;
      }
      console.log("deleteClientMutation: Client deleted successfully from DB.");
      return clientId;
    },
    onSuccess: () => {
      console.log("deleteClientMutation: Client deleted successfully, invalidating queries.");
      queryClient.invalidateQueries({ queryKey: ['clients', userId] });
      queryClient.invalidateQueries({ queryKey: ['pets', userId] }); // Pets also affected
      showSuccess("Tutor e seus animais excluídos com sucesso!");
      setIsClientDetailsDialogOpen(false); // Close details dialog
    },
    onError: (error) => {
      console.error("deleteClientMutation: Error deleting client:", error);
      showError(`Erro ao excluir tutor: ${error.message}`);
    },
  });

  const addPetMutation = useMutation({
    mutationFn: async (data: PetFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("addPetMutation: Attempting to add new pet with data:", data);

      let photoUrl: string | null = null;
      let newPetId: string | undefined;

      // First, insert pet without photo_url to get an ID
      console.log("addPetMutation: Inserting pet without photo_url to get an ID.");
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
          observations: data.observations,
          photo_url: null,
        })
        .select('id')
        .single();

      if (insertError || !insertedPet) {
        console.error("addPetMutation: Error inserting pet to get ID:", insertError);
        throw insertError || new Error("Failed to create pet.");
      }
      newPetId = insertedPet.id;
      console.log("addPetMutation: Pet inserted with temporary ID:", newPetId);

      if (data.photoUrl) {
        console.log("addPetMutation: Photo URL provided, attempting upload.");
        photoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'pets', newPetId);
        if (!photoUrl) {
          console.error("addPetMutation: Failed to upload pet photo. Deleting temporary pet.");
          // If photo upload fails, delete the newly created pet and throw error
          await supabase.from('pets').delete().eq('id', newPetId);
          throw new Error("Failed to upload pet photo.");
        }
        console.log("addPetMutation: Photo uploaded, public URL:", photoUrl);

        // Update the pet with the photo URL
        console.log("addPetMutation: Updating pet with photo_url.");
        const { data: updatedPet, error: updateError } = await supabase
          .from('pets')
          .update({ photo_url: photoUrl })
          .eq('id', newPetId)
          .select()
          .single();
        if (updateError) {
          console.error("addPetMutation: Error updating pet with photo_url:", updateError);
          throw updateError;
        }
        console.log("addPetMutation: Pet updated with photo_url:", updatedPet);
        return updatedPet;
      }
      console.log("addPetMutation: No photo URL provided, returning inserted pet.");
      // No photo, just return the inserted pet
      const { data: finalPet, error: fetchFinalPetError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', newPetId)
        .single();
      if (fetchFinalPetError) {
        console.error("addPetMutation: Error fetching final pet after no photo upload:", fetchFinalPetError);
        throw fetchFinalPetError;
      }
      return finalPet;
    },
    onSuccess: () => {
      console.log("addPetMutation: Pet added successfully, invalidating queries.");
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Animal adicionado com sucesso!");
      setIsAddPetDialogOpen(false);
      // setIsClientPetsDialogOpen(false); // No longer closes parent dialog
    },
    onError: (error) => {
      console.error("addPetMutation: Error adding animal:", error);
      showError(`Erro ao adicionar animal: ${error.message}`);
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async (data: PetFormValues & { id: string }) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("updatePetMutation: Attempting to update pet with data:", data);

      const oldPet = pets.find(p => p.id === data.id);
      let newPhotoUrl: string | null | undefined = data.photoUrl;

      if (data.photoUrl !== oldPet?.photoUrl) {
        if (oldPet?.photoUrl) {
          console.log("updatePetMutation: Deleting old pet photo:", oldPet.photoUrl);
          await deleteImageFromSupabase(oldPet.photoUrl);
        }
        if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
          console.log("updatePetMutation: Uploading new pet photo.");
          newPhotoUrl = await uploadImageToSupabase(data.photoUrl, userId, 'pets', data.id);
          if (!newPhotoUrl) throw new Error("Failed to upload new pet photo.");
          console.log("updatePetMutation: New photo uploaded, public URL:", newPhotoUrl);
        } else if (!data.photoUrl) {
          console.log("updatePetMutation: Pet photo explicitly removed.");
          newPhotoUrl = null;
        }
      } else {
        newPhotoUrl = oldPet?.photoUrl;
        console.log("updatePetMutation: Pet photo did not change, keeping existing URL:", newPhotoUrl);
      }

      console.log("updatePetMutation: Updating pet in DB with data:", data);
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
          observations: data.observations,
          photo_url: newPhotoUrl,
        })
        .eq('id', data.id)
        .select()
        .single();
      if (error) {
        console.error("updatePetMutation: Error updating pet in DB:", error);
        throw error;
      }
      console.log("updatePetMutation: Pet updated successfully in DB:", updatedPet);
      return updatedPet;
    },
    onSuccess: () => {
      console.log("updatePetMutation: Pet updated successfully, invalidating queries.");
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Animal atualizado com sucesso!");
      setIsEditPetDialogOpen(false);
      setIsPetDetailsDialogOpen(false); // Close details dialog if open
    },
    onError: (error) => {
      console.error("updatePetMutation: Error updating animal:", error);
      showError(`Erro ao atualizar animal: ${error.message}`);
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("deletePetMutation: Attempting to delete pet with ID:", petId);

      const { data: petToDelete, error: fetchError } = await supabase
        .from('pets')
        .select('photo_url')
        .eq('id', petId)
        .single();

      if (fetchError) {
        console.error("deletePetMutation: Error fetching pet for photo deletion:", fetchError);
        throw fetchError;
      }

      if (petToDelete?.photo_url) {
        console.log("deletePetMutation: Deleting pet photo from storage:", petToDelete.photo_url);
        await deleteImageFromSupabase(petToDelete.photo_url);
      }

      console.log("deletePetMutation: Deleting pet from DB.");
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);
      if (error) {
        console.error("deletePetMutation: Error deleting pet from DB:", error);
        throw error;
      }
      console.log("deletePetMutation: Pet deleted successfully from DB.");
      return petId;
    },
    onSuccess: () => {
      console.log("deletePetMutation: Pet deleted successfully, invalidating queries.");
      queryClient.invalidateQueries({ queryKey: ['pets', userId] });
      showSuccess("Animal excluído com sucesso!");
      setIsPetDetailsDialogOpen(false); // Close details dialog
    },
    onError: (error) => {
      console.error("deletePetMutation: Error deleting animal:", error);
      showError(`Erro ao excluir animal: ${error.message}`);
    },
  });

  // --- Handlers ---
  const handleSelectSpecies = (species: string) => {
    setSelectedSpecies(species);
  };

  const handleAddClient = (data: ClientFormValues) => {
    console.log("handleAddClient called with data:", data);
    addClientMutation.mutate(data);
  };

  const handleEditClient = (client: Client) => {
    console.log("handleEditClient called with client:", client);
    setClientToEdit(client);
    setIsEditClientDialogOpen(true);
    setIsClientDetailsDialogOpen(false); // Close details dialog before opening edit
  };

  const handleUpdateClient = (data: ClientFormValues) => {
    if (!clientToEdit) {
      console.error("handleUpdateClient: clientToEdit is null, cannot update.");
      return;
    }
    console.log("handleUpdateClient called with data:", data, "for client ID:", clientToEdit.id);
    updateClientMutation.mutate({ ...data, id: clientToEdit.id });
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    console.log("handleDeleteClient called for client ID:", clientId, "name:", clientName);
    if (window.confirm(`Tem certeza que deseja excluir o tutor ${clientName} e todos os seus animais? Esta ação não pode ser desfeita.`)) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleClientRowClick = (client: Client) => {
    console.log("handleClientRowClick called with client:", client);
    setSelectedClient(client);
    setIsClientDetailsDialogOpen(true);
  };

  const handleAddPet = (data: PetFormValues) => {
    console.log("handleAddPet called with data:", data);
    addPetMutation.mutate(data);
  };

  const handleEditPet = (pet: Pet) => {
    console.log("handleEditPet called with pet:", pet);
    setPetToEdit(pet);
    setIsEditPetDialogOpen(true);
    setIsPetDetailsDialogOpen(false); // Close details dialog before opening edit
  };

  const handleUpdatePet = (data: PetFormValues) => {
    if (!petToEdit) {
      console.error("handleUpdatePet: petToEdit is null, cannot update.");
      return;
    }
    console.log("handleUpdatePet called with data:", data, "for pet ID:", petToEdit.id);
    updatePetMutation.mutate({ ...data, id: petToEdit.id });
  };

  const handleDeletePet = (petId: string, petName: string) => {
    console.log("handleDeletePet called for pet ID:", petId, "name:", petName);
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
    console.log("handlePetRowClick called with pet:", pet);
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
    console.log("handleViewClientPets called with client:", client);
    setClientToViewPets(client);
    setIsClientPetsDialogOpen(true);
  };

  // NEW: Local state for nested Add Pet dialog
  const [isNestedAddPetDialogOpen, setIsNestedAddPetDialogOpen] = useState(false);

  const handleAddPetForClient = (client: Client) => {
    console.log("handleAddPetForClient called for client ID:", client.id);
    setDefaultOwnerIdForPet(client.id);
    setDefaultOwnerNameForPet(client.name);
    setIsNestedAddPetDialogOpen(true); // Open nested dialog
    // setIsClientPetsDialogOpen(false); // No longer close parent dialog
  };

  const handleNestedAddPetClose = () => {
    setIsNestedAddPetDialogOpen(false);
    setDefaultOwnerIdForPet(undefined);
    setDefaultOwnerNameForPet(undefined);
  };

  const handleNestedAddPetSubmit = (data: PetFormValues) => {
    addPetMutation.mutate(data, {
      onSuccess: () => {
        handleNestedAddPetClose(); // Close nested dialog on success
        // The parent dialog (isClientPetsDialogOpen) remains open
      }
    });
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
        {activeTab === "tutores" && (
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
                isSubmittingParent={addClientMutation.isPending} // Passa o estado de carregamento da mutação
              />
            </DialogContent>
          </Dialog>
        )}
        {activeTab === "animais" && (
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
                defaultOwnerName={defaultOwnerNameForPet} /* Passa o nome do tutor */
              />
            </DialogContent>
          </Dialog>
        )}
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
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar tutores por nome, email, telefone, CPF ou cidade..." className="pl-9" value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    return (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium" onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>{client.name}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>{client.cpf}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          {client.dateOfBirth && isValid(parseISO(client.dateOfBirth))
                            ? format(parseISO(client.dateOfBirth), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          <p className="flex items-center text-sm"><Mail className="h-3 w-3 mr-1 text-muted-foreground" /> {client.email}</p>
                          <p className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1 text-muted-foreground" /> {client.phone}</p>
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handleClientRowClick(client); }}>
                          <p className="flex items-center text-sm"><Home className="h-3 w-3 mr-1 text-muted-foreground" /> {client.address?.street || 'N/A'}, {client.address?.number || 'N/A'} {client.address?.complement || ''}</p>
                          <p className="flex items-center text-sm"><MapPin className="h-3 w-3 mr-1 text-muted-foreground" /> {client.address?.neighborhood || 'N/A'}, {client.address?.city || 'N/A'} - {client.address?.state || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground ml-4">CEP: {client.address?.cep || 'N/A'}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAddPetForClient(client); }}>
                            Adicionar Animal
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id, client.name); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet) => {
                    const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                    const owner = clients.find(client => client.id === pet.ownerId);
                    return (
                      <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-bold flex items-center" onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {pet.name}
                        </TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>{pet.species}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>{pet.breed}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>{owner ? owner.name : "N/A"}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>{pet.age}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>{pet.gender}</TableCell>
                        <TableCell onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>{pet.color}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
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
                    <TableCell colSpan={8} className="h-24 text-center">
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

      {/* Diálogo para ver os animais de um tutor específico */}
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
                      return (
                        <div key={pet.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                          <div className="flex items-center">
                            <IconComponent className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{pet.name} ({pet.species})</p>
                              <p className="text-sm text-muted-foreground">Raça: {pet.breed} | Idade: {pet.age}</p>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm" onClick={() => handlePetRowClick(pet)}>
                              <Eye className="h-4 w-4" />
                            </Button>
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

      {/* Diálogo de Detalhes do Tutor */}
      <ClientDetailsDialog
        client={selectedClient}
        isOpen={isClientDetailsDialogOpen}
        onClose={() => setIsClientDetailsDialogOpen(false)}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onViewPets={handleViewClientPets}
      />

      {/* Diálogo de Edição de Tutor */}
      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tutor</DialogTitle>
          </DialogHeader>
          {clientToEdit && (
            <ClientForm
              key={clientToEdit.id} // Key para forçar re-renderização com novos dados
              onSubmit={handleUpdateClient}
              onCancel={() => setIsEditClientDialogOpen(false)}
              initialData={clientToEdit}
              isSubmittingParent={updateClientMutation.isPending} // Passa o estado de carregamento da mutação
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição de Animal */}
      <Dialog open={isEditPetDialogOpen} onOpenChange={setIsEditPetDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Animal</DialogTitle>
          </DialogHeader>
          {petToEdit && (
            <PetForm
              key={petToEdit.id} // Key para forçar re-renderização com novos dados
              onSubmit={handleUpdatePet}
              onCancel={() => setIsEditPetDialogOpen(false)}
              initialData={petToEdit}
              allClients={clients}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Aninhado para Adicionar Animal (MOVIDO PARA CÁ) */}
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
    </div>
  );
};

export default Cadastro;