
import { useState } from 'react';
import { Building, Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { Organization } from '@/types';
import { toast } from 'sonner';

export const Organizations = () => {
  const { organizations, setOrganizations, currentOrganization, setCurrentOrganization } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da organização é obrigatório');
      return;
    }

    if (editingOrg) {
      // Edit organization
      const updatedOrg = {
        ...editingOrg,
        name: formData.name,
        description: formData.description,
      };
      
      setOrganizations(organizations.map(org => 
        org.id === editingOrg.id ? updatedOrg : org
      ));
      
      if (currentOrganization?.id === editingOrg.id) {
        setCurrentOrganization(updatedOrg);
      }
      
      toast.success('Organização atualizada com sucesso!');
    } else {
      // Create new organization
      const newOrg: Organization = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        createdAt: new Date().toISOString(),
      };
      
      setOrganizations([...organizations, newOrg]);
      
      if (!currentOrganization) {
        setCurrentOrganization(newOrg);
      }
      
      toast.success('Organização criada com sucesso!');
    }

    setFormData({ name: '', description: '' });
    setEditingOrg(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (orgId: string) => {
    if (organizations.length === 1) {
      toast.error('Não é possível excluir a única organização');
      return;
    }

    const orgToDelete = organizations.find(org => org.id === orgId);
    if (currentOrganization?.id === orgId) {
      const remainingOrgs = organizations.filter(org => org.id !== orgId);
      setCurrentOrganization(remainingOrgs[0] || null);
    }
    
    setOrganizations(organizations.filter(org => org.id !== orgId));
    toast.success(`Organização "${orgToDelete?.name}" excluída com sucesso!`);
  };

  const selectOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    toast.success(`Organização "${org.name}" selecionada`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizações</h1>
          <p className="text-muted-foreground">Gerencie suas organizações</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gradient-bg hover:opacity-90 transition-opacity"
              onClick={() => {
                setEditingOrg(null);
                setFormData({ name: '', description: '' });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingOrg ? 'Editar Organização' : 'Nova Organização'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da organização"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da organização"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingOrg ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card 
            key={org.id} 
            className={`card-hover ${currentOrganization?.id === org.id ? 'ring-2 ring-primary shadow-lg' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                {org.name}
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(org)}
                  className="h-8 w-8"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Organização</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a organização "{org.name}"? 
                        Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(org.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {org.description || 'Sem descrição'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {/* Aqui você pode adicionar contagem de membros */}
                  0 membros
                </div>
                
                {currentOrganization?.id === org.id ? (
                  <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                    Ativa
                  </span>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectOrganization(org)}
                  >
                    Selecionar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma organização encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando sua primeira organização para gerenciar recursos.
          </p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="gradient-bg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Organização
          </Button>
        </div>
      )}
    </div>
  );
};
