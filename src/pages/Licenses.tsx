import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ManageLicenseDialog } from '@/components/licenses/ManageLicenseDialog';
import { licensesService, CreateLicenseData, UpdateLicenseData } from '@/services/licensesService';
import { useApp } from '@/contexts/AppContext';
import { License } from '@/types';
import { 
  Shield, 
  Plus, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export const Licenses = () => {
  const { currentOrganization } = useApp();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [managingLicense, setManagingLicense] = useState<License | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expirationDate: '',
    totalQuantity: '',
    cost: '',
    vendor: '',
  });

  // Load licenses when organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadLicenses();
    }
  }, [currentOrganization]);

  const loadLicenses = () => {
    if (!currentOrganization) return;
    const licenseData = licensesService.getAll(currentOrganization.id);
    setLicenses(licenseData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      expirationDate: '',
      totalQuantity: '',
      cost: '',
      vendor: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.expirationDate || !formData.totalQuantity) {
      toast.error('Nome, data de vencimento e quantidade total são obrigatórios');
      return;
    }

    if (!currentOrganization) {
      toast.error('Selecione uma organização primeiro');
      return;
    }

    if (editingLicense) {
      // Edit license
      const updateData: UpdateLicenseData = {
        name: formData.name,
        description: formData.description,
        expirationDate: formData.expirationDate,
        totalQuantity: parseInt(formData.totalQuantity),
        cost: parseFloat(formData.cost) || undefined,
        vendor: formData.vendor,
      };
      
      licensesService.update(editingLicense.id, updateData);
      toast.success('Licença atualizada com sucesso!');
    } else {
      // Create new license
      const createData: CreateLicenseData = {
        name: formData.name,
        description: formData.description,
        expirationDate: formData.expirationDate,
        totalQuantity: parseInt(formData.totalQuantity),
        cost: parseFloat(formData.cost) || undefined,
        vendor: formData.vendor,
        organizationId: currentOrganization.id,
      };
      
      licensesService.create(createData);
      toast.success('Licença criada com sucesso!');
    }

    loadLicenses();
    resetForm();
    setEditingLicense(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setFormData({
      name: license.name,
      description: license.description || '',
      expirationDate: license.expirationDate,
      totalQuantity: license.totalQuantity.toString(),
      cost: license.cost?.toString() || '',
      vendor: license.vendor || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (licenseId: string) => {
    licensesService.delete(licenseId);
    loadLicenses();
    toast.success('Licença excluída com sucesso!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expiring_soon':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'expiring_soon':
        return 'Vencendo';
      case 'expired':
        return 'Vencida';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expiring_soon':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selecione uma organização</h3>
        <p className="text-muted-foreground">
          Você precisa selecionar uma organização para gerenciar licenças.
        </p>
      </div>
    );
  }

  const activeLicenses = licenses.filter(l => l.status === 'active');
  const expiringLicenses = licenses.filter(l => l.status === 'expiring_soon');
  const expiredLicenses = licenses.filter(l => l.status === 'expired');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Licenças</h1>
          <p className="text-muted-foreground">Gerencie as licenças de software da empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                setEditingLicense(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4" />
              Nova Licença
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLicense ? 'Editar Licença' : 'Nova Licença'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da licença"
                />
              </div>
              <div>
                <Label htmlFor="vendor">Fornecedor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <Label htmlFor="expirationDate">Data de Vencimento *</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="totalQuantity">Quantidade Total *</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                  placeholder="Número de licenças"
                />
              </div>
              <div>
                <Label htmlFor="cost">Valor (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da licença"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingLicense ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeLicenses.length}</p>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringLicenses.length}</p>
                <p className="text-sm text-muted-foreground">Vencendo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredLicenses.length}</p>
                <p className="text-sm text-muted-foreground">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  R$ {licenses.reduce((acc, l) => acc + (l.cost || 0), 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Licenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {licenses.map((license) => {
          const usagePercentage = (license.usedQuantity / license.totalQuantity) * 100;
          const costPerUser = license.cost && license.totalQuantity > 0 ? license.cost / license.totalQuantity : 0;
          
          return (
            <Card key={license.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{license.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{license.vendor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(license.status)}
                    <Badge variant={getStatusVariant(license.status)}>
                      {getStatusText(license.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {license.description && (
                    <p className="text-sm text-muted-foreground">{license.description}</p>
                  )}

                  {/* Usage Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso das Licenças</span>
                      <span>{license.usedQuantity}/{license.totalQuantity}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Vencimento</span>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(license.expirationDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Valor/Usuário</span>
                      </div>
                      <p className="text-sm font-medium">
                        R$ {costPerUser.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Users */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Usuários Atribuídos</span>
                    </div>
                    <p className="text-sm">{license.assignedTo.length} pessoas</p>
                  </div>

                  <div className="flex space-x-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(license)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setManagingLicense(license)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Gerenciar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a licença "{license.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(license.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {licenses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma licença encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando sua primeira licença de software.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Licença
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manage License Dialog */}
      {managingLicense && (
        <ManageLicenseDialog
          license={managingLicense}
          open={!!managingLicense}
          onOpenChange={(open) => !open && setManagingLicense(null)}
          onUpdate={loadLicenses}
        />
      )}
    </div>
  );
};
