import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilteredIncidents } from './useFilteredIncidents';
import type { RootCauseAnalysis, RCAImpact, RCASeverityLevel, RCAStatus } from '../../types';

// Helper to create mock RCA data
const createMockRca = (
  id: string,
  status: RCAStatus,
  impact: Partial<RCAImpact>,
  location: string | undefined,
  createdAt: string // Should be ISO string
): RootCauseAnalysis => ({
  id,
  title: `RCA ${id}`,
  description: `Description for RCA ${id}`,
  status,
  createdAt,
  updatedAt: createdAt, // For simplicity in testing date sort if not specified otherwise
  impact: {
    financialCost: 0,
    downtimeDays: 0,
    productionLoss: 0,
    severityLevel: 1 as RCASeverityLevel, // Default severity if not provided
    ...impact,
  },
  location, // Can be undefined
  department: 'Test Dept',
  leadInvestigator: { id: 'user1', name: 'Test User', role: 'Investigator', department: 'Test Dept' },
  assignedTo: [],
  findings: [],
  recommendations: [],
  actions: [],
  // equipment is optional
});

const mockAllIncidents: RootCauseAnalysis[] = [
  createMockRca('1', 'draft', { severityLevel: 3, financialCost: 1000 }, 'Site A', '2023-01-15T10:00:00Z'),
  createMockRca('2', 'in-progress', { severityLevel: 5, financialCost: 5000 }, 'Site B', '2023-01-10T10:00:00Z'),
  createMockRca('3', 'review', { severityLevel: 1, financialCost: 100 }, undefined, '2023-01-20T10:00:00Z'), // Unspecified location
  createMockRca('4', 'completed', { severityLevel: 2, financialCost: 500 }, 'Site A', '2023-01-05T10:00:00Z'), // Not active
  createMockRca('5', 'in-progress', { severityLevel: 3, financialCost: 1500 }, 'Site B', '2023-01-18T10:00:00Z'),
  createMockRca('6', 'draft', { severityLevel: 5, financialCost: 6000 }, 'Site C', '2023-01-12T10:00:00Z'),
];

const initialProps = {
  allIncidents: mockAllIncidents,
  filterSeverity: 'all' as (number | 'all'),
  filterLocation: 'all', // 'all' is a string, consistent with how it's used in the component
  sortBy: 'date' as ('date' | 'severity' | 'impact'),
};

describe('useFilteredIncidents Hook', () => {
  it('should return initially active incidents sorted by date and all unique locations', () => {
    const { result } = renderHook(() => useFilteredIncidents(initialProps));

    // Active incidents are those not 'completed' or 'archived'
    // Expected active: 1, 2, 3, 5, 6
    expect(result.current.filteredIncidents.length).toBe(5);
    // Default sort is by date descending
    expect(result.current.filteredIncidents.map(r => r.id)).toEqual(['3', '5', '1', '6', '2']);

    // Locations from active incidents: Site A, Site B, Unspecified, Site B, Site C
    // Unique: Site A, Site B, Unspecified, Site C
    // Hook adds 'all' and sorts them:
    const expectedLocations = ['all', 'Site A', 'Site B', 'Site C', 'Unspecified'].sort();
    expect(result.current.uniqueLocations).toEqual(expectedLocations);
  });

  it('should filter by severity', () => {
    const { result, rerender } = renderHook(props => useFilteredIncidents(props), { initialProps });

    act(() => {
      rerender({ ...initialProps, filterSeverity: 5 });
    });
    expect(result.current.filteredIncidents.length).toBe(2); // RCAs '2' and '6' have severity 5
    expect(result.current.filteredIncidents.every(r => r.impact.severityLevel === 5)).toBe(true);
    // Default sort is still date, so '6' (Jan 12) then '2' (Jan 10)
    expect(result.current.filteredIncidents.map(r => r.id)).toEqual(['6', '2']);
  });

  it('should filter by location', () => {
    const { result, rerender } = renderHook(props => useFilteredIncidents(props), { initialProps });
    act(() => {
      rerender({ ...initialProps, filterLocation: 'Site A' });
    });
    expect(result.current.filteredIncidents.length).toBe(1); // Only RCA '1' is active and in Site A
    expect(result.current.filteredIncidents[0].id).toBe('1');
  });

  it('should filter by "Unspecified" location', () => {
    const { result, rerender } = renderHook(props => useFilteredIncidents(props), { initialProps });
    act(() => {
      rerender({ ...initialProps, filterLocation: 'Unspecified' });
    });
    expect(result.current.filteredIncidents.length).toBe(1); // Only RCA '3'
    expect(result.current.filteredIncidents[0].id).toBe('3');
  });

  it('should filter by severity and location', () => {
    const { result, rerender } = renderHook(props => useFilteredIncidents(props), { initialProps });
    act(() => {
      // Severity 3 and Site B => RCA '5'
      rerender({ ...initialProps, filterSeverity: 3, filterLocation: 'Site B' });
    });
    expect(result.current.filteredIncidents.length).toBe(1);
    expect(result.current.filteredIncidents[0].id).toBe('5');
  });

  it('should sort by severity (descending)', () => {
    const { result, rerender } = renderHook(props => useFilteredIncidents(props), { initialProps });
    act(() => {
      rerender({ ...initialProps, sortBy: 'severity' });
    });
    // Severities: RCA1(3), RCA2(5), RCA3(1), RCA5(3), RCA6(5)
    // Expected order: 5,5,3,3,1
    // IDs: (2,6), (1,5), (3) - within same severity, date sort as secondary is not explicitly defined by hook, so check primary sort
    const severities = result.current.filteredIncidents.map(r => r.impact.severityLevel);
    expect(severities).toEqual([5, 5, 3, 3, 1]);
  });

  it('should sort by financial impact (descending)', () => {
    const { result, rerender } = renderHook(props => useFilteredIncidents(props), { initialProps });
    act(() => {
      rerender({ ...initialProps, sortBy: 'impact' });
    });
    // Costs: RCA1(1000), RCA2(5000), RCA3(100), RCA5(1500), RCA6(6000)
    // Expected order: 6000, 5000, 1500, 1000, 100
    // IDs: 6, 2, 5, 1, 3
    expect(result.current.filteredIncidents.map(r => r.id)).toEqual(['6', '2', '5', '1', '3']);
  });

  it('should handle empty allIncidents array', () => {
    const { result } = renderHook(() => useFilteredIncidents({ ...initialProps, allIncidents: [] }));
    expect(result.current.filteredIncidents.length).toBe(0);
    expect(result.current.uniqueLocations).toEqual(['all']); // Hook adds 'all' by default
  });

  it('should correctly derive unique locations including "Unspecified", "all", and be sorted', () => {
    const { result } = renderHook(() => useFilteredIncidents(initialProps));
    const expectedLocations = ['all', 'Site A', 'Site B', 'Site C', 'Unspecified'].sort();
    expect(result.current.uniqueLocations).toEqual(expectedLocations);
  });
});
