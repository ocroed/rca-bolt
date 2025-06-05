import type { RootCauseAnalysis, RCAStatus, RCASeverityLevel } from '../types';

/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format downtime days with appropriate unit
 */
export const formatDowntime = (days: number): string => {
  if (days < 1/24) {
    // Less than 1 hour
    const minutes = Math.round(days * 24 * 60);
    return `${minutes} minutes`;
  } else if (days < 1) {
    // Less than 1 day
    const hours = Math.round(days * 24);
    return `${hours} hours`;
  } else {
    // 1 day or more
    return `${days.toFixed(1)} days`;
  }
};

/**
 * Format a date to a readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get status color based on RCA status
 */
export const getStatusColor = (status: RCAStatus): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-300 text-gray-800';
    case 'in-progress':
      return 'bg-blue-500 text-white';
    case 'review':
      return 'bg-amber-500 text-white';
    case 'completed':
      return 'bg-green-600 text-white';
    case 'archived':
      return 'bg-gray-700 text-white';
    default:
      return 'bg-gray-400 text-gray-800';
  }
};

/**
 * Get severity level label and color
 */
export const getSeverityInfo = (level: RCASeverityLevel): { label: string; color: string } => {
  switch (level) {
    case 1:
      return { 
        label: 'Low', 
        color: 'bg-green-100 text-green-800 border-green-200' 
      };
    case 2:
      return { 
        label: 'Minor', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      };
    case 3:
      return { 
        label: 'Moderate', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      };
    case 4:
      return { 
        label: 'Major', 
        color: 'bg-orange-100 text-orange-800 border-orange-200' 
      };
    case 5:
      return { 
        label: 'Critical', 
        color: 'bg-red-100 text-red-800 border-red-200' 
      };
    default:
      return { 
        label: 'Unknown', 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      };
  }
};

/**
 * Calculate total financial impact
 */
export const calculateTotalImpact = (rcas: RootCauseAnalysis[]): number => {
  return rcas.reduce((total, rca) => total + rca.impact.financialCost, 0);
};

/**
 * Calculate total downtime
 */
export const calculateTotalDowntime = (rcas: RootCauseAnalysis[]): number => {
  return rcas.reduce((total, rca) => total + rca.impact.downtimeDays, 0);
};