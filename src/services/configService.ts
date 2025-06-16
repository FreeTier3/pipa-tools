
export interface DatabaseExport {
  organizations: any[];
  teams: any[];
  people: any[];
  assets: any[];
  licenses: any[];
  inventory: any[];
  exportDate: string;
  version: string;
}

export const configService = {
  exportDatabase: (): DatabaseExport => {
    const data = localStorage.getItem('app_database');
    const parsed = data ? JSON.parse(data) : {};
    
    return {
      organizations: parsed.organizations || [],
      teams: parsed.teams || [],
      people: parsed.people || [],
      assets: parsed.assets || [],
      licenses: parsed.licenses || [],
      inventory: parsed.inventory || [],
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  },

  importDatabase: (importData: DatabaseExport): boolean => {
    try {
      // Validar estrutura básica
      if (!importData.organizations || !Array.isArray(importData.organizations)) {
        throw new Error('Formato inválido: organizations deve ser um array');
      }
      
      if (!importData.teams || !Array.isArray(importData.teams)) {
        throw new Error('Formato inválido: teams deve ser um array');
      }
      
      if (!importData.people || !Array.isArray(importData.people)) {
        throw new Error('Formato inválido: people deve ser um array');
      }
      
      if (!importData.assets || !Array.isArray(importData.assets)) {
        throw new Error('Formato inválido: assets deve ser um array');
      }
      
      if (!importData.licenses || !Array.isArray(importData.licenses)) {
        throw new Error('Formato inválido: licenses deve ser um array');
      }
      
      if (!importData.inventory || !Array.isArray(importData.inventory)) {
        throw new Error('Formato inválido: inventory deve ser um array');
      }

      // Fazer backup dos dados atuais
      const currentData = localStorage.getItem('app_database');
      localStorage.setItem('app_database_backup', currentData || '{}');
      
      // Importar novos dados
      const newData = {
        organizations: importData.organizations,
        teams: importData.teams,
        people: importData.people,
        assets: importData.assets,
        licenses: importData.licenses,
        inventory: importData.inventory
      };
      
      localStorage.setItem('app_database', JSON.stringify(newData));
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  },

  restoreBackup: (): boolean => {
    try {
      const backupData = localStorage.getItem('app_database_backup');
      if (!backupData) {
        throw new Error('Nenhum backup encontrado');
      }
      
      localStorage.setItem('app_database', backupData);
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  },

  clearAllData: (): void => {
    // Fazer backup antes de limpar
    const currentData = localStorage.getItem('app_database');
    localStorage.setItem('app_database_backup', currentData || '{}');
    
    // Limpar dados
    localStorage.removeItem('app_database');
  },

  downloadJsonFile: (data: any, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  parseJsonFile: (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const parsedData = JSON.parse(result);
            resolve(parsedData);
          } else {
            reject(new Error('Erro ao ler o arquivo'));
          }
        } catch (error) {
          reject(new Error('Arquivo JSON inválido'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      reader.readAsText(file);
    });
  }
};
