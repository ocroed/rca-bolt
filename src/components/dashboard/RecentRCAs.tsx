import React, { useEffect, useState } from 'react';
import { ArrowRight, AlertTriangle, Loader2, AlertCircle, ListX } from 'lucide-react';
import { api } from '../../services/api';
import { 
  formatDate, 
  getStatusColor, 
  getSeverityInfo, 
  formatCurrency 
} from '../../utils/formatters';
import type { RCA } from '../../types/models';

const RecentRCAs: React.FC = () => {
  const [recentRCAs, setRecentRCAs] = useState<RCA[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentRCAs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRCAs = await api.rca.getAll();
        const sortedRCAs = [...allRCAs]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5); // Take most recent 5
        setRecentRCAs(sortedRCAs);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching recent RCAs.');
        }
        console.error("Failed to fetch recent RCAs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentRCAs();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 min-h-[200px] flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="ml-2 text-gray-600">Loading recent RCAs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
        <AlertCircle size={20} className="mr-2" />
        <p><span className="font-semibold">Error:</span> {error}</p>
      </div>
    );
  }

  if (recentRCAs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 min-h-[200px] flex flex-col justify-center items-center text-center">
        <ListX size={32} className="text-gray-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-700">No Recent RCA Activity</h3>
        <p className="text-sm text-gray-500">There are no RCAs to display at the moment.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent RCA Activity</h2>
        {/* This link should ideally go to a page showing all RCAs */}
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          View all <ArrowRight size={16} className="ml-1" />
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Dept.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentRCAs.map(rca => {
              const severityInfo = getSeverityInfo(rca.impact.severityLevel);
              
              return (
                <tr key={rca.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{rca.id}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-start">
                      {rca.impact.severityLevel >= 4 && ( // Assuming 4+ is high enough for alert icon
                        <AlertTriangle size={16} className="text-red-500 mr-1.5 mt-0.5 flex-shrink-0" title="High Severity" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={rca.title}>
                          {rca.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          Dept: {rca.departmentId} {/* Displaying departmentId */}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rca.status)}`}>
                      {rca.status.charAt(0).toUpperCase() + rca.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(rca.updatedAt.toString())}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md border ${severityInfo.color}`}>
                      {severityInfo.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-right text-red-600 whitespace-nowrap">
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