import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { peopleService } from '@/services/peopleService';
import { teamsService } from '@/services/teamsService';
import { assetsService } from '@/services/assetsService';
import { Person, Team, Asset } from '@/types';

interface PersonDetailsProps {
  person?: Person;
}

export const PersonDetails = () => {
  const { personId } = useParams();
  const id = personId as string;
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [person, setPerson] = useState<Person | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization || !id) return;
      
      try {
        setLoading(true);
        const [peopleData, teamsData, assetsData] = await Promise.all([
          peopleService.getAll(currentOrganization.id),
          teamsService.getAll(currentOrganization.id),
          assetsService.getAll(currentOrganization.id)
        ]);
        
        const foundPerson = peopleData.find(p => p.id === id);
        if (foundPerson) {
          setPerson(foundPerson);
          const foundTeam = teamsData.find(t => t.id === foundPerson.teamId);
          if (foundTeam) {
            setTeam(foundTeam);
          }
        }
        
        setTeams(teamsData);
        const personAssets = assetsData.filter(asset => asset.assignedTo === id);
        setAssets(personAssets);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados da pessoa',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentOrganization, id, toast]);

  if (loading) {
    return <div className="text-center">Carregando detalhes da pessoa...</div>;
  }

  if (!person) {
    return <div className="text-center">Pessoa não encontrada.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Detalhes da Pessoa</h1>
        <p className="text-muted-foreground">Informações detalhadas sobre {person.name}</p>
      </div>

      {/* Person Details */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={person.avatar} />
              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{person.name}</p>
              <p className="text-sm text-muted-foreground">{person.position || 'Cargo não especificado'}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">Email:</span>
            <p className="text-muted-foreground">{person.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Telefone:</span>
            <p className="text-muted-foreground">{person.phone || 'Não especificado'}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Data de Admissão:</span>
            <p className="text-muted-foreground">
              {person.entryDate ? new Date(person.entryDate).toLocaleDateString('pt-BR') : 'Não especificada'}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={person.status === 'active' ? 'secondary' : 'destructive'}>
              {person.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          {team && (
            <div>
              <span className="text-sm font-medium">Time:</span>
              <p className="text-muted-foreground">{team.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assets Assigned */}
      <Card>
        <CardHeader>
          <CardTitle>Ativos Atribuídos</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.serialNumber}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={asset.status === 'available' ? 'secondary' : 'default'}>
                        {asset.status === 'available' ? 'Disponível' : 
                         asset.status === 'maintenance' ? 'Manutenção' : 
                         asset.status === 'retired' ? 'Aposentado' : asset.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        R$ {asset.value?.toLocaleString('pt-BR') || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum ativo atribuído</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
