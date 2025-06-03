export const SEVERITY_LEVELS = {
  LOW: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CRITICAL: 5,
} as const;

export const RCA_STATUSES = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const ACTION_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export const DEPARTMENTS = {
  PRODUCTION: 'Production',
  MAINTENANCE: 'Maintenance',
  QUALITY: 'Quality',
  ENGINEERING: 'Engineering',
  SUPPLY_CHAIN: 'Supply Chain',
} as const;