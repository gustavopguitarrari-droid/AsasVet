import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const AVATARS_BUCKET_NAME = 'avatars';
const LOGOS_BUCKET_NAME = 'logos';
const PRESCRIPTIONS_BUCKET_NAME = 'prescriptions'; // NOVO: Nome do bucket para prescrições
const MEDICAL_RECORDS_BUCKET_NAME = 'medical_records_pdfs'; // NOVO: Nome do bucket para prontuários médicos

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
 * @param organizationId O ID da organização/clínica proprietária da imagem.
 * @param entityType O tipo de entidade (ex: 'clients', 'pets').
 * @param entityId O ID da entidade (cliente ou pet).
 * @returns A URL pública da imagem ou null em caso de erro.
 */
export const uploadImageToSupabase = async (
  base64Image: string,
  organizationId: string, // Alterado de userId para organizationId
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
    const filePath = `${organizationId}/${entityType}/${entityId}/${fileName}`; // Caminho: organizationId/entityType/entityId/uuid.ext
    console.log(`uploadImageToSupabase: Using organizationId: ${organizationId}, filePath: ${filePath}`); // ADDED LOG

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
  organizationId: string, // Alterado de userId para organizationId
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
    const filePath = `${organizationId}/${fileName}`; // Caminho: organizationId/uuid.ext
    console.log(`uploadLogoToSupabase: Using organizationId: ${organizationId}, filePath: ${filePath}`); // ADDED LOG

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
    const filePath = pathSegments.slice(bucketIndex + 1).join('/'); // organizationId/uuid.ext
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
  organizationId: string, // Alterado de userId para organizationId
  appointmentId: string,
): Promise<string | null> => {
  console.log("uploadRecipePdfToSupabase: Iniciando upload do PDF da receita.");
  try {
    const fileName = `receita_${appointmentId}_${uuidv4()}.pdf`;
    const filePath = `${organizationId}/${appointmentId}/${fileName}`; // Caminho: organizationId/appointmentId/uuid.pdf
    console.log(`uploadRecipePdfToSupabase: Tentando upload para filePath: ${filePath} no bucket: ${PRESCRIPTIONS_BUCKET_NAME}`);
    console.log(`uploadRecipePdfToSupabase: Using organizationId: ${organizationId}, filePath: ${filePath}`); // ADDED LOG

    const { data, error } = await supabase.storage
      .from(PRESCRIPTIONS_BUCKET_NAME)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error("uploadRecipePdfToSupabase: Erro ao fazer upload do PDF da receita:", error);
      throw error;
    }
    console.log("uploadRecipePdfToSupabase: Upload bem-sucedido, data:", data);

    const { data: publicUrlData } = supabase.storage
      .from(PRESCRIPTIONS_BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log("uploadRecipePdfToSupabase: URL pública obtida:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("uploadRecipePdfToSupabase: Erro no processo de upload do PDF da receita:", error);
    return null;
  }
};

export const deleteRecipePdfFromSupabase = async (publicUrl: string): Promise<boolean> => {
  console.log("deleteRecipePdfFromSupabase: Iniciando exclusão do PDF da receita para URL:", publicUrl);
  if (!publicUrl) {
    console.log("deleteRecipePdfFromSupabase: Nenhuma publicUrl fornecida, nada para deletar.");
    return true;
  }

  try {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(PRESCRIPTIONS_BUCKET_NAME);
    if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) {
      console.warn("deleteRecipePdfFromSupabase: URL pública inválida para exclusão do PDF da receita:", publicUrl);
      return false;
    }
    const filePath = pathSegments.slice(bucketIndex + 1).join('/');
    console.log(`deleteRecipePdfFromSupabase: Tentando deletar filePath: ${filePath} do bucket: ${PRESCRIPTIONS_BUCKET_NAME}`);

    const { error } = await supabase.storage
      .from(PRESCRIPTIONS_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("deleteRecipePdfFromSupabase: Erro ao deletar PDF da receita do storage:", error);
      return false;
    }
    console.log("deleteRecipePdfFromSupabase: PDF da receita deletado com sucesso.");
    return true;
  } catch (error) {
    console.error("deleteRecipePdfFromSupabase: Erro no processo de exclusão do PDF da receita:", error);
    return false;
  }
};

// NOVO: Funções para upload e exclusão de PDFs de prontuários médicos
export const uploadMedicalRecordPdfToSupabase = async (
  pdfBlob: Blob,
  organizationId: string,
  medicalRecordId: string,
): Promise<string | null> => {
  console.log("uploadMedicalRecordPdfToSupabase: Iniciando upload do PDF do prontuário.");
  try {
    const fileName = `prontuario_${medicalRecordId}_${uuidv4()}.pdf`;
    const filePath = `${organizationId}/${medicalRecordId}/${fileName}`; // Caminho: organizationId/medicalRecordId/uuid.pdf
    console.log(`uploadMedicalRecordPdfToSupabase: Tentando upload para filePath: ${filePath} no bucket: ${MEDICAL_RECORDS_BUCKET_NAME}`);
    console.log(`uploadMedicalRecordPdfToSupabase: Using organizationId: ${organizationId}, filePath: ${filePath}`); // ADDED LOG

    const { data, error } = await supabase.storage
      .from(MEDICAL_RECORDS_BUCKET_NAME)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error("uploadMedicalRecordPdfToSupabase: Erro ao fazer upload do PDF do prontuário:", error);
      throw error;
    }
    console.log("uploadMedicalRecordPdfToSupabase: Upload bem-sucedido, data:", data);

    const { data: publicUrlData } = supabase.storage
      .from(MEDICAL_RECORDS_BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log("uploadMedicalRecordPdfToSupabase: URL pública obtida:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("uploadMedicalRecordPdfToSupabase: Erro no processo de upload do PDF do prontuário:", error);
    return null;
  }
};

export const deleteMedicalRecordPdfFromSupabase = async (publicUrl: string): Promise<boolean> => {
  console.log("deleteMedicalRecordPdfFromSupabase: Iniciando exclusão do PDF do prontuário para URL:", publicUrl);
  if (!publicUrl) {
    console.log("deleteMedicalRecordPdfFromSupabase: Nenhuma publicUrl fornecida, nada para deletar.");
    return true;
  }

  try {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(MEDICAL_RECORDS_BUCKET_NAME);
    if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) {
      console.warn("deleteMedicalRecordPdfFromSupabase: URL pública inválida para exclusão do PDF do prontuário:", publicUrl);
      return false;
    }
    const filePath = pathSegments.slice(bucketIndex + 1).join('/');
    console.log(`deleteMedicalRecordPdfFromSupabase: Tentando deletar filePath: ${filePath} do bucket: ${MEDICAL_RECORDS_BUCKET_NAME}`);

    const { error } = await supabase.storage
      .from(MEDICAL_RECORDS_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("deleteMedicalRecordPdfFromSupabase: Erro ao deletar PDF do prontuário do storage:", error);
      return false;
    }
    console.log("deleteMedicalRecordPdfFromSupabase: PDF do prontuário deletado com sucesso.");
    return true;
  } catch (error) {
    console.error("deleteMedicalRecordPdfFromSupabase: Erro no processo de exclusão do PDF do prontuário:", error);
    return false;
  }
};