import React from 'react';
import { mockRCAs } from '../../data/mockData';

const ImpactChart: React.FC = () => {
  // Sort RCAs by financial impact (highest to lowest)
  const sortedRCAs = [...mockRCAs]
    .sort((a, b) => b.impact.financialCost - a.impact.financialCost)
    .slice(0, 5); // Take top 5
  
  // Find maximum value for scaling
  const maxImpact = Math.max(...sortedRCAs.map(rca => rca.impact.financialCost));
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Highest Financial Impact RCAs</h2>
      
      <div className="space-y-4">
        {sortedRCAs.map(rca => {
          // Calculate width percentage based on max impact
          const widthPercentage = (rca.impact.financialCost / maxImpact) * 100;
          
          // Determine color based on severity
          const barColor = 
            rca.impact.severityLevel >= 4 ? 'bg-red-500' :
            rca.impact.severityLevel === 3 ? 'bg-amber-500' : 'bg-blue-500';
            
          return (
            <div key={rca.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate" title={rca.title}>
                  {rca.title.length > 30 ? rca.title.substring(0, 30) + '...' : rca.title}
                </span>
                <span className="text-gray-600">
                  ${(rca.impact.financialCost / 1000).toFixed(1)}k
                </span>
              </div>
              
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{rca.department}</span>
                <span>{formatDowntime(rca.impact.downtimeDays)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatDowntime = (days: number): string => {
  if (days < 1/24) {
    // Less than 1 hour
    const minutes = Math.round(days * 24 * 60);
    return `${minutes} min`;
  } else if (days < 1) {
    // Less than 1 day
    const hours = Math.round(days * 24);
    return `${hours} hr`;
  } else {
    // 1 day or more
    return `${days.toFixed(1)} days`;
  }
};

export default ImpactChart;