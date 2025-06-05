import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, SortAsc, Clock, MapPin, Users, UserCircle, Loader2, ServerCrash } from 'lucide-react';
import { api } from '../services/api';
import { formatDate, formatCurrency, getSeverityInfo } from '../utils/formatters';
import type { RCA, RCAStatus } from '../types/models'; // Updated import to RCA

const ActiveIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<RCA[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterSeverity, setFilterSeverity] = useState<number | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'impact'>('date');

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.rca.getActiveIncidents();
        setIncidents(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching incidents.');
        }
        console.error("Failed to fetch active incidents:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  // activeRCAs now directly uses the incidents state
  const activeRCAs = incidents;

  // Get unique locations for filter from fetched incidents
  const locations = Array.from(new Set(activeRCAs.map(rca => rca.locationId || 'Unspecified')));

  // Apply severity and location filters, then sorting
  const filteredRCAs = activeRCAs
    .filter(rca => filterSeverity === 'all' || rca.impact.severityLevel === filterSeverity)
    .filter(rca => filterLocation === 'all' || (rca.locationId || 'Unspecified') === filterLocation)
    .sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          return b.impact.severityLevel - a.impact.severityLevel;
        case 'impact':
          // Assuming financialCost is the primary impact metric for sorting
          return (b.impact.financialCost || 0) - (a.impact.financialCost || 0);
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="ml-2 text-gray-600">Loading active incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
        <ServerCrash size={20} className="mr-2" />
        <p><span className="font-semibold">Error:</span> {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="mr-2 text-amber-500" />
            Active Incidents
          </h1>
          <p className="text-gray-600">Monitoring {filteredRCAs.length} active RCAs</p>
        </div>

        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin size={18} className="text-gray-500" />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.sort().map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="5">Critical</option> {/* Assuming 5 is Critical */}
              <option value="4">Major</option> {/* Assuming 4 is Major */}
              {/* Add more options if needed based on severity levels */}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <SortAsc size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Latest Updated</option>
              <option value="severity">Severity</option>
              <option value="impact">Financial Impact</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRCAs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No active incidents found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRCAs.map(rca => (
            <IncidentCard key={rca.id} rca={rca} />
          ))}
        </div>
      )}
    </div>
  );
};

const IncidentCard: React.FC<{ rca: RCA }> = ({ rca }) => { // Updated type to RCA
  const severityInfo = getSeverityInfo(rca.impact.severityLevel);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${severityInfo.color}`}>
              {severityInfo.label} Severity
            </span>
            <span className="text-sm text-gray-500">ID: {rca.id}</span>
            {rca.externalId && <span className="text-sm text-gray-400">Ext. ID: {rca.externalId}</span>}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{rca.title}</h3>
          <p className="text-gray-600 mt-1 text-sm">{rca.description}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-red-600 font-semibold">{formatCurrency(rca.impact.financialCost)}</div>
          <div className="text-sm text-gray-500">Financial Impact</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <div className="font-medium text-gray-500">Department</div>
          <div className="text-gray-900">{rca.departmentId}</div>
        </div>
        <div>
          <div className="font-medium text-gray-500">Location</div>
          <div className="text-gray-900">{rca.locationId || 'N/A'}</div>
        </div>
        <div>
          <div className="font-medium text-gray-500">Equipment</div>
          <div className="text-gray-900">{rca.equipmentId || 'N/A'}</div>
        </div>
        <div>
          <div className="font-medium text-gray-500">Lead Investigator</div>
          <div className="text-gray-900">{rca.leadInvestigatorId ? `ID: ${rca.leadInvestigatorId}` : 'N/A'}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Users size={16} className="text-gray-400" />
          {rca.assignedToIds && rca.assignedToIds.length > 0 ? (
            <span className="text-sm text-gray-500">
              Assigned IDs: {rca.assignedToIds.join(', ')} ({rca.assignedToIds.length})
            </span>
          ) : (
            <span className="text-sm text-gray-500">Not assigned</span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          Last updated {formatDate(rca.updatedAt.toString())} {/* Ensure updatedAt is string */}
        </div>
      </div>
    </div>
  );
};

export default ActiveIncidents;