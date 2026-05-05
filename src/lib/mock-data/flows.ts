export interface Flow {
  id: string;
  name: string;
  platform: 'WhatsApp';
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export const mockFlows: Flow[] = [
  {
    id: "1",
    name: "Denilson Dias",
    platform: "WhatsApp",
    folder: "Raiz",
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-05T14:30:00Z",
  },
  {
    id: "2",
    name: "Onboarding Novo Cliente",
    platform: "WhatsApp",
    folder: "Raiz",
    createdAt: "2023-10-02T09:15:00Z",
    updatedAt: "2023-10-06T11:20:00Z",
  },
  {
    id: "3",
    name: "Recuperação de Carrinho",
    platform: "WhatsApp",
    folder: "Raiz",
    createdAt: "2023-10-03T16:45:00Z",
    updatedAt: "2023-10-07T08:10:00Z",
  },
];
