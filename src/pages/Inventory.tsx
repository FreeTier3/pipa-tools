import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { inventoryService, InventoryItem as ServiceInventoryItem } from '@/services/inventoryService';
import { InventoryItem } from '@/types';
import { Package, Plus, Edit, Trash2, Building2, PackagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

export const Inventory = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [items, setItems] = useState<ServiceInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceInventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unitPrice: '',
    supplier: '',
    location: '',
  });

  const loadData = async () => {
    if (!currentOrganization) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const itemsData = inventoryService.getAll(currentOrganization.id);
      setItems(itemsData);
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

    if (!formData.name.trim() || !formData.category.trim() || !formData.quantity || !formData.unitPrice) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingItem) {
        inventoryService.update(editingItem.id, {
          name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          supplier: formData.supplier,
          location: formData.location,
        });
        toast({
          title: 'Item atualizado!',
          description: 'O item foi atualizado com sucesso.',
        });
      } else {
        inventoryService.create({
          name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          supplier: formData.supplier,
          location: formData.location,
          organizationId: currentOrganization.id,
        });
        toast({
          title: 'Item criado!',
          description: 'O item foi criado com sucesso.',
        });
      }

      setFormData({ name: '', category: '', quantity: '', unitPrice: '', supplier: '', location: '' });
      setEditingItem(null);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível salvar o item.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: ServiceInventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier,
      location: item.location,
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: ServiceInventoryItem) => {
    if (confirm(`Tem certeza que deseja excluir "${item.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        inventoryService.delete(item.id);
        toast({
          title: 'Item excluído!',
          description: 'O item foi excluído com sucesso.',
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Erro!',
          description: 'Não foi possível excluir o item.',
          variant: 'destructive',
        });
      }
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
    setEditingItem(null);
    setFormData({ name: '', category: '', quantity: '', unitPrice: '', supplier: '', location: '' });
    setDialogOpen(true);
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Nenhuma organização selecionada</h2>
        <p className="text-muted-foreground">
          Selecione uma organização para gerenciar o estoque.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie os itens de estoque da organização: {currentOrganization.name}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do item"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="license">Licença</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Quantidade"
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Preço Unitário *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Preço Unitário"
                />
              </div>
              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Fornecedor do item"
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Localização do item"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PackagePlus className="w-5 h-5" />
            <span>Lista de Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <PackagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum item no estoque</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro item ao estoque da organização.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier || <span className="text-muted-foreground">Não especificado</span>}</TableCell>
                    <TableCell>{item.location || <span className="text-muted-foreground">Não especificado</span>}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Quantidade Total</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-600">
                  R$ {items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total do Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
