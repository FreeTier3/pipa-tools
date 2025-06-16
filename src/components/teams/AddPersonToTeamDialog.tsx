
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Person } from '@/types';
import { useToast } from '@/hooks/use-toast';

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

interface AddPersonToTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  organizationId: string;
  onSuccess: () => void;
}

export const AddPersonToTeamDialog = ({ 
  open, 
  onOpenChange, 
  teamId, 
  organizationId, 
  onSuccess 
}: AddPersonToTeamDialogProps) => {
  const { toast } = useToast();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAvailablePeople = () => {
    const people = getTableData('people');
    const availablePersons = people
      .filter(person => 
        person.organization_id === organizationId && 
        person.status === 'active' &&
        !person.team_id // Pessoas sem time
      )
      .map(person => ({
        id: person.id,
        name: person.name,
        email: person.email,
        position: person.position,
        status: person.status,
        organizationId: person.organization_id,
        teamId: person.team_id,
        teamName: undefined,
        entryDate: person.created_at || new Date().toISOString(),
        licenses: [],
        assets: []
      }));
    
    setAvailablePeople(availablePersons);
  };

  useEffect(() => {
    if (open) {
      loadAvailablePeople();
      setSelectedPersonId('');
    }
  }, [open, organizationId]);

  const handleSubmit = async () => {
    if (!selectedPersonId) {
      toast({
        title: 'Erro!',
        description: 'Selecione uma pessoa.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const people = getTableData('people');
      const personIndex = people.findIndex(p => p.id === selectedPersonId);
      
      if (personIndex !== -1) {
        people[personIndex].team_id = teamId;
        people[personIndex].updated_at = new Date().toISOString();
        saveTableData('people', people);
        
        toast({
          title: 'Sucesso!',
          description: 'Pessoa adicionada ao time com sucesso.',
        });
        
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível adicionar a pessoa ao time.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Pessoa ao Time</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="person">Pessoa *</Label>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pessoa" />
              </SelectTrigger>
              <SelectContent>
                {availablePeople.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} - {person.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availablePeople.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Nenhuma pessoa disponível (sem time) encontrada.
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedPersonId}
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
