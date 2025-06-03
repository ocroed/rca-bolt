import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { mockRCAs } from '../../data/mockData';
import { 
  formatDate, 
  getStatusColor, 
  getSeverityInfo, 
  formatCurrency 
} from '../../utils/formatters';

const RecentRCAs: React.FC = () => {
  // Sort RCAs by updatedAt date (most recent first)
  const sortedRCAs = [...mockRCAs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5); // Take most recent 5
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent RCA Activity</h2>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          View all <ArrowRight size={16} className="ml-1" />
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedRCAs.map(rca => {
              const severityInfo = getSeverityInfo(rca.impact.severityLevel);
              
              return (
                <tr key={rca.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">{rca.id}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-start">
                      {rca.impact.severityLevel >= 4 && (
                        <AlertTriangle size={16} className="text-red-500 mr-1.5 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={rca.title}>
                          {rca.title}
                        </div>
                        <div className="text-xs text-gray-500">{rca.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rca.status)}`}>
                      {rca.status.charAt(0).toUpperCase() + rca.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">{formatDate(rca.updatedAt)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md border ${severityInfo.color}`}>
                      {severityInfo.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-right text-red-600">
                    {formatCurrency(rca.impact.financialCost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRCAs;