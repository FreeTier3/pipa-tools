
import { Person } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface CreatePersonData {
  name: string;
  email: string;
  position: string;
  organizationId: string;
  teamId?: string;
  managerId?: string;
  subordinates?: string[];
}

export interface UpdatePersonData {
  name?: string;
  email?: string;
  position?: string;
  teamId?: string;
  status?: Person['status'];
  managerId?: string;
  subordinates?: string[];
}

// Helper para acessar dados do localStorage
const getTableData = (tableName: string): any[] => {
  const data = localStorage.getItem('app_database');
  if (!data) return [];
  const parsed = JSON.parse(data);
  return parsed[tableName] || [];
};

const saveTableData = (tableName: string, tableData: any[]): void => {
  const data = localStorage.getItem('app_database');
  const parsed = data ? JSON.parse(data) : {};
  parsed[tableName] = tableData;
  localStorage.setItem('app_database', JSON.stringify(parsed));
};

export const peopleService = {
  getAll: (organizationId: string): Person[] => {
    const people = getTableData('people');
    const teams = getTableData('teams');
    const assets = getTableData('assets');
    const licenses = getTableData('licenses');
    
    return people
      .filter(person => person.organization_id === organizationId)
      .map(person => {
        const team = person.team_id ? teams.find(t => t.id === person.team_id) : null;
        
        // Buscar ativos atribuídos a esta pessoa
        const personAssets = assets.filter(asset => asset.assigned_to === person.id);
        
        // Buscar licenças atribuídas a esta pessoa
        const personLicenses = licenses.filter(license => {
          const assignedTo = license.assigned_to ? JSON.parse(license.assigned_to) : [];
          return assignedTo.includes(person.id);
        }).map(license => ({
          id: license.id,
          name: license.name,
          description: license.description,
          expirationDate: license.expiration_date,
          totalQuantity: license.total_quantity,
          usedQuantity: license.used_quantity || 0,
          cost: license.cost,
          vendor: license.vendor,
          status: license.status,
          assignedTo: JSON.parse(license.assigned_to || '[]'),
          organizationId: license.organization_id
        }));
        
        return {
          id: person.id,
          name: person.name,
          email: person.email,
          position: person.position,
          status: person.status || 'active',
          organizationId: person.organization_id,
          teamId: person.team_id || '',
          teamName: team?.name || '',
          entryDate: person.created_at || new Date().toISOString(),
          managerId: person.manager_id,
          subordinates: person.subordinates || [],
          licenses: personLicenses,
          assets: personAssets.map(asset => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            serialNumber: asset.serial_number,
            value: parseFloat(asset.value) || 0,
            purchaseDate: asset.purchase_date,
            status: asset.status,
            assignedTo: asset.assigned_to,
            assignedToName: person.name,
            condition: asset.condition,
            notes: asset.notes,
            organizationId: asset.organization_id
          }))
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: (id: string): Person | null => {
    const people = getTableData('people');
    const teams = getTableData('teams');
    const person = people.find(p => p.id === id);
    
    if (!person) return null;
    
    const team = person.team_id ? teams.find(t => t.id === person.team_id) : null;
    
    return {
      id: person.id,
      name: person.name,
      email: person.email,
      position: person.position,
      status: person.status || 'active',
      organizationId: person.organization_id,
      teamId: person.team_id || '',
      teamName: team?.name || '',
      entryDate: person.created_at || new Date().toISOString(),
      managerId: person.manager_id,
      subordinates: person.subordinates || [],
      licenses: [],
      assets: []
    };
  },

  create: (data: CreatePersonData): Person => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const people = getTableData('people');
    const teams = getTableData('teams');
    
    const team = data.teamId ? teams.find(t => t.id === data.teamId) : null;
    
    const newPerson = {
      id,
      name: data.name,
      email: data.email,
      position: data.position,
      status: 'active',
      organization_id: data.organizationId,
      team_id: data.teamId || null,
      manager_id: data.managerId || null,
      subordinates: data.subordinates || [],
      created_at: now,
      updated_at: now
    };
    
    people.push(newPerson);
    saveTableData('people', people);
    
    return {
      id,
      name: data.name,
      email: data.email,
      position: data.position,
      status: 'active',
      organizationId: data.organizationId,
      teamId: data.teamId || '',
      teamName: team?.name || '',
      entryDate: now,
      managerId: data.managerId,
      subordinates: data.subordinates || [],
      licenses: [],
      assets: []
    };
  },

  update: (id: string, data: UpdatePersonData): void => {
    const people = getTableData('people');
    const personIndex = people.findIndex(p => p.id === id);
    
    if (personIndex === -1) return;
    
    const now = new Date().toISOString();
    const person = people[personIndex];
    
    if (data.name !== undefined) person.name = data.name;
    if (data.email !== undefined) person.email = data.email;
    if (data.position !== undefined) person.position = data.position;
    if (data.teamId !== undefined) person.team_id = data.teamId;
    if (data.status !== undefined) person.status = data.status;
    if (data.managerId !== undefined) person.manager_id = data.managerId;
    if (data.subordinates !== undefined) person.subordinates = data.subordinates;
    person.updated_at = now;
    
    people[personIndex] = person;
    saveTableData('people', people);
  },

  delete: (id: string): void => {
    const people = getTableData('people');
    const filteredPeople = people.filter(p => p.id !== id);
    saveTableData('people', filteredPeople);
  }
};
