"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, XCircle, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadLogoToSupabase, deleteLogoFromSupabase } from "@/utils/supabaseStorage";

const LogoUploadSettings: React.FC = () => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.logoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o preview quando o logo do usuário muda no contexto
  useEffect(() => {
    console.log("LogoUploadSettings: user.logoUrl changed to", user?.logoUrl);
    setPreviewUrl(user?.logoUrl || null);
  }, [user?.logoUrl]);

  // Reset selected file and input when dialog is closed or user changes
  useEffect(() => {
    if (!user) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user]);


  const updateProfileLogoMutation = useMutation({
    mutationFn: async (newLogoUrl: string | null) => {
      if (!user?.id) {
        console.error("updateProfileLogoMutation: User not authenticated.");
        throw new Error("User not authenticated.");
      }
      console.log("updateProfileLogoMutation: Attempting to update profile with logo_url:", newLogoUrl);

      const { data, error } = await supabase
        .from('profiles')
        .update({ logo_url: newLogoUrl })
        .eq('id', user.id)
        .select()
        .single();
      if (error) {
        console.error("updateProfileLogoMutation: Error updating profile in DB:", error);
        throw error;
      }
      console.log("updateProfileLogoMutation: Profile updated successfully in DB:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("updateProfileLogoMutation: onSuccess, data:", data);
      setUser((prevUser) => ({
        ...prevUser!,
        logoUrl: data.logo_url || undefined,
      }));
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] });
      showSuccess("Logo atualizado com sucesso!");
      setSelectedFile(null); // Limpa o arquivo selecionado após o upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpa o input de arquivo
      }
    },
    onError: (error) => {
      console.error("updateProfileLogoMutation: onError, error:", error);
      showError(`Erro ao atualizar logo: ${error.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("handleFileChange: Selected file:", file);
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem válido.");
        setSelectedFile(null);
        setPreviewUrl(user?.logoUrl || null); // Reverte para o logo atual do usuário
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Limite de 5MB para logos
        showError("A imagem é muito grande. O tamanho máximo permitido é 5MB.");
        setSelectedFile(null);
        setPreviewUrl(user?.logoUrl || null); // Reverte para o logo atual do usuário
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.logoUrl || null); // Reverte para o logo atual do usuário
    }
  };

  const handleUploadLogo = async () => {
    console.log("handleUploadLogo: Initiating upload process.");
    if (!user?.id) {
      showError("Usuário não autenticado.");
      console.error("handleUploadLogo: User ID is missing.");
      return;
    }
    if (!selectedFile) {
      showError("Nenhum arquivo selecionado para upload.");
      console.warn("handleUploadLogo: No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        console.log("handleUploadLogo: FileReader finished, result type string.");
        try {
          const oldLogoUrl = user.logoUrl; // Get the current logo URL before uploading new one
          const newLogoUrl = await uploadLogoToSupabase(reader.result, user.id);
          
          if (newLogoUrl) {
            console.log("handleUploadLogo: Logo uploaded to storage, new URL:", newLogoUrl);
            
            // If there was an old logo and it's different from the new one, delete it from storage
            if (oldLogoUrl && oldLogoUrl !== newLogoUrl) {
              console.log("handleUploadLogo: Old logo detected, attempting to delete:", oldLogoUrl);
              await deleteLogoFromSupabase(oldLogoUrl);
            }
            
            updateProfileLogoMutation.mutate(newLogoUrl);
          } else {
            showError("Falha ao fazer upload do logo para o storage.");
            console.error("handleUploadLogo: uploadLogoToSupabase returned null.");
          }
        } catch (err: any) {
          showError(`Erro no upload: ${err.message}`);
          console.error("handleUploadLogo: Error during uploadLogoToSupabase or mutation:", err);
        }
      } else {
        console.error("handleUploadLogo: FileReader result is not a string.");
        showError("Erro ao ler o arquivo de imagem.");
      }
    };
    reader.onerror = () => {
      console.error("handleUploadLogo: FileReader error.");
      showError("Erro ao ler o arquivo de imagem.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveLogo = async () => {
    console.log("handleRemoveLogo: Initiating remove process.");
    if (!user?.id) {
      showError("Usuário não autenticado.");
      console.error("handleRemoveLogo: User ID is missing.");
      return;
    }
    if (!user.logoUrl) {
      showSuccess("Nenhum logo para remover.");
      console.warn("handleRemoveLogo: No logo URL found in user context.");
      return;
    }

    try {
      const success = await deleteLogoFromSupabase(user.logoUrl);
      if (success) {
        console.log("handleRemoveLogo: Logo deleted from storage.");
        updateProfileLogoMutation.mutate(null); // Remove o URL do logo do perfil
      } else {
        showError("Falha ao remover o logo do storage.");
        console.error("handleRemoveLogo: deleteLogoFromSupabase returned false.");
      }
    } catch (err: any) {
      showError(`Erro na remoção: ${err.message}`);
      console.error("handleRemoveLogo: Error during deleteLogoFromSupabase or mutation:", err);
    }
  };

  const isSubmitting = updateProfileLogoMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" /> Logo da Clínica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Faça upload do logo da sua clínica. Ele será usado em documentos como prontuários médicos.
        </p>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt="Logo da Clínica" />
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground">
                <ImageIcon className="h-16 w-16" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="logo-upload">Escolher Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleUploadLogo}
              disabled={!selectedFile || isSubmitting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Salvar Logo"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveLogo}
              disabled={!user?.logoUrl || isSubmitting}
              className="text-destructive hover:bg-destructive/10"
            >
              <XCircle className="h-4 w-4 mr-2" /> Remover Logo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoUploadSettings;