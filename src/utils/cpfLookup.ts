export interface CpfData {
  cpf: string;
  name: string;
}

/**
 * Simula a busca de um nome a partir de um CPF.
 * Em um ambiente real, esta função faria uma chamada a uma API externa.
 * @param cpf O número do CPF (apenas dígitos).
 * @returns Um objeto CpfData com o nome, ou null se não encontrado.
 */
export const lookupCpf = async (cpf: string): Promise<CpfData | null> => {
  const cleanCpf = cpf.replace(/\D/g, '');

  if (cleanCpf.length !== 11) {
    return null;
  }

  // Simulação de dados: em um cenário real, isso viria de um banco de dados ou API
  const mockCpfDatabase: { [key: string]: string } = {
    "11122233344": "Maria Oliveira",
    "55566677788": "Carlos Pereira",
    "99988877766": "Ana Costa",
  };

  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  if (mockCpfDatabase[cleanCpf]) {
    return { cpf: cleanCpf, name: mockCpfDatabase[cleanCpf] };
  }

  return null;
};