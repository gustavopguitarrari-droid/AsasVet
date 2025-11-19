const SUPABASE_PROJECT_ID = "cczhdrwgsirbiqqqffzw";

export const createProxyUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  // Validação básica para evitar proxy de nossas próprias URLs de proxy
  if (url.includes('/functions/v1/image-proxy')) return url;
  
  try {
    // Verifica se é uma URL válida antes de codificar
    new URL(url);
    return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/image-proxy?imageUrl=${encodeURIComponent(url)}`;
  } catch (e) {
    // Se não for uma URL válida (ex: um data URI), retorna como está
    return url;
  }
};