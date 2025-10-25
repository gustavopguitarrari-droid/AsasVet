export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string; // Novo campo
  dateOfBirth: string; // Novo campo (formato YYYY-MM-DD)
  address: { // Novo campo de endereço
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  photoUrl?: string; // Novo campo para URL da foto
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ownerId: string; // ID do tutor associado
}