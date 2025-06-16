
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Shield, 
  Laptop, 
  Building2, 
  AlertTriangle,
  TrendingUp,
  Package,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { peopleService } from '@/services/peopleService';
import { licensesService } from '@/services/licensesService';
import { assetsService } from '@/services/assetsService';
import { Person, License, Asset } from '@/types';

interface DashboardStats {
  totalPeople: number;
  activePeople: number;
  totalLicenses: number;
  expiringLicenses: number;
  totalAssets: number;
  availableAssets: number;
  totalTeams: number;
}

export const Dashboard = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [stats, setStats] = useState<DashboardStats>({
    totalPeople: 0,
    activePeople: 0,
    totalLicenses: 0,
    expiringLicenses: 0,
    totalAssets: 0,
    availableAssets: 0,
    totalTeams: 0
  });
  const [expiringLicenses, setExpiringLicenses] = useState<License[]>([]);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [recentPeople, setRecentPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (!currentOrganization) return;

    const loadDashboardData = async () => {
      try {
        // Aguardar dados reais dos serviços
        const people = await peopleService.getAll(currentOrganization.id);
        const licenses = await licensesService.getAll(currentOrganization.id);
        const assets = await assetsService.getAll(currentOrganization.id);
        
        // Buscar times do localStorage
        const data = localStorage.getItem('app_database');
        const teams = data ? JSON.parse(data).teams?.filter((t: any) => t.organization_id === currentOrganization.id) || [] : [];

        // Calcular estatísticas
        const activePeople = people.filter(p => p.status === 'active');
        const expiring = licenses.filter(license => {
          return license.status === 'expired' || license.status === 'expiring_soon';
        });
        const availableAssets = assets.filter(a => a.status === 'available');

        setStats({
          totalPeople: people.length,
          activePeople: activePeople.length,
          totalLicenses: licenses.length,
          expiringLicenses: expiring.length,
          totalAssets: assets.length,
          availableAssets: availableAssets.length,
          totalTeams: teams.length
        });

        // Definir dados recentes (ordenar por data de criação)
        const sortedPeople = [...activePeople].sort((a, b) => 
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        );
        
        const sortedAssets = [...assets].sort((a, b) => 
          new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        );

        setExpiringLicenses(expiring.slice(0, 5));
        setRecentAssets(sortedAssets.slice(0, 5));
        setRecentPeople(sortedPeople.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do dashboard',
          variant: 'destructive'
        });
      }
    };

    loadDashboardData();
  }, [currentOrganization, toast]);

  const handleQuickAction = (action: string) => {
    // Navigate to respective pages
    switch (action) {
      case 'Nova Pessoa':
        window.location.href = '/people';
        break;
      case 'Nova Licença':
        window.location.href = '/licenses';
        break;
      case 'Novo Ativo':
        window.location.href = '/assets';
        break;
      case 'Novo Time':
        window.location.href = '/teams';
        break;
      default:
        toast({
          title: 'Redirecionando...',
          description: `Abrindo página para ${action}.`,
        });
    }
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Selecione uma organização para ver o dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de gestão - {currentOrganization.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pessoas"
          value={stats.totalPeople}
          subtitle={`${stats.activePeople} ativas`}
          icon={Users}
          color="blue"
          trend="up"
          trendValue={`${stats.activePeople}/${stats.totalPeople} ativas`}
        />
        
        <StatCard
          title="Licenças"
          value={stats.totalLicenses}
          subtitle={`${stats.expiringLicenses} com atenção`}
          icon={Shield}
          color="green"
          trend={stats.expiringLicenses > 0 ? "down" : "stable"}
          trendValue={stats.expiringLicenses > 0 ? `${stats.expiringLicenses} vencendo` : "Sem alertas"}
        />
        
        <StatCard
          title="Ativos"
          value={stats.totalAssets}
          subtitle={`${stats.availableAssets} disponíveis`}
          icon={Laptop}
          color="purple"
          trend="up"
          trendValue={`${stats.availableAssets} livres`}
        />
        
        <StatCard
          title="Times"
          value={stats.totalTeams}
          subtitle="Departamentos"
          icon={Building2}
          color="orange"
          trend="stable"
          trendValue="Ativos"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent People */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Pessoas Ativas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPeople.length > 0 ? (
                recentPeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.teamName || 'Sem time'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{person.position || 'Sem cargo'}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.entryDate ? new Date(person.entryDate).toLocaleDateString('pt-BR') : 'Data não informada'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma pessoa encontrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Licenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Licenças com Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringLicenses.length > 0 ? (
                expiringLicenses.map((license) => (
                  <div key={license.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{license.name}</p>
                      <p className="text-sm text-muted-foreground">{license.vendor || 'Sem fornecedor'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={license.status === 'expired' ? 'destructive' : 'secondary'}>
                        {license.status === 'expired' ? 'Vencida' : 'Vencendo'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(license.expirationDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma licença requer atenção</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              Ativos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssets.length > 0 ? (
                recentAssets.map((asset) => (
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
                <p className="text-muted-foreground text-center py-4">Nenhum ativo encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Nova Pessoa')}
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Nova Pessoa</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Nova Licença')}
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Nova Licença</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Novo Ativo')}
              >
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Laptop className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Novo Ativo</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Novo Time')}
              >
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Building2 className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Novo Time</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
