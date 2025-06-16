
import { v4 as uuidv4 } from 'uuid';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  organizationId: string;
}

export interface CreateInventoryItemData {
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  organizationId: string;
}

export interface UpdateInventoryItemData {
  name?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  supplier?: string;
  location?: string;
}

// Helper para acessar dados do localStorage
const getTableData = (tableName: string): any[] => {
  const data = localStorage.getItem('app_database');
  if (!data) return [];
  const parsed = JSON.parse(data);
  return parsed[tableName] || [];
};

const saveTableData = (tableName: string, tableData: any[]): void => {
  const data = localStorage.getItem('app_database');
  const parsed = data ? JSON.parse(data) : {};
  parsed[tableName] = tableData;
  localStorage.setItem('app_database', JSON.stringify(parsed));
};

export const inventoryService = {
  getAll: (organizationId: string): InventoryItem[] => {
    const inventory = getTableData('inventory');
    
    return inventory
      .filter(item => item.organization_id === organizationId)
      .map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalValue: item.quantity * item.unit_price,
        supplier: item.supplier,
        location: item.location,
        organizationId: item.organization_id
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: (id: string): InventoryItem | null => {
    const inventory = getTableData('inventory');
    const item = inventory.find(i => i.id === id);
    
    if (!item) return null;
    
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalValue: item.quantity * item.unit_price,
      supplier: item.supplier,
      location: item.location,
      organizationId: item.organization_id
    };
  },

  create: (data: CreateInventoryItemData): InventoryItem => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const inventory = getTableData('inventory');
    
    const newItem = {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      supplier: data.supplier,
      location: data.location,
      organization_id: data.organizationId,
      created_at: now,
      updated_at: now
    };
    
    inventory.push(newItem);
    saveTableData('inventory', inventory);
    
    return {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalValue: data.quantity * data.unitPrice,
      supplier: data.supplier,
      location: data.location,
      organizationId: data.organizationId
    };
  },

  update: (id: string, data: UpdateInventoryItemData): void => {
    const inventory = getTableData('inventory');
    const itemIndex = inventory.findIndex(i => i.id === id);
    
    if (itemIndex === -1) return;
    
    const now = new Date().toISOString();
    const item = inventory[itemIndex];
    
    if (data.name !== undefined) item.name = data.name;
    if (data.category !== undefined) item.category = data.category;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.unitPrice !== undefined) item.unit_price = data.unitPrice;
    if (data.supplier !== undefined) item.supplier = data.supplier;
    if (data.location !== undefined) item.location = data.location;
    item.updated_at = now;
    
    inventory[itemIndex] = item;
    saveTableData('inventory', inventory);
  },

  delete: (id: string): void => {
    const inventory = getTableData('inventory');
    const filteredInventory = inventory.filter(i => i.id !== id);
    saveTableData('inventory', filteredInventory);
  }
};
