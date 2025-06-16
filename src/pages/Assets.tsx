import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Asset, Person } from '@/types';
import { assetsService } from '@/services/assetsService';
import { peopleService } from '@/services/peopleService';
import { Laptop, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

export const Assets = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    type: '',
    status: 'available',
    condition: 'good',
    value: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });

  const loadData = async () => {
    if (!currentOrganization) {
      setAssets([]);
      setPeople([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const assetsData = await assetsService.getAll(currentOrganization.id);
      const peopleData = await peopleService.getAll(currentOrganization.id);
      setAssets(assetsData);
      setPeople(peopleData);
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentOrganization]);

  const handleSubmit = () => {
    if (!currentOrganization) {
      toast({
        title: 'Erro!',
        description: 'Selecione uma organização primeiro.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name.trim() || !formData.serialNumber.trim() || !formData.type || !formData.value) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingAsset) {
        assetsService.update(editingAsset.id, {
          name: formData.name,
          serialNumber: formData.serialNumber,
          type: formData.type as Asset['type'],
          status: formData.status as Asset['status'],
          condition: formData.condition as Asset['condition'],
          value: parseFloat(formData.value),
          purchaseDate: formData.purchaseDate,
          assignedTo: formData.assignedTo || undefined,
        });
        toast({
          title: 'Ativo atualizado!',
          description: 'O ativo foi atualizado com sucesso.',
        });
      } else {
        assetsService.create({
          name: formData.name,
          serialNumber: formData.serialNumber,
          type: formData.type as Asset['type'],
          status: formData.status as Asset['status'],
          condition: formData.condition as Asset['condition'],
          value: parseFloat(formData.value),
          purchaseDate: formData.purchaseDate,
          organizationId: currentOrganization.id,
          assignedTo: formData.assignedTo || undefined,
        });
        toast({
          title: 'Ativo criado!',
          description: 'O ativo foi criado com sucesso.',
        });
      }

      setFormData({ 
        name: '', 
        serialNumber: '', 
        type: '', 
        status: 'available', 
        condition: 'good',
        value: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        assignedTo: '' 
      });
      setEditingAsset(null);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível salvar o ativo.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      serialNumber: asset.serialNumber,
      type: asset.type,
      status: asset.status,
      condition: asset.condition,
      value: asset.value.toString(),
      purchaseDate: asset.purchaseDate,
      assignedTo: asset.assignedTo || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (asset: Asset) => {
    try {
      assetsService.delete(asset.id);
      toast({
        title: 'Ativo excluído!',
        description: 'O ativo foi excluído com sucesso.',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível excluir o ativo.',
        variant: 'destructive',
      });
    }
  };

  const handleAddNew = () => {
    if (!currentOrganization) {
      toast({
        title: 'Erro!',
        description: 'Selecione uma organização primeiro.',
        variant: 'destructive',
      });
      return;
    }
    setEditingAsset(null);
    setFormData({ name: '', serialNumber: '', type: '', status: 'available', condition: 'good', value: '', purchaseDate: new Date().toISOString().split('T')[0], assignedTo: '' });
    setDialogOpen(true);
  };

  const getAssetStatus = (asset: Asset) => {
    if (asset.assignedTo) {
      return 'allocated';
    }
    return asset.status;
  };

  const getAssetStatusLabel = (asset: Asset) => {
    const status = getAssetStatus(asset);
    switch (status) {
      case 'allocated':
        return 'Alocado';
      case 'available':
        return 'Disponível';
      case 'maintenance':
        return 'Manutenção';
      case 'retired':
        return 'Aposentado';
      default:
        return 'Disponível';
    }
  };

  const getAssetStatusVariant = (asset: Asset) => {
    const status = getAssetStatus(asset);
    switch (status) {
      case 'allocated':
        return 'secondary';
      case 'available':
        return 'default';
      case 'maintenance':
        return 'destructive';
      case 'retired':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Nenhuma organização selecionada</h2>
        <p className="text-muted-foreground">
          Selecione uma organização para gerenciar os ativos.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando ativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ativos</h1>
          <p className="text-muted-foreground">
            Gerencie os ativos da organização: {currentOrganization.name}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Ativo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do ativo"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Número de Série *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Número de série"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="adapter">Adaptador</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="retired">Aposentado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condição</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nova</SelectItem>
                    <SelectItem value="good">Boa</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="assignedTo">Atribuído para</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingAsset ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Laptop className="w-5 h-5" />
            <span>Lista de Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8">
              <Laptop className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum ativo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro ativo da organização.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Ativo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número de Série</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Atribuído a</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.serialNumber}</TableCell>
                    <TableCell className="capitalize">{asset.type}</TableCell>
                    <TableCell>R$ {asset.value.toFixed(2)}</TableCell>
                    <TableCell>{asset.assignedToName || <span className="text-muted-foreground">Não atribuído</span>}</TableCell>
                    <TableCell>
                      <Badge variant={getAssetStatusVariant(asset)}>
                        {getAssetStatusLabel(asset)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(asset)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o ativo "{asset.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(asset)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{assets.length}</p>
                <p className="text-sm text-muted-foreground">Total de Ativos</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">
                  {assets.filter(a => !a.assignedTo && a.status === 'available').length}
                </p>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-600">
                  {assets.filter(a => a.assignedTo).length}
                </p>
                <p className="text-sm text-muted-foreground">Alocados</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-orange-600">
                  R$ {assets.reduce((acc, asset) => acc + asset.value, 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
