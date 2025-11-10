import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock de dados simulando a base do Vet Smart
const mockBularioData = [
  {
    id: "1",
    name: "Carproflan",
    principle: "Carprofeno",
    manufacturer: "Agener União",
    indications: "Anti-inflamatório não esteroide (AINE) com ação analgésica e antitérmica. Indicado para o alívio de dor e inflamação em cães, decorrentes de afecções musculoesqueléticas e processos pós-operatórios.",
    contraindications: "Não administrar em gatos. Não utilizar em animais com histórico de hipersensibilidade ao carprofeno. Usar com cautela em animais com doenças renais, hepáticas ou cardíacas.",
    dosage: {
      dogs: "2,2 mg/kg, a cada 12 horas, ou 4,4 mg/kg, a cada 24 horas, por via oral.",
      cats: "Não recomendado.",
    },
    presentations: ["25mg", "75mg", "100mg"],
  },
  {
    id: "2",
    name: "Apoquel",
    principle: "Oclacitinib",
    manufacturer: "Zoetis",
    indications: "Tratamento do prurido associado à dermatite alérgica e controle da dermatite atópica em cães com mais de 12 meses de idade.",
    contraindications: "Não utilizar em animais reprodutores, ou em cadelas prenhes ou lactantes. Não administrar em cães com menos de 12 meses de idade. Não usar em cães com infecções graves.",
    dosage: {
      dogs: "0,4 a 0,6 mg/kg, a cada 12 horas por até 14 dias, e depois uma vez ao dia para manutenção.",
      cats: "Uso não aprovado em gatos.",
    },
    presentations: ["3.6mg", "5.4mg", "16mg"],
  },
  {
    id: "3",
    name: "Milbemax",
    principle: "Milbemicina oxima, Praziquantel",
    manufacturer: "Elanco",
    indications: "Tratamento e controle de infestações intestinais por vermes redondos (nematódeos) e chatos (cestódeos) em cães e gatos. Prevenção da dirofilariose (verme do coração).",
    contraindications: "Não administrar em cães da raça Collie, Pastor de Shetland, Old English Sheepdog, Australian Shepherd e seus cruzamentos com sensibilidade à ivermectina/milbemicina. Não usar em filhotes com menos de 2 semanas de idade.",
    dosage: {
      dogs: "Administração oral única, com dose mínima de 0,5 mg/kg de milbemicina oxima e 5 mg/kg de praziquantel.",
      cats: "Administração oral única, com dose mínima de 2 mg/kg de milbemicina oxima e 5 mg/kg de praziquantel.",
    },
    presentations: ["Cães até 5kg", "Cães de 5 a 25kg", "Gatos até 2kg", "Gatos de 2 a 8kg"],
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = mockBularioData.filter(drug =>
      drug.name.toLowerCase().includes(lowerCaseQuery) ||
      drug.principle.toLowerCase().includes(lowerCaseQuery)
    );

    return new Response(JSON.stringify({ data: results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});