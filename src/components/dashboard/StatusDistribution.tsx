import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getStatusColor } from '../../utils/formatters';
import type { RCA, RCAStatus } from '../../types/models'; // Updated to import RCA
import { Loader2, AlertCircle, PieChart } from 'lucide-react';

interface StatusDistributionItem {
  status: RCAStatus;
  label: string;
  count: number;
  percentage: number;
}

const STATUS_ORDER: RCAStatus[] = ['draft', 'in-progress', 'review', 'completed', 'archived'];
const STATUS_LABELS: Record<RCAStatus, string> = {
  'draft': 'Draft',
  'in-progress': 'In Progress',
  'review': 'Under Review',
  'completed': 'Completed',
  'archived': 'Archived',
};

const StatusDistribution: React.FC = () => {
  const [statusDistributionData, setStatusDistributionData] = useState<StatusDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRCAs, setTotalRCAs] = useState<number>(0);

  useEffect(() => {
    const fetchStatusData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRCAs = await api.rca.getAll();
        setTotalRCAs(allRCAs.length);

        if (allRCAs.length === 0) {
          setStatusDistributionData([]);
          setIsLoading(false);
          return;
        }

        const counts = allRCAs.reduce((acc, rca) => {
          acc[rca.status] = (acc[rca.status] || 0) + 1;
          return acc;
        }, {} as Record<RCAStatus, number>);

        const data = STATUS_ORDER.map(status => {
          const count = counts[status] || 0;
          return {
            status,
            label: STATUS_LABELS[status],
            count,
            percentage: allRCAs.length > 0 ? (count / allRCAs.length) * 100 : 0,
          };
        });

        setStatusDistributionData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching status distribution.');
        }
        console.error("Failed to fetch status distribution data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 min-h-[200px] flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="ml-2 text-gray-600">Loading status distribution...</p>
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

  if (statusDistributionData.length === 0 || totalRCAs === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 min-h-[200px] flex flex-col justify-center items-center text-center">
        <PieChart size={32} className="text-gray-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-700">No Status Data Available</h3>
        <p className="text-sm text-gray-500">There are no RCAs to display status distribution for.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">RCA Status Distribution</h2>
      
      <div className="flex h-8 w-full rounded-md overflow-hidden mb-4" role="progressbar" aria-label="RCA Status Distribution Bar">
        {statusDistributionData.map(item => {
          if (item.count === 0) return null; // Don't render segments with zero count
          
          const statusColorClass = getStatusColor(item.status);
          
          return (
            <div 
              key={item.status} 
              className={`h-full ${statusColorClass}`} 
              style={{ width: `${item.percentage}%` }}
              title={`${item.label}: ${item.count} (${item.percentage.toFixed(1)}%)`}
              aria-label={`${item.label}: ${item.percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
        {statusDistributionData.map(item => (
          <div key={item.status} className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(item.status)} flex-shrink-0`} />
              <span className="ml-1.5 text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-semibold text-gray-900">{item.count}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDistribution;