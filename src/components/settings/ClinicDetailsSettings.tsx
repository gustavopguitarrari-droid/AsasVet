"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, XCircle, Building2, Landmark, Phone, Home, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadLogoToSupabase, deleteLogoFromSupabase } from "@/utils/supabaseStorage";
import EditableField from "@/components/EditableField";
import { lookupCep } from "@/utils/cepLookup"; // Importar lookupCep

const ClinicDetailsSettings: React.FC = () => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.logoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o preview quando o logo do usuário muda no contexto
  useEffect(() => {
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

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { [key: string]: any }) => {
      if (!user?.id) {
        throw new Error("User not authenticated.");
      }
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setUser((prevUser) => ({
        ...prevUser!,
        companyName: data.company_name || undefined,
        logoUrl: data.logo_url || undefined,
        phone: data.phone || undefined,
        addressCep: data.address_cep || undefined,
        addressStreet: data.address_street || undefined,
        addressNumber: data.address_number || undefined,
        addressComplement: data.address_complement || undefined,
        addressNeighborhood: data.address_neighborhood || undefined,
        addressCity: data.address_city || undefined,
        addressState: data.address_state || undefined,
      }));
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] });
      showSuccess("Detalhes da clínica atualizados com sucesso!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      showError(`Erro ao atualizar detalhes da clínica: ${error.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem válido.");
        setSelectedFile(null);
        setPreviewUrl(user?.logoUrl || null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Limite de 5MB para logos
        showError("A imagem é muito grande. O tamanho máximo permitido é 5MB.");
        setSelectedFile(null);
        setPreviewUrl(user?.logoUrl || null);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.onerror = () => {
        showError("Erro ao ler o arquivo de imagem.");
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.logoUrl || null);
    }
  };

  const handleUploadLogo = async () => {
    if (!user?.id || !user?.organizationId) {
      showError("Usuário não autenticado ou ID da organização não disponível.");
      return;
    }
    if (!selectedFile) {
      showError("Nenhum arquivo selecionado para upload.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        try {
          if (user.logoUrl) {
            await deleteLogoFromSupabase(user.logoUrl);
          }
          const newLogoUrl = await uploadLogoToSupabase(reader.result, user.organizationId);
          
          if (newLogoUrl) {
            updateProfileMutation.mutate({ logo_url: newLogoUrl });
          } else {
            showError("Falha ao fazer upload do logo para o storage.");
          }
        } catch (err: any) {
          showError(`Erro no upload: ${err.message}`);
        }
      } else {
        showError("Erro ao ler o arquivo de imagem.");
      }
    };
    reader.onerror = () => {
      showError("Erro ao ler o arquivo de imagem.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveLogo = async () => {
    if (!user?.id || !user?.organizationId) {
      showError("Usuário não autenticado ou ID da organização não disponível.");
      return;
    }
    if (!user.logoUrl) {
      showSuccess("Nenhum logo para remover.");
      return;
    }

    try {
      const success = await deleteLogoFromSupabase(user.logoUrl);
      if (success) {
        updateProfileMutation.mutate({ logo_url: null });
      } else {
        showError("Falha ao remover o logo do storage.");
      }
    } catch (err: any) {
      showError(`Erro na remoção: ${err.message}`);
    }
  };

  const handleSaveField = (fieldName: string, newValue: string) => {
    updateProfileMutation.mutate({ [fieldName]: newValue });
  };

  const handleSaveCep = async (newCep: string) => {
    const cleanCep = newCep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const addressData = await lookupCep(cleanCep);
      if (addressData) {
        updateProfileMutation.mutate({
          address_cep: cleanCep,
          address_street: addressData.logradouro,
          address_neighborhood: addressData.bairro,
          address_city: addressData.localidade,
          address_state: addressData.uf,
        });
        showSuccess("Endereço preenchido automaticamente!");
      } else {
        showError("CEP não encontrado ou inválido.");
        updateProfileMutation.mutate({
          address_cep: cleanCep,
          address_street: null,
          address_neighborhood: null,
          address_city: null,
          address_state: null,
        });
      }
    } else {
      updateProfileMutation.mutate({ address_cep: cleanCep });
    }
  };

  const isSubmitting = updateProfileMutation.isPending;

  return (
    <Card className="w-full"> {/* Adicionado w-full aqui */}
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" /> Detalhes da Clínica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4 mt-6">
          <Label className="text-lg font-semibold flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" /> Logo da Clínica
          </Label>
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
            {/* Input de arquivo nativo oculto */}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden" // Oculta o input nativo
            />
            {/* Botão customizado que aciona o input de arquivo */}
            <Button
              type="button" // Importante para não submeter o formulário
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg" // Estilo do botão
              disabled={isSubmitting}
            >
              <Upload className="h-4 w-4 mr-2" /> Escolher Arquivo
            </Button>
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

        {/* Campo para Nome do Empreendimento */}
        <EditableField
          label="Nome do Empreendimento"
          value={user?.companyName || ''}
          onSave={(val) => handleSaveField('company_name', val)}
          icon={Landmark}
          className="mb-6"
        />

        {/* Campo para Telefone */}
        <EditableField
          label="Telefone"
          value={user?.phone || ''}
          onSave={(val) => handleSaveField('phone', val)}
          icon={Phone}
          type="text"
          className="mb-6"
        />

        {/* Seção de Endereço */}
        <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center">
          <Home className="h-5 w-5 mr-2 text-muted-foreground" /> Endereço da Clínica
        </h3>
        <EditableField
          label="CEP"
          value={user?.addressCep || ''}
          onSave={handleSaveCep}
          icon={MapPin}
          type="text"
        />
        <EditableField
          label="Rua"
          value={user?.addressStreet || ''}
          onSave={(val) => handleSaveField('address_street', val)}
          icon={MapPin}
          type="text"
        />
        <EditableField
          label="Número"
          value={user?.addressNumber || ''}
          onSave={(val) => handleSaveField('address_number', val)}
          icon={MapPin}
          type="text"
        />
        <EditableField
          label="Complemento"
          value={user?.addressComplement || ''}
          onSave={(val) => handleSaveField('address_complement', val)}
          icon={MapPin}
          type="text"
        />
        <EditableField
          label="Bairro"
          value={user?.addressNeighborhood || ''}
          onSave={(val) => handleSaveField('address_neighborhood', val)}
          icon={MapPin}
          type="text"
        />
        <EditableField
          label="Cidade"
          value={user?.addressCity || ''}
          onSave={(val) => handleSaveField('address_city', val)}
          icon={MapPin}
          type="text"
        />
        <EditableField
          label="Estado (UF)"
          value={user?.addressState || ''}
          onSave={(val) => handleSaveField('address_state', val)}
          icon={MapPin}
          type="text"
        />
      </CardContent>
    </Card>
  );
};

export default ClinicDetailsSettings;