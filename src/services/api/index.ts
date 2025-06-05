import type { RCA, User, Equipment, Location, Department, ActionItem, RCAImpact, RCAStatus, RCAAttachment, RCAPriority, RCACategory } from '../../types/models';
import cogniteClient from '../cogniteClient';
import type { Activity, CogniteExternalId, CogniteInternalId, Timestamp } from '@cognite/sdk';

// Helper function to safely access metadata properties
const getMetadataProperty = <T>(activity: Activity, key: string, defaultValue: T): T => {
  return (activity.metadata && activity.metadata[key] !== undefined) ? activity.metadata[key] as T : defaultValue;
};

// Helper function to map Cognite Activity to RCA
const mapActivityToRCA = (activity: Activity): RCA => {
  // Default RCAImpact structure based on src/types/models.ts
  let impact: RCAImpact = { financialCost: 0, downtimeDays: 0, productionLoss: 0, severityLevel: 1 };
  try {
    const impactString = getMetadataProperty<string | undefined>(activity, 'impact', undefined);
    if (impactString) {
      impact = JSON.parse(impactString) as RCAImpact;
    }
  } catch (error) {
    console.error(`Error parsing impact for activity ${activity.id}:`, error);
    // Keep default impact if parsing fails
  }

  const title = getMetadataProperty<string | undefined>(activity, 'title', undefined) || activity.description || `RCA ${activity.id}`;
  const description = activity.description || getMetadataProperty<string | undefined>(activity, 'description', undefined) || '';


  return {
    id: activity.id.toString(), // Assuming activity.id is a number or can be stringified
    title,
    description,
    createdAt: new Date(activity.createdTime as Timestamp),
    updatedAt: new Date(activity.lastUpdatedTime as Timestamp),
    status: getMetadataProperty<RCAStatus>(activity, 'status', 'draft'), // Default to 'draft' or another valid RCAStatus
    completedAt: getMetadataProperty<string | undefined>(activity, 'completedAt', undefined) ? new Date(getMetadataProperty<string>(activity, 'completedAt', '')) : undefined,
    impact,
    equipmentId: getMetadataProperty<string | undefined>(activity, 'equipmentId', undefined),
    locationId: getMetadataProperty<string | undefined>(activity, 'locationId', undefined),
    departmentId: getMetadataProperty<string | undefined>(activity, 'departmentId', undefined),
    assignedToIds: getMetadataProperty<string[]>(activity, 'assignedToIds', []),
    leadInvestigatorId: getMetadataProperty<string | undefined>(activity, 'leadInvestigatorId', undefined),
    findings: getMetadataProperty<string[]>(activity, 'findings', []),
    recommendations: getMetadataProperty<string[]>(activity, 'recommendations', []),
    rootCauses: getMetadataProperty<string[]>(activity, 'rootCauses', []),
    tags: getMetadataProperty<string[]>(activity, 'tags', []),
    attachments: getMetadataProperty<RCAAttachment[]>(activity, 'attachments', []),
    category: getMetadataProperty<RCACategory>(activity, 'category', 'Uncategorized'),
    priority: getMetadataProperty<RCAPriority>(activity, 'priority', 'Medium'),
    // Ensure all RCA fields are covered. Add defaults for any missing.
    externalId: activity.externalId as CogniteExternalId || undefined,
    parentId: getMetadataProperty<string | undefined>(activity, 'parentId', undefined), // Example if parentId is stored in metadata
    relatedIncidentIds: getMetadataProperty<string[]>(activity, 'relatedIncidentIds', []),
    timelineEvents: getMetadataProperty<Array<{ timestamp: string; description: string; actorId?: string }>>(activity, 'timelineEvents', []),
    lessonsLearned: getMetadataProperty<string[]>(activity, 'lessonsLearned', []),
    nextReviewDate: getMetadataProperty<string | undefined>(activity, 'nextReviewDate', undefined) ? new Date(getMetadataProperty<string>(activity, 'nextReviewDate', '')) : undefined,
    customFields: getMetadataProperty<Record<string, any>>(activity, 'customFields', {}),
  };
};


