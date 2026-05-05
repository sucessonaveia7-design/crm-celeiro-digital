export interface Contact {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  subscriptionDate: string;
}

export const mockContacts: Contact[] = [
  {
    id: "1",
    name: "João Silva",
    whatsapp: "+55 11 99999-1111",
    email: "joao@email.com",
    subscriptionDate: "2023-10-01",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    whatsapp: "+55 11 99999-2222",
    email: "maria@email.com",
    subscriptionDate: "2023-10-02",
  },
  {
    id: "3",
    name: "Carlos Souza",
    whatsapp: "+55 11 99999-3333",
    email: "carlos@email.com",
    subscriptionDate: "2023-10-03",
  },
  {
    id: "4",
    name: "Ana Costa",
    whatsapp: "+55 11 99999-4444",
    email: "ana@email.com",
    subscriptionDate: "2023-10-04",
  },
  {
    id: "5",
    name: "Pedro Santos",
    whatsapp: "+55 11 99999-5555",
    email: "pedro@email.com",
    subscriptionDate: "2023-10-05",
  },
];
