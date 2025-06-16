
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Team } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
  organizationId: string;
  onSuccess: () => void;
}

export const TeamDialog = ({ open, onOpenChange, team, organizationId, onSuccess }: TeamDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (team) {
        // Update team
        const { teamsService } = await import('@/services/teamsService');
        teamsService.update(team.id, data);
        toast({
          title: 'Time atualizado!',
          description: 'As informações do time foram atualizadas com sucesso.',
        });
      } else {
        // Create team - garantir que name está definido
        const { teamsService } = await import('@/services/teamsService');
        teamsService.create({
          name: data.name, // garantir que name está definido
          description: data.description,
          organizationId,
        });
        toast({
          title: 'Time criado!',
          description: 'O novo time foi criado com sucesso.',
        });
      }
      
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Ocorreu um erro ao salvar o time.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {team ? 'Editar Time' : 'Novo Time'}
          </DialogTitle>
          <DialogDescription>
            {team ? 'Edite as informações do time.' : 'Crie um novo time para sua organização.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite uma descrição para o time"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : team ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
