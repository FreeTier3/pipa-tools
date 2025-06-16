
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Organization, Team, Person, License, Asset } from '@/types';

interface AppContextType {
  // Current organization
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  
  // Organizations
  organizations: Organization[];
  setOrganizations: (orgs: Organization[]) => void;
  
  // Teams
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  
  // People
  people: Person[];
  setPeople: (people: Person[]) => void;
  
  // Licenses
  licenses: License[];
  setLicenses: (licenses: License[]) => void;
  
  // Assets
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Load initial data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('app_database');
    if (data) {
      const parsed = JSON.parse(data);
      setOrganizations(parsed.organizations || []);
      
      // Set current organization from localStorage or first available
      const currentOrgId = localStorage.getItem('current_organization_id');
      if (currentOrgId && parsed.organizations) {
        const org = parsed.organizations.find((o: Organization) => o.id === currentOrgId);
        if (org) {
          setCurrentOrganization(org);
        }
      } else if (parsed.organizations && parsed.organizations.length > 0) {
        setCurrentOrganization(parsed.organizations[0]);
      }
    }
  }, []);

  // Save current organization to localStorage when it changes
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('current_organization_id', currentOrganization.id);
    }
  }, [currentOrganization]);

  return (
    <AppContext.Provider value={{
      currentOrganization,
      setCurrentOrganization,
      organizations,
      setOrganizations,
      teams,
      setTeams,
      people,
      setPeople,
      licenses,
      setLicenses,
      assets,
      setAssets,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
