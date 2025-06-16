
// Sistema de banco de dados com persistência real para ambiente Docker
interface DatabaseRow {
  [key: string]: any;
}

interface TableData {
  [tableName: string]: DatabaseRow[];
}

class PersistentDatabase {
  private storageKey = 'app_database';
  private isServer = typeof window === 'undefined';
  private apiBase = '';

  constructor() {
    // Detectar se estamos no servidor (SSR) ou cliente
    if (typeof window !== 'undefined') {
      this.apiBase = window.location.origin;
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.apiBase}/api/database${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Database request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Database request error:', error);
      // Fallback para localStorage em caso de erro
      return this.getLocalData();
    }
  }

  private getLocalData(): TableData {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  private saveLocalData(data: TableData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private async getData(): Promise<TableData> {
    try {
      // Tentar buscar do servidor primeiro
      const serverData = await this.makeRequest('GET', '');
      return serverData;
    } catch (error) {
      console.warn('Fallback to localStorage:', error);
      return this.getLocalData();
    }
  }

  private async saveData(data: TableData): Promise<void> {
    try {
      // Salvar no servidor
      await this.makeRequest('POST', '', data);
      // Também salvar localmente como backup
      this.saveLocalData(data);
    } catch (error) {
      console.warn('Fallback to localStorage save:', error);
      this.saveLocalData(data);
    }
  }

  private async ensureTable(tableName: string): Promise<void> {
    const data = await this.getData();
    if (!data[tableName]) {
      data[tableName] = [];
      await this.saveData(data);
    }
  }

  prepare(sql: string) {
    return {
      all: async (tableName: string, ...params: any[]) => {
        await this.ensureTable(tableName);
        const data = await this.getData();
        return data[tableName] || [];
      },
      get: async (tableName: string, ...params: any[]) => {
        await this.ensureTable(tableName);
        const data = await this.getData();
        const rows = data[tableName] || [];
        return rows.length > 0 ? rows[0] : null;
      },
      run: async (tableName: string, ...params: any[]) => {
        await this.ensureTable(tableName);
        const data = await this.getData();
        if (!data[tableName]) {
          data[tableName] = [];
        }
        await this.saveData(data);
        return { changes: 1 };
      }
    };
  }

  async exec(sql: string): Promise<void> {
    console.log('Executing SQL:', sql);
  }

  pragma(statement: string): void {
    console.log('Pragma:', statement);
  }

  // Método público para obter dados diretamente
  async getTableData(tableName: string): Promise<any[]> {
    await this.ensureTable(tableName);
    const data = await this.getData();
    return data[tableName] || [];
  }

  // Método público para salvar dados de uma tabela
  async saveTableData(tableName: string, tableData: any[]): Promise<void> {
    const data = await this.getData();
    data[tableName] = tableData;
    await this.saveData(data);
  }
}

export const db = new PersistentDatabase();

export const initDatabase = async () => {
  try {
    // Tentar carregar dados do servidor
    const serverData = await fetch('/api/database').then(res => res.json()).catch(() => null);
    
    if (!serverData || Object.keys(serverData).length === 0) {
      // Se não há dados no servidor, inicializar com dados padrão
      const initialData: TableData = {
        organizations: [
          {
            id: '1',
            name: 'Organização Principal',
            description: 'Organização padrão do sistema',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        teams: [
          {
            id: '1',
            name: 'Desenvolvimento',
            description: 'Time de desenvolvimento de software',
            organization_id: '1',
            manager_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        people: [],
        assets: [],
        licenses: [],
        inventory: []
      };
      
      // Salvar dados iniciais no servidor
      await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialData)
      }).catch(() => {
        // Fallback para localStorage se servidor não disponível
        localStorage.setItem('app_database', JSON.stringify(initialData));
      });
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.warn('Database initialization error, using localStorage fallback:', error);
    
    // Fallback para localStorage
    const data = localStorage.getItem('app_database');
    if (!data) {
      const initialData: TableData = {
        organizations: [
          {
            id: '1',
            name: 'Organização Principal',
            description: 'Organização padrão do sistema',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        teams: [
          {
            id: '1',
            name: 'Desenvolvimento',
            description: 'Time de desenvolvimento de software',
            organization_id: '1',
            manager_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        people: [],
        assets: [],
        licenses: [],
        inventory: []
      };
      
      localStorage.setItem('app_database', JSON.stringify(initialData));
    }
  }
};

export default db;
