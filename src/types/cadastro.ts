export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  dateOfBirth: string; // Formato YYYY-MM-DD
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  observations?: string; // Novo campo
  photoUrl?: string; // Novo campo para URL da foto (Base64)
}

export interface Pet {
  id: string;
  name: string;
  species: "Cachorro" | "Gato" | "Pássaro" | "Roedor" | "Peixe" | "Outros"; // Tipo de enumeração
  breed: string;
  age: string; // Novo campo (ex: "2 anos", "6 meses")
  gender: 'Macho' | 'Fêmea' | 'Desconhecido'; // Tipo de enumeração
  color: string; // Novo campo
  observations?: string; // Novo campo
  photoUrl?: string; // Novo campo para URL da foto (Base64)
  ownerId: string; // ID do tutor associado (chave estrangeira)
}