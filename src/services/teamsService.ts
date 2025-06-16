
import { Team } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/database';

export interface CreateTeamData {
  name: string;
  description?: string;
  organizationId: string;
  managerId?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  managerId?: string;
}

export const teamsService = {
  getAll: async (organizationId: string): Promise<Team[]> => {
    const teams = await db.getTableData('teams');
    const people = await db.getTableData('people');
    
    return teams
      .filter(team => team.organization_id === organizationId)
      .map(team => {
        const peopleCount = people.filter(person => 
          person.team_id === team.id && person.status === 'active'
        ).length;
        
        return {
          id: team.id,
          name: team.name,
          description: team.description,
          organizationId: team.organization_id,
          peopleCount: peopleCount,
          createdAt: team.created_at,
          managerId: team.manager_id
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: async (id: string): Promise<Team | null> => {
    const teams = await db.getTableData('teams');
    const people = await db.getTableData('people');
    
    const team = teams.find(team => team.id === id);
    if (!team) return null;
    
    const peopleCount = people.filter(person => 
      person.team_id === team.id && person.status === 'active'
    ).length;
    
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      organizationId: team.organization_id,
      peopleCount: peopleCount,
      createdAt: team.created_at,
      managerId: team.manager_id
    };
  },

  create: async (data: CreateTeamData): Promise<Team> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const teams = await db.getTableData('teams');
    const newTeam = {
      id,
      name: data.name,
      description: data.description || null,
      organization_id: data.organizationId,
      manager_id: data.managerId || null,
      created_at: now,
      updated_at: now
    };
    
    teams.push(newTeam);
    await db.saveTableData('teams', teams);
    
    return {
      id,
      name: data.name,
      description: data.description,
      organizationId: data.organizationId,
      peopleCount: 0,
      createdAt: now,
      managerId: data.managerId
    };
  },

  update: async (id: string, data: UpdateTeamData): Promise<void> => {
    const teams = await db.getTableData('teams');
    const teamIndex = teams.findIndex(team => team.id === id);
    
    if (teamIndex === -1) return;
    
    const now = new Date().toISOString();
    const team = teams[teamIndex];
    
    if (data.name !== undefined) team.name = data.name;
    if (data.description !== undefined) team.description = data.description;
    if (data.managerId !== undefined) team.manager_id = data.managerId;
    team.updated_at = now;
    
    teams[teamIndex] = team;
    await db.saveTableData('teams', teams);
  },

  delete: async (id: string): Promise<void> => {
    // First, update people to remove team association
    const people = await db.getTableData('people');
    const updatedPeople = people.map(person => {
      if (person.team_id === id) {
        return { ...person, team_id: null };
      }
      return person;
    });
    await db.saveTableData('people', updatedPeople);
    
    // Then delete the team
    const teams = await db.getTableData('teams');
    const filteredTeams = teams.filter(team => team.id !== id);
    await db.saveTableData('teams', filteredTeams);
  },

  addPersonToTeam: async (teamId: string, personId: string): Promise<void> => {
    const people = await db.getTableData('people');
    const personIndex = people.findIndex(person => person.id === personId);
    
    if (personIndex !== -1) {
      people[personIndex].team_id = teamId;
      await db.saveTableData('people', people);
    }
  },

  removePersonFromTeam: async (personId: string): Promise<void> => {
    const people = await db.getTableData('people');
    const personIndex = people.findIndex(person => person.id === personId);
    
    if (personIndex !== -1) {
      people[personIndex].team_id = null;
      await db.saveTableData('people', people);
    }
  },

  getTeamMembers: async (teamId: string) => {
    const people = await db.getTableData('people');
    const teams = await db.getTableData('teams');
    
    return people
      .filter(person => person.team_id === teamId && person.status === 'active')
      .map(person => {
        const team = teams.find(team => team.id === person.team_id);
        return {
          ...person,
          teamName: team ? team.name : null
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }
};
