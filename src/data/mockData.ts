import { Team, Person, License, Asset, DashboardStats } from '@/types';

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Desenvolvimento',
    description: 'Equipe de desenvolvimento de software',
    peopleCount: 8,
    createdAt: '2024-01-15',
    organizationId: '1'
  },
  {
    id: '2',
    name: 'Infraestrutura',
    description: 'Equipe de infraestrutura e DevOps',
    peopleCount: 4,
    createdAt: '2024-01-20',
    organizationId: '1'
  },
  {
    id: '3',
    name: 'Produto',
    description: 'Equipe de gestão de produto',
    peopleCount: 3,
    createdAt: '2024-02-01',
    organizationId: '1'
  },
  {
    id: '4',
    name: 'Comercial',
    description: 'Equipe comercial e vendas',
    peopleCount: 5,
    createdAt: '2024-02-10',
    organizationId: '1'
  }
];

export const mockLicenses: License[] = [
  {
    id: '1',
    name: 'Microsoft Office 365',
    description: 'Suite de produtividade Microsoft',
    expirationDate: '2024-12-31',
    totalQuantity: 50,
    usedQuantity: 35,
    cost: 15000,
    vendor: 'Microsoft',
    status: 'active',
    assignedTo: ['1', '2', '3'],
    organizationId: '1'
  },
  {
    id: '2',
    name: 'JetBrains IntelliJ IDEA',
    description: 'IDE para desenvolvimento Java',
    expirationDate: '2024-08-15',
    totalQuantity: 10,
    usedQuantity: 8,
    cost: 5000,
    vendor: 'JetBrains',
    status: 'expiring_soon',
    assignedTo: ['1', '4'],
    organizationId: '1'
  },
  {
    id: '3',
    name: 'Adobe Creative Suite',
    description: 'Suite de design Adobe',
    expirationDate: '2024-06-01',
    totalQuantity: 5,
    usedQuantity: 3,
    cost: 8000,
    vendor: 'Adobe',
    status: 'expired',
    assignedTo: ['5'],
    organizationId: '1'
  }
];

export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    type: 'notebook',
    serialNumber: 'MBP001',
    value: 12000,
    purchaseDate: '2024-01-15',
    status: 'available',
    assignedTo: '1',
    assignedToName: 'João Silva',
    condition: 'good',
    notes: 'Equipamento principal de desenvolvimento',
    organizationId: '1'
  },
  {
    id: '2',
    name: 'Dell XPS 13',
    type: 'notebook',
    serialNumber: 'DXS002',
    value: 8000,
    purchaseDate: '2024-02-01',
    status: 'available',
    condition: 'new',
    organizationId: '1'
  },
  {
    id: '3',
    name: 'Monitor LG 27"',
    type: 'monitor',
    serialNumber: 'LG27001',
    value: 1500,
    purchaseDate: '2024-01-20',
    status: 'available',
    assignedTo: '2',
    assignedToName: 'Maria Santos',
    condition: 'good',
    organizationId: '1'
  },
  {
    id: '4',
    name: 'Adaptador USB-C',
    type: 'adapter',
    serialNumber: 'ADP001',
    value: 200,
    purchaseDate: '2024-03-01',
    status: 'available',
    condition: 'new',
    organizationId: '1'
  }
];

export const mockPeople: Person[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    teamId: '1',
    teamName: 'Desenvolvimento',
    entryDate: '2024-01-15',
    position: 'Desenvolvedor Senior',
    status: 'active',
    licenses: [mockLicenses[0], mockLicenses[1]],
    assets: [mockAssets[0]],
    responsibilityTermUrl: '/terms/joao-silva.pdf',
    organizationId: '1'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    teamId: '2',
    teamName: 'Infraestrutura',
    entryDate: '2024-02-01',
    position: 'DevOps Engineer',
    status: 'active',
    licenses: [mockLicenses[0]],
    assets: [mockAssets[2]],
    responsibilityTermUrl: '/terms/maria-santos.pdf',
    organizationId: '1'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@empresa.com',
    teamId: '3',
    teamName: 'Produto',
    entryDate: '2024-03-01',
    position: 'Product Manager',
    status: 'active',
    licenses: [mockLicenses[0]],
    assets: [],
    organizationId: '1'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@empresa.com',
    teamId: '1',
    teamName: 'Desenvolvimento',
    entryDate: '2024-01-20',
    exitDate: '2024-05-15',
    position: 'Desenvolvedora Frontend',
    status: 'inactive',
    licenses: [],
    assets: [],
    organizationId: '1'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalPeople: 20,
  activePeople: 18,
  totalLicenses: 15,
  expiringLicenses: 3,
  totalAssets: 45,
  availableAssets: 12,
  totalTeams: 4
};
