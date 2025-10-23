export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ownerId: string; // ID do tutor associado
}