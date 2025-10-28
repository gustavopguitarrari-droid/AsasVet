import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const AVATARS_BUCKET_NAME = 'avatars';
const LOGOS_BUCKET_NAME = 'logos';
const RECIPES_BUCKET_NAME = 'recipes'; // NOVO: Nome do bucket para receitas

/**
 * Converte uma string Base64 em um Blob.
 * @param base64 A string Base64 da imagem.
 * @param contentType O tipo de conteúdo da imagem (ex: 'image/png', 'image/jpeg').
 * @returns Um objeto Blob.
 */
const base64ToBlob = (base64: string, contentType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

/**
 * Faz upload de uma imagem Base64 para o Supabase Storage.
 * @param base64Image A string Base64 da imagem (ex: "data:image/png;base64,...").
 * @param userId O ID do usuário proprietário da imagem.
 * @param entityType O tipo de entidade (ex: 'clients', 'pets').
 * @param entityId O ID da entidade (cliente ou pet).
 * @returns A URL pública da imagem ou null em caso de erro.
 */
export const uploadImageToSupabase = async (
  base64Image: string,
  userId: string,
  entityType: 'clients' | 'pets',
  entityId: string
): Promise<string | null> => {
  if (!base64Image) return null;

  try {
    const contentType = base64Image.substring(
      base64Image.indexOf(":") + 1,
      base64Image.indexOf(";")
    );
    const fileExtension = contentType.split('/')[1];
    const fileName = `${uuidv4()}.${fileExtension}`; // Nome de arquivo único
    const filePath = `${userId}/${entityType}/${entityId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(AVATARS_BUCKET_NAME) // Usando o bucket de avatares
      .upload(filePath, base64ToBlob(base64Image, contentType), {
        contentType,
        upsert: false, // Não sobrescrever se já existir
      });

    if (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATARS_BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Erro no processo de upload da imagem:", error);
    return null;
  }
};

/**
 * Deleta uma imagem do Supabase Storage usando sua URL pública.
 * @param publicUrl A URL pública da imagem a ser deletada.
 * @returns True se a exclusão foi bem-sucedida, false caso contrário.
 */
export const deleteImageFromSupabase = async (publicUrl: string): Promise<boolean> => {
  if (!publicUrl) return true; // Nada para deletar se não há URL

  try {
    // Extrai o caminho do arquivo da URL pública
    const pathSegments = publicUrl.split(`${AVATARS_BUCKET_NAME}/`);
    if (pathSegments.length < 2) {
      console.warn("URL pública inválida para exclusão:", publicUrl);
      return false;
    }
    const filePath = pathSegments[1];

    const { error } = await supabase.storage
      .from(AVATARS_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Erro ao deletar imagem do storage:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Erro no processo de exclusão da imagem:", error);
    return false;
  }
};

// Funções para upload e exclusão de logos
export const uploadLogoToSupabase = async (
  base64Image: string,
  userId: string,
): Promise<string | null> => {
  if (!base64Image) {
    console.log("uploadLogoToSupabase: No base64Image provided.");
    return null;
  }

  try {
    const contentType = base64Image.substring(
      base64Image.indexOf(":") + 1,
      base64Image.indexOf(";")
    );
    const fileExtension = contentType.split('/')[1];
    // Usar um nome de arquivo único para o logo do usuário para evitar cache
    const fileName = `${uuidv4()}.${fileExtension}`; 
    const filePath = `${userId}/${fileName}`; // Caminho: userId/uuid.ext
    console.log(`uploadLogoToSupabase: Attempting to upload to filePath: ${filePath} with contentType: ${contentType}`);

    const { data, error } = await supabase.storage
      .from(LOGOS_BUCKET_NAME)
      .upload(filePath, base64ToBlob(base64Image, contentType), {
        contentType,
        upsert: false, // Não sobrescrever, pois o nome do arquivo é único
      });

    if (error) {
      console.error("uploadLogoToSupabase: Erro ao fazer upload do logo:", error);
      throw error;
    }
    console.log("uploadLogoToSupabase: Upload successful, data:", data);

    const { data: publicUrlData } = supabase.storage
      .from(LOGOS_BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log("uploadLogoToSupabase: Public URL obtained:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("uploadLogoToSupabase: Erro no processo de upload do logo:", error);
    return null;
  }
};

export const deleteLogoFromSupabase = async (publicUrl: string): Promise<boolean> => {
  if (!publicUrl) {
    console.log("deleteLogoFromSupabase: No publicUrl provided, nothing to delete.");
    return true;
  }

  try {
    // Extrai o caminho do arquivo da URL pública de forma mais robusta
    // Exemplo publicUrl: https://<project_id>.supabase.co/storage/v1/object/public/logos/user_id/uuid.png
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split('/');
    // O caminho do arquivo no storage é tudo depois de '/storage/v1/object/public/logos/'
    const bucketIndex = pathSegments.indexOf(LOGOS_BUCKET_NAME);
    if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) {
      console.warn("deleteLogoFromSupabase: URL pública inválida para exclusão do logo:", publicUrl);
      return false;
    }
    const filePath = pathSegments.slice(bucketIndex + 1).join('/'); // user_id/uuid.ext
    console.log(`deleteLogoFromSupabase: Attempting to delete filePath: ${filePath} from bucket: ${LOGOS_BUCKET_NAME}`);

    const { error } = await supabase.storage
      .from(LOGOS_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("deleteLogoFromSupabase: Erro ao deletar logo do storage:", error);
      return false;
    }
    console.log("deleteLogoFromSupabase: Logo deleted successfully.");
    return true;
  } catch (error) {
    console.error("deleteLogoFromSupabase: Erro no processo de exclusão do logo:", error);
    return false;
  }
};

// NOVO: Funções para upload e exclusão de PDFs de receitas
export const uploadRecipePdfToSupabase = async (
  pdfBlob: Blob,
  userId: string,
  appointmentId: string,
): Promise<string | null> => {
  try {
    const fileName = `receita_${appointmentId}_${uuidv4()}.pdf`;
    const filePath = `${userId}/${appointmentId}/${fileName}`; // Caminho: userId/appointmentId/uuid.pdf

    const { data, error } = await supabase.storage
      .from(RECIPES_BUCKET_NAME)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error("uploadRecipePdfToSupabase: Erro ao fazer upload do PDF da receita:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(RECIPES_BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("uploadRecipePdfToSupabase: Erro no processo de upload do PDF da receita:", error);
    return null;
  }
};

export const deleteRecipePdfFromSupabase = async (publicUrl: string): Promise<boolean> => {
  if (!publicUrl) return true;

  try {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(RECIPES_BUCKET_NAME);
    if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) {
      console.warn("deleteRecipePdfFromSupabase: URL pública inválida para exclusão do PDF da receita:", publicUrl);
      return false;
    }
    const filePath = pathSegments.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(RECIPES_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("deleteRecipePdfFromSupabase: Erro ao deletar PDF da receita do storage:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("deleteRecipePdfFromSupabase: Erro no processo de exclusão do PDF da receita:", error);
    return false;
  }
};