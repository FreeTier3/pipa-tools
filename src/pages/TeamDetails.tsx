import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Shell } from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { teamsService } from '@/services/teamsService';
import { peopleService } from '@/services/peopleService';
import { Team, Person } from '@/types';

interface TeamDetailsProps {
  // You can define props here if needed
}

export const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization || !id) return;
      
      try {
        setLoading(true);
        const [teamsData, peopleData] = await Promise.all([
          teamsService.getAll(currentOrganization.id),
          peopleService.getAll(currentOrganization.id)
        ]);
        
        const foundTeam = teamsData.find(t => t.id === id);
        if (foundTeam) {
          setTeam(foundTeam);
        }
        
        const teamMembers = peopleData.filter(person => person.teamId === id);
        setMembers(teamMembers);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do time',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentOrganization, id, toast]);

  if (loading) {
    return <div className="text-center p-6">Carregando detalhes do time...</div>;
  }

  if (!team) {
    return <div className="text-center p-6">Time não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {team.name}
        </h1>
        <p className="text-muted-foreground">
          Detalhes e membros do time.
        </p>
      </div>

      {/* Team Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {team.name}</p>
            <p><strong>Descrição:</strong> {team.description || 'Nenhuma descrição fornecida.'}</p>
            {/* Add more team details here as needed */}
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membros do Time</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] w-full">
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.position || 'Cargo não especificado'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
              ))}
              {members.length === 0 && (
                <div className="text-center p-6">Nenhum membro neste time.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