// Base API service
abstract class BaseAPI<T> {
  abstract getAll(): Promise<T[]>;
  abstract getById(id: string): Promise<T | undefined>; // Allow undefined for not found
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

// Specific API implementations
export class RCAAPI extends BaseAPI<RCA> {
  async getAll(): Promise<RCA[]> {
    try {
      const activities = await cogniteClient.activities.list({ limit: 1000 });
      // Ensure activities.items is used if the SDK returns an object with an items array
      const items = Array.isArray(activities) ? activities : activities.items;
      return items.map(mapActivityToRCA);
    } catch (error) {
      console.error('Error fetching RCAs from Cognite Data Fusion:', error);
      return []; // Return empty array or throw error as per desired error handling strategy
    }
  }

  async getById(id: string): Promise<RCA | undefined> {
    try {
      const activities = await cogniteClient.activities.retrieve([{ externalId: id }]);
      if (activities.length === 0) {
        // It's often better to return undefined or a custom error type than to throw a generic error.
        // For now, adhering to "throw an error if not found".
        throw new Error(`RCA with externalId ${id} not found.`);
      }
      if (activities.length > 1) {
        // This case should ideally not happen if externalIds are unique.
        console.warn(`Found multiple activities for externalId ${id}. Returning the first one.`);
      }
      return mapActivityToRCA(activities[0]);
    } catch (error) {
      console.error(`Error fetching RCA with externalId ${id} from Cognite Data Fusion:`, error);
      // Re-throw the error or handle it as per the desired error handling strategy.
      // If error is an instance of Error, we can re-throw it, otherwise wrap it.
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch RCA with externalId ${id}: ${String(error)}`);
    }
  }

  async create(data: Partial<RCA>): Promise<RCA> {
    // TODO: Implement actual API call. This will involve mapping RCA data to ActivityWrite format.
    console.log('RCAAPI.create called with data:', data);
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<RCA>): Promise<RCA> {
    // TODO: Implement actual API call. This will involve mapping RCA data to ActivityChange format.
    console.log('RCAAPI.update called with id:', id, 'and data:', data);
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    // TODO: Implement actual API call, e.g., cogniteClient.activities.delete([{id: parseInt(id,10)}])
    console.log('RCAAPI.delete called with id:', id);
    throw new Error('Not implemented');
  }

import { calculateTotalImpact as utilCalculateTotalImpact, calculateTotalDowntime as utilCalculateTotalDowntime } from '../../utils/formatters';

// RCA-specific methods
  async getActiveIncidents(): Promise<RCA[]> {
    try {
      const allRCAs = await this.getAll();
      const activeStatuses: RCAStatus[] = ['draft', 'in-progress', 'review'];
      return allRCAs.filter(rca => activeStatuses.includes(rca.status));
    } catch (error) {
      console.error('Error fetching active incidents:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch active incidents: ${String(error)}`);
    }
  }

  async getDashboardStats(): Promise<{
    totalImpact: number;
    totalDowntime: number;
    ongoingCount: number;
    completedCount: number;
  }> {
    try {
      const allRCAs = await this.getAll();

      // Use correct field names financialCost and downtimeDays from RCAImpact type
      const totalImpact = allRCAs.reduce((sum, rca) => sum + (rca.impact?.financialCost || 0), 0);
      const totalDowntime = allRCAs.reduce((sum, rca) => sum + (rca.impact?.downtimeDays || 0), 0);

      const ongoingStatuses: RCAStatus[] = ['draft', 'in-progress', 'review'];
      const ongoingCount = allRCAs.filter(rca => ongoingStatuses.includes(rca.status)).length;

      const completedStatuses: RCAStatus[] = ['completed', 'archived'];
      const completedCount = allRCAs.filter(rca => completedStatuses.includes(rca.status)).length;

      return {
        totalImpact,
        totalDowntime,
        ongoingCount,
        completedCount,
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      // Return default/empty stats or re-throw as per desired error handling
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to calculate dashboard stats: ${String(error)}`);
    }
  }
}

// Placeholder implementations for other entities to maintain structure
export class UserAPI extends BaseAPI<User> {
  async getAll(): Promise<User[]> { console.warn("UserAPI.getAll not implemented"); return []; }
  async getById(id: string): Promise<User | undefined> { console.warn("UserAPI.getById not implemented", id); return undefined; }
  async create(data: Partial<User>): Promise<User> { console.warn("UserAPI.create not implemented", data); throw new Error('Not implemented'); }
  async update(id: string, data: Partial<User>): Promise<User> { console.warn("UserAPI.update not implemented", id, data); throw new Error('Not implemented'); }
  async delete(id: string): Promise<void> { console.warn("UserAPI.delete not implemented", id); throw new Error('Not implemented'); }
}

export class EquipmentAPI extends BaseAPI<Equipment> {
  async getAll(): Promise<Equipment[]> { console.warn("EquipmentAPI.getAll not implemented"); return []; }
  async getById(id: string): Promise<Equipment | undefined> { console.warn("EquipmentAPI.getById not implemented", id); return undefined; }
  async create(data: Partial<Equipment>): Promise<Equipment> { console.warn("EquipmentAPI.create not implemented", data); throw new Error('Not implemented'); }
  async update(id: string, data: Partial<Equipment>): Promise<Equipment> { console.warn("EquipmentAPI.update not implemented", id, data); throw new Error('Not implemented'); }
  async delete(id: string): Promise<void> { console.warn("EquipmentAPI.delete not implemented", id); throw new Error('Not implemented'); }
}

export class LocationAPI extends BaseAPI<Location> {
  async getAll(): Promise<Location[]> { console.warn("LocationAPI.getAll not implemented"); return []; }
  async getById(id: string): Promise<Location | undefined> { console.warn("LocationAPI.getById not implemented", id); return undefined; }
  async create(data: Partial<Location>): Promise<Location> { console.warn("LocationAPI.create not implemented", data); throw new Error('Not implemented'); }
  async update(id: string, data: Partial<Location>): Promise<Location> { console.warn("LocationAPI.update not implemented", id, data); throw new Error('Not implemented'); }
  async delete(id: string): Promise<void> { console.warn("LocationAPI.delete not implemented", id); throw new Error('Not implemented'); }
}

export class DepartmentAPI extends BaseAPI<Department> {
  async getAll(): Promise<Department[]> { console.warn("DepartmentAPI.getAll not implemented"); return []; }
  async getById(id: string): Promise<Department | undefined> { console.warn("DepartmentAPI.getById not implemented", id); return undefined; }
  async create(data: Partial<Department>): Promise<Department> { console.warn("DepartmentAPI.create not implemented", data); throw new Error('Not implemented'); }
  async update(id: string, data: Partial<Department>): Promise<Department> { console.warn("DepartmentAPI.update not implemented", id, data); throw new Error('Not implemented'); }
  async delete(id: string): Promise<void> { console.warn("DepartmentAPI.delete not implemented", id); throw new Error('Not implemented'); }
}

export class ActionItemAPI extends BaseAPI<ActionItem> {
  async getAll(): Promise<ActionItem[]> { console.warn("ActionItemAPI.getAll not implemented"); return []; }
  async getById(id: string): Promise<ActionItem | undefined> { console.warn("ActionItemAPI.getById not implemented", id); return undefined; }
  async create(data: Partial<ActionItem>): Promise<ActionItem> { console.warn("ActionItemAPI.create not implemented", data); throw new Error('Not implemented'); }
  async update(id: string, data: Partial<ActionItem>): Promise<ActionItem> { console.warn("ActionItemAPI.update not implemented", id, data); throw new Error('Not implemented'); }
  async delete(id: string): Promise<void> { console.warn("ActionItemAPI.delete not implemented", id); throw new Error('Not implemented'); }
}


// API client that combines all APIs
export class APIClient {
  rca = new RCAAPI();
  users = new UserAPI();
  equipment = new EquipmentAPI();
  locations = new LocationAPI();
  departments = new DepartmentAPI();
  actions = new ActionItemAPI();

  constructor() {
    // Optional: Initialize or configure APIs if needed
    // Example: Check if Cognite client is configured
    if (cogniteClient.project.length === 0 || cogniteClient.project === 'YOUR_PROJECT_NAME_PLACEHOLDER') {
      console.warn(
        'Cognite client is not configured with a project. API calls may fail. ' +
        'Please configure src/services/cogniteClient.ts'
      );
    }
  }
}

// Export singleton instance
export const api = new APIClient();