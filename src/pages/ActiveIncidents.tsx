import React, { useState } from 'react';
import { AlertTriangle, Filter, SortAsc, Clock, MapPin } from 'lucide-react';
import { mockRCAs } from '../data/mockData';
import { formatDate, formatCurrency, getSeverityInfo } from '../utils/formatters';
import { useFilteredIncidents } from '../hooks/useFilteredIncidents';
import type { RootCauseAnalysis } from '../types';

const ActiveIncidents: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<number | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'impact'>('date');

  const { filteredIncidents, uniqueLocations } = useFilteredIncidents({
    allIncidents: mockRCAs,
    filterSeverity,
    filterLocation,
    sortBy,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="mr-2 text-amber-500" />
            Active Incidents
          </h1>
          <p className="text-gray-600">Monitoring {filteredIncidents.length} active RCAs</p>
        </div>

        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin size={18} className="text-gray-500" />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {/* <option value="all">All Locations</option> uniqueLocations from hook includes 'all' */}
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="5">Critical Only</option>
              <option value="4">Major & Critical</option>
              <option value="3">Moderate & Above</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <SortAsc size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="date">Latest Updated</option>
              <option value="severity">Severity</option>
              <option value="impact">Financial Impact</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredIncidents.map(rca => (
          <IncidentCard key={rca.id} rca={rca} />
        ))}
      </div>
    </div>
  );
};

const IncidentCard: React.FC<{ rca: RootCauseAnalysis }> = ({ rca }) => {
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
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{rca.title}</h3>
          <p className="text-gray-600 mt-1">{rca.description}</p>
        </div>
        <div className="text-right">
          <div className="text-red-600 font-semibold">{formatCurrency(rca.impact.financialCost)}</div>
          <div className="text-sm text-gray-500">Financial Impact</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-gray-500">Department</div>
          <div className="text-gray-900">{rca.department}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Location</div>
          <div className="text-gray-900">{rca.location || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Equipment</div>
          <div className="text-gray-900">{rca.equipment || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Lead Investigator</div>
          <div className="text-gray-900">{rca.leadInvestigator.name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {rca.assignedTo.map((member, index) => (
              <div
                key={member.id}
                className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                title={member.name}
              >
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {rca.assignedTo.length} team members assigned
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          Last updated {formatDate(rca.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default ActiveIncidents;