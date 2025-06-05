export type RCAStatus = 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';

export type RCASeverityLevel = 1 | 2 | 3 | 4 | 5;

export type RCAImpact = {
  financialCost: number;
  downtimeDays: number;
  productionLoss: number;
  severityLevel: 1 | 2 | 3 | 4 | 5; // 1 = lowest, 5 = highest
};

export type RCATeamMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
};

export type RootCauseAnalysis = {
  id: string;
  title: string;
  description: string;
  status: RCAStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  impact: RCAImpact;
  equipment?: string;
  location?: string;
  department: string;
  assignedTo: RCATeamMember[];
  leadInvestigator: RCATeamMember;
  findings: string[];
  recommendations: string[];
  actions: {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
};