export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string; // Novo campo
  address: string; // Novo campo
  gender: 'Masculino' | 'Feminino' | 'Outro'; // Novo campo
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ownerId: string; // ID do tutor associado
}