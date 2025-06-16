
import { Asset } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/database';

export interface CreateAssetData {
  name: string;
  serialNumber: string;
  type: Asset['type'];
  status: Asset['status'];
  organizationId: string;
  assignedTo?: string;
  value: number;
  purchaseDate: string;
  condition: Asset['condition'];
}

export interface UpdateAssetData {
  name?: string;
  serialNumber?: string;
  type?: Asset['type'];
  status?: Asset['status'];
  assignedTo?: string;
  value?: number;
  purchaseDate?: string;
  condition?: Asset['condition'];
}

export const assetsService = {
  getAll: async (organizationId: string): Promise<Asset[]> => {
    const assets = await db.getTableData('assets');
    const people = await db.getTableData('people');
    
    return assets
      .filter(asset => asset.organization_id === organizationId)
      .map(asset => {
        const assignedPerson = asset.assigned_to ? people.find(p => p.id === asset.assigned_to) : null;
        
        return {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          serialNumber: asset.serial_number,
          status: asset.status,
          condition: asset.condition,
          value: asset.value,
          purchaseDate: asset.purchase_date,
          assignedTo: asset.assigned_to,
          assignedToName: assignedPerson?.name,
          organizationId: asset.organization_id
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<Asset | null> => {
    const assets = await db.getTableData('assets');
    const people = await db.getTableData('people');
    const asset = assets.find(a => a.id === id);
    
    if (!asset) return null;
    
    const assignedPerson = asset.assigned_to ? people.find(p => p.id === asset.assigned_to) : null;
    
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serial_number,
      status: asset.status,
      condition: asset.condition,
      value: asset.value,
      purchaseDate: asset.purchase_date,
      assignedTo: asset.assigned_to,
      assignedToName: assignedPerson?.name,
      organizationId: asset.organization_id
    };
  },

  create: async (data: CreateAssetData): Promise<Asset> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const assets = await db.getTableData('assets');
    const people = await db.getTableData('people');
    
    const assignedPerson = data.assignedTo ? people.find(p => p.id === data.assignedTo) : null;
    
    const newAsset = {
      id,
      name: data.name,
      type: data.type,
      serial_number: data.serialNumber,
      status: data.status,
      condition: data.condition,
      value: data.value,
      purchase_date: data.purchaseDate,
      assigned_to: data.assignedTo || null,
      organization_id: data.organizationId,
      created_at: now,
      updated_at: now
    };
    
    assets.push(newAsset);
    await db.saveTableData('assets', assets);
    
    return {
      id,
      name: data.name,
      type: data.type,
      serialNumber: data.serialNumber,
      status: data.status,
      condition: data.condition,
      value: data.value,
      purchaseDate: data.purchaseDate,
      assignedTo: data.assignedTo,
      assignedToName: assignedPerson?.name,
      organizationId: data.organizationId
    };
  },

  update: async (id: string, data: UpdateAssetData): Promise<void> => {
    const assets = await db.getTableData('assets');
    const assetIndex = assets.findIndex(a => a.id === id);
    
    if (assetIndex === -1) return;
    
    const now = new Date().toISOString();
    const asset = assets[assetIndex];
    
    if (data.name !== undefined) asset.name = data.name;
    if (data.serialNumber !== undefined) asset.serial_number = data.serialNumber;
    if (data.type !== undefined) asset.type = data.type;
    if (data.status !== undefined) asset.status = data.status;
    if (data.condition !== undefined) asset.condition = data.condition;
    if (data.value !== undefined) asset.value = data.value;
    if (data.purchaseDate !== undefined) asset.purchase_date = data.purchaseDate;
    if (data.assignedTo !== undefined) asset.assigned_to = data.assignedTo || null;
    asset.updated_at = now;
    
    assets[assetIndex] = asset;
    await db.saveTableData('assets', assets);
  },

  delete: async (id: string): Promise<void> => {
    const assets = await db.getTableData('assets');
    const filteredAssets = assets.filter(a => a.id !== id);
    await db.saveTableData('assets', filteredAssets);
  }
};
