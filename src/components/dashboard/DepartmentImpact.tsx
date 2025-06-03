import React from 'react';
import { mockRCAs } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

const DepartmentImpact: React.FC = () => {
  // Calculate impact by department
  const departmentImpact = mockRCAs.reduce((acc, rca) => {
    if (!acc[rca.department]) {
      acc[rca.department] = {
        financialCost: 0,
        downtimeDays: 0,
        count: 0
      };
    }
    
    acc[rca.department].financialCost += rca.impact.financialCost;
    acc[rca.department].downtimeDays += rca.impact.downtimeDays;
    acc[rca.department].count += 1;
    
    return acc;
  }, {} as Record<string, { financialCost: number; downtimeDays: number; count: number }>);
  
  // Convert to array and sort by financial impact
  const departmentData = Object.entries(departmentImpact)
    .map(([department, data]) => ({
      department,
      ...data
    }))
    .sort((a, b) => b.financialCost - a.financialCost);
  
  // Find max value for scaling
  const maxFinancialCost = Math.max(...departmentData.map(item => item.financialCost));
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact by Department</h2>
      
      <div className="space-y-5">
        {departmentData.map(item => {
          const widthPercentage = (item.financialCost / maxFinancialCost) * 100;
          
          // Generate a deterministic color based on department name
          const colorIndex = item.department.charCodeAt(0) % 5;
          const colorClasses = [
            'bg-blue-500',
            'bg-indigo-500',
            'bg-purple-500',
            'bg-green-500',
            'bg-amber-500'
          ];
          
          return (
            <div key={item.department}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${colorClasses[colorIndex]} mr-2`} />
                  <span className="text-sm font-medium">{item.department}</span>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatCurrency(item.financialCost)}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 mr-4">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClasses[colorIndex]} rounded-full transition-all duration-500`}
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {item.count} RCAs
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentImpact;