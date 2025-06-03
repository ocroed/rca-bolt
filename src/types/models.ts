// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User/Team member
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
}

// Equipment
export interface Equipment extends BaseEntity {
  name: string;
  code: string;
  type: string;
  location: string;
  department: string;
  status: 'operational' | 'maintenance' | 'down';
  lastMaintenanceDate: string;
}

// Location
export interface Location extends BaseEntity {
  name: string;
  code: string;
  building: string;
  floor: string;
  department: string;
}

// Department
export interface Department extends BaseEntity {
  name: string;
  code: string;
  manager: string;
  parentDepartment?: string;
}

// RCA Status and Impact
export interface RCAImpact {
  financialCost: number;
  downtimeDays: number;
  productionLoss: number;
  severityLevel: 1 | 2 | 3 | 4 | 5;
}

export type RCAStatus = 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';

// Action Item
export interface ActionItem extends BaseEntity {
  rcaId: string;
  description: string;
  assignedToId: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 1 | 2 | 3;
  comments: string[];
}

// Root Cause Analysis
export interface RCA extends BaseEntity {
  title: string;
  description: string;
  status: RCAStatus;
  completedAt?: string;
  impact: RCAImpact;
  
  // References to other entities
  equipmentId?: string;
  locationId?: string;
  departmentId: string;
  assignedToIds: string[];
  leadInvestigatorId: string;
  
  // Analysis details
  findings: string[];
  recommendations: string[];
  rootCauses: string[];
  
  // Metadata
  tags: string[];
  attachments: string[];
  category: string;
  priority: 1 | 2 | 3 | 4 | 5;
}