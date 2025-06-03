import React from 'react';
import { mockRCAs } from '../../data/mockData';
import { getStatusColor } from '../../utils/formatters';
import type { RCAStatus } from '../../types';

const StatusDistribution: React.FC = () => {
  // Count RCAs by status
  const statusCounts = mockRCAs.reduce((acc, rca) => {
    acc[rca.status] = (acc[rca.status] || 0) + 1;
    return acc;
  }, {} as Record<RCAStatus, number>);
  
  // Calculate percentages and prepare data for rendering
  const total = mockRCAs.length;
  const statusData = [
    { status: 'draft', label: 'Draft', count: statusCounts.draft || 0 },
    { status: 'in-progress', label: 'In Progress', count: statusCounts['in-progress'] || 0 },
    { status: 'review', label: 'Under Review', count: statusCounts.review || 0 },
    { status: 'completed', label: 'Completed', count: statusCounts.completed || 0 },
    { status: 'archived', label: 'Archived', count: statusCounts.archived || 0 }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">RCA Status Distribution</h2>
      
      <div className="flex h-8 w-full rounded-md overflow-hidden mb-4">
        {statusData.map(item => {
          // Skip rendering if count is 0
          if (item.count === 0) return null;
          
          const percentage = (item.count / total) * 100;
          const widthStyle = { width: `${percentage}%` };
          const statusColorClass = getStatusColor(item.status);
          
          return (
            <div 
              key={item.status} 
              className={`h-full ${statusColorClass}`} 
              style={widthStyle}
              title={`${item.label}: ${item.count} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {statusData.map(item => (
          <div key={item.status} className="text-center">
            <div className="flex items-center justify-center">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(item.status)}`} />
              <span className="ml-1.5 text-sm font-medium">{item.label}</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-semibold">{item.count}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({total > 0 ? ((item.count / total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDistribution;