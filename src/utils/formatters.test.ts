import { describe, it, expect } from 'vitest';
import {
  calculateTotalImpact,
  calculateTotalDowntime,
  getStatusColor,
  getSeverityInfo,
} from './formatters';
import type { RootCauseAnalysis, RCAStatus, RCASeverityLevel, RCAImpact } from '../types';

// Mock data generation helper
const createMockRca = (id: string, impact: Partial<RCAImpact>, status: RCAStatus = 'draft'): RootCauseAnalysis => ({
  id,
  title: `Test RCA ${id}`,
  description: 'Test description',
  status,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  impact: {
    financialCost: 0,
    downtimeDays: 0,
    productionLoss: 0,
    severityLevel: 1 as RCASeverityLevel, // Default severity
    ...impact,
  },
  department: 'Test Dept',
  leadInvestigator: { id: 'user1', name: 'Test User', role: 'Investigator', department: 'Test Dept' },
  assignedTo: [],
  findings: [],
  recommendations: [],
  actions: [],
  // equipment and location are optional, so not strictly needed for these tests unless a function uses them
});

describe('formatter utilities', () => {
  describe('calculateTotalImpact', () => {
    it('should return 0 for an empty array', () => {
      expect(calculateTotalImpact([])).toBe(0);
    });

    it('should correctly sum financial costs', () => {
      const rcas: RootCauseAnalysis[] = [
        createMockRca('1', { financialCost: 100 }),
        createMockRca('2', { financialCost: 200 }),
        createMockRca('3', { financialCost: 50 }),
      ];
      expect(calculateTotalImpact(rcas)).toBe(350);
    });

    it('should handle items with zero financial cost', () => {
      const rcas: RootCauseAnalysis[] = [
        createMockRca('1', { financialCost: 100 }),
        createMockRca('2', { financialCost: 0 }),
        createMockRca('3', { financialCost: 50 }),
      ];
      expect(calculateTotalImpact(rcas)).toBe(150);
    });
  });

  describe('calculateTotalDowntime', () => {
    it('should return 0 for an empty array', () => {
      expect(calculateTotalDowntime([])).toBe(0);
    });

    it('should correctly sum downtime days', () => {
      const rcas: RootCauseAnalysis[] = [
        createMockRca('1', { downtimeDays: 1 }),
        createMockRca('2', { downtimeDays: 0.5 }),
        createMockRca('3', { downtimeDays: 2 }),
      ];
      expect(calculateTotalDowntime(rcas)).toBe(3.5);
    });

    it('should handle items with zero downtime days', () => {
      const rcas: RootCauseAnalysis[] = [
        createMockRca('1', { downtimeDays: 1 }),
        createMockRca('2', { downtimeDays: 0 }),
        createMockRca('3', { downtimeDays: 2 }),
      ];
      expect(calculateTotalDowntime(rcas)).toBe(3);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getStatusColor('draft')).toBe('bg-gray-300 text-gray-800');
      expect(getStatusColor('in-progress')).toBe('bg-blue-500 text-white');
      expect(getStatusColor('review')).toBe('bg-amber-500 text-white');
      expect(getStatusColor('completed')).toBe('bg-green-600 text-white');
      expect(getStatusColor('archived')).toBe('bg-gray-700 text-white');
    });

    it('should return default color for unknown status', () => {
      // Cast to RCAStatus to satisfy type checker for testing default case
      expect(getStatusColor('unknown-status' as RCAStatus)).toBe('bg-gray-400 text-gray-800');
    });
  });

  describe('getSeverityInfo', () => {
    it('should return correct label and color for severity level 1', () => {
      expect(getSeverityInfo(1)).toEqual({
        label: 'Low',
        color: 'bg-green-100 text-green-800 border-green-200',
      });
    });
    it('should return correct label and color for severity level 2', () => {
      expect(getSeverityInfo(2)).toEqual({
        label: 'Minor',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      });
    });
    it('should return correct label and color for severity level 3', () => {
      expect(getSeverityInfo(3)).toEqual({
        label: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      });
    });
    it('should return correct label and color for severity level 4', () => {
      expect(getSeverityInfo(4)).toEqual({
        label: 'Major',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
      });
    });
    it('should return correct label and color for severity level 5', () => {
      expect(getSeverityInfo(5)).toEqual({
        label: 'Critical',
        color: 'bg-red-100 text-red-800 border-red-200',
      });
    });
    it('should return default info for unknown severity level', () => {
      // Cast to RCASeverityLevel to satisfy type checker for testing default case
      expect(getSeverityInfo(0 as RCASeverityLevel)).toEqual({
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
      });
      expect(getSeverityInfo(6 as RCASeverityLevel)).toEqual({
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
      });
    });
  });
});
