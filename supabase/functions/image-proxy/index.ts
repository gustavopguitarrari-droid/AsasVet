import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const imageUrl = url.searchParams.get('imageUrl')

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'O parâmetro imageUrl é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Busca a imagem da URL externa, simulando um navegador para contornar proteções
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': new URL(imageUrl).origin + '/' // Adiciona um referer genérico
      }
    })

    if (!imageResponse.ok) {
      return new Response(JSON.stringify({ error: `Falha ao buscar a imagem. Status: ${imageResponse.status}` }), {
        status: imageResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Pega os dados da imagem como um blob
    const imageBlob = await imageResponse.blob()
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg'

    // Retorna a imagem com os cabeçalhos corretos
    const headers = new Headers(corsHeaders)
    headers.set('Content-Type', contentType)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable') // Cache de 1 ano

    return new Response(imageBlob, { headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})