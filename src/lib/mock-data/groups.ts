export interface Group {
  id: string;
  name: string;
  size: number;
  status: 'active' | 'inactive';
  whatsapp: string;
}

export const mockGroups: Group[] = [
  {
    id: "1",
    name: "VIP Black Friday",
    size: 245,
    status: "active",
    whatsapp: "+55 11 99999-9999",
  },
  {
    id: "2",
    name: "Lançamento Jan/24",
    size: 120,
    status: "active",
    whatsapp: "+55 11 99999-9999",
  },
  {
    id: "3",
    name: "Lista de Espera",
    size: 56,
    status: "inactive",
    whatsapp: "+55 11 99999-8888",
  },
];
