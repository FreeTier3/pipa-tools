
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { configService, DatabaseExport } from '@/services/configService';
import { 
  Settings as SettingsIcon, 
  Upload, 
  Download, 
  AlertTriangle, 
  Check,
  RefreshCw,
  Trash2,
  FileJson
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Settings = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = configService.exportDatabase();
      const filename = `sistema-gestao-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      configService.downloadJsonFile(exportData, filename);
      toast({
        title: 'Exportação realizada!',
        description: 'Os dados foram exportados com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro!',
        description: 'Erro ao exportar dados.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      const importData = await configService.parseJsonFile(file);
      
      // Validar se é um export válido
      if (!importData.organizations || !importData.version) {
        throw new Error('Arquivo não é um backup válido do sistema');
      }

      const success = configService.importDatabase(importData);
      
      if (success) {
        setImportStatus({
          type: 'success',
          message: `Dados importados com sucesso! Backup de ${new Date(importData.exportDate).toLocaleString('pt-BR')}`
        });
        toast({
          title: 'Importação realizada!',
          description: 'Os dados foram importados com sucesso.',
        });
        
        // Recarregar a página após 2 segundos para atualizar todos os dados
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Falha ao processar os dados importados');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido ao importar dados'
      });
      toast({
        title: 'Erro!',
        description: 'Erro ao importar dados.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRestoreBackup = () => {
    try {
      const success = configService.restoreBackup();
      if (success) {
        toast({
          title: 'Backup restaurado!',
          description: 'O backup foi restaurado com sucesso.',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: 'Erro!',
          description: 'Nenhum backup encontrado.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast({
        title: 'Erro!',
        description: 'Erro ao restaurar backup.',
        variant: 'destructive',
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita. Um backup será criado automaticamente.')) {
      try {
        configService.clearAllData();
        toast({
          title: 'Dados limpos!',
          description: 'Todos os dados foram limpos com sucesso.',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        toast({
          title: 'Erro!',
          description: 'Erro ao limpar dados.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-readable-muted">Gerencie as configurações do sistema e dados</p>
        </div>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileJson className="w-5 h-5" />
            <span>Gerenciamento de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-readable">Exportar Dados</Label>
            <p className="text-sm text-readable-muted">
              Faça o download de todos os dados do sistema em formato JSON para backup.
            </p>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex items-center space-x-2"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isExporting ? 'Exportando...' : 'Exportar Dados'}</span>
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Import Section */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-readable">Importar Dados</Label>
              <p className="text-sm text-readable-muted">
                Importe dados de um arquivo JSON de backup. Todos os dados atuais serão substituídos.
              </p>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleImportClick} 
                  disabled={isImporting}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isImporting ? 'Importando...' : 'Selecionar Arquivo'}</span>
                </Button>
                
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Import Status */}
              {importStatus.type && (
                <Alert className={importStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center space-x-2">
                    {importStatus.type === 'success' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className={importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {importStatus.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Backup & Recovery */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-readable">Backup e Recuperação</Label>
              <p className="text-sm text-readable-muted">
                Restaure o último backup automático ou limpe todos os dados.
              </p>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleRestoreBackup}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restaurar Backup</span>
                </Button>
                
                <Button 
                  onClick={handleClearData}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todos os Dados</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-readable-muted">Versão</Label>
              <p className="text-base text-readable">1.0.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-readable-muted">Armazenamento</Label>
              <p className="text-base text-readable">LocalStorage</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-readable-muted">Última Atualização</Label>
              <p className="text-base text-readable">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-readable-muted">Status</Label>
              <p className="text-base text-green-400">Operacional</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-readable">Exportar Dados</h4>
            <p className="text-sm text-readable-muted">
              Use a função de exportar para fazer backup de todos os dados do sistema. 
              O arquivo gerado pode ser usado para restaurar os dados em outro momento.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-readable">Importar Dados</h4>
            <p className="text-sm text-readable-muted">
              Selecione um arquivo JSON de backup para restaurar os dados. 
              Certifique-se de que o arquivo foi gerado pela função de exportar deste sistema.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-readable">Backup Automático</h4>
            <p className="text-sm text-readable-muted">
              O sistema cria automaticamente um backup antes de importar novos dados ou limpar os dados existentes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
