import { useMemo } from 'react';
import type { RootCauseAnalysis } from '../../types';

interface UseFilteredIncidentsProps {
  allIncidents: RootCauseAnalysis[];
  filterSeverity: number | 'all';
  filterLocation: string;
  sortBy: 'date' | 'severity' | 'impact';
}

interface UseFilteredIncidentsReturn {
  filteredIncidents: RootCauseAnalysis[];
  uniqueLocations: string[];
}

export const useFilteredIncidents = ({
  allIncidents,
  filterSeverity,
  filterLocation,
  sortBy,
}: UseFilteredIncidentsProps): UseFilteredIncidentsReturn => {
  const activeIncidents = useMemo(() => {
    return allIncidents.filter(rca =>
      ['draft', 'in-progress', 'review'].includes(rca.status)
    );
  }, [allIncidents]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(
      activeIncidents.map(rca => rca.location || 'Unspecified')
    );
    // The component previously added 'all' and sorted.
    // Let's ensure the hook provides a sorted list including 'all'.
    const sortedLocations = ['all', ...Array.from(locations).sort()];
    return sortedLocations;
  }, [activeIncidents]);

  const processedIncidents = useMemo(() => {
    let incidents = [...activeIncidents];

    // Apply severity filter
    if (filterSeverity !== 'all') {
      incidents = incidents.filter(
        rca => rca.impact.severityLevel === filterSeverity
      );
    }

    // Apply location filter
    // Assuming 'all' or an empty string for filterLocation means no location filter
    if (filterLocation && filterLocation !== 'all') {
      incidents = incidents.filter(
        rca => (rca.location || 'Unspecified') === filterLocation
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        incidents.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'severity':
        incidents.sort(
          (a, b) => b.impact.severityLevel - a.impact.severityLevel
        );
        break;
      case 'impact':
        incidents.sort(
          (a, b) => b.impact.financialCost - a.impact.financialCost
        );
        break;
      default:
        // No default sorting or throw error, depending on requirements
        break;
    }

    return incidents;
  }, [activeIncidents, filterSeverity, filterLocation, sortBy]);

  return { filteredIncidents: processedIncidents, uniqueLocations };
};
