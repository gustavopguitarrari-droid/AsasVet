import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'avatars';

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
    const blob = base64ToBlob(base64Image, contentType);
    const fileExtension = contentType.split('/')[1];
    const fileName = `${uuidv4()}.${fileExtension}`; // Nome de arquivo único
    const filePath = `${userId}/${entityType}/${entityId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType,
        upsert: false, // Não sobrescrever se já existir
      });

    if (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
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
    const pathSegments = publicUrl.split(`${BUCKET_NAME}/`);
    if (pathSegments.length < 2) {
      console.warn("URL pública inválida para exclusão:", publicUrl);
      return false;
    }
    const filePath = pathSegments[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
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