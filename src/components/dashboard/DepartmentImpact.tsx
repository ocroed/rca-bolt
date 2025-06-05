import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type { RCA } from '../../types/models';
import { Loader2, AlertCircle, BarChartHorizontalBig } from 'lucide-react';

interface DepartmentImpactData {
  departmentId: string;
  totalImpact: number;
  rcaCount: number;
}

const DepartmentImpact: React.FC = () => {
  const [departmentImpactData, setDepartmentImpactData] = useState<DepartmentImpactData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartmentImpact = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRCAs = await api.rca.getAll();

        const impactByDept = allRCAs.reduce((acc, rca) => {
          const deptId = rca.departmentId || 'Unknown Department';
          if (!acc[deptId]) {
            acc[deptId] = { totalImpact: 0, rcaCount: 0 };
          }
          acc[deptId].totalImpact += rca.impact.financialCost || 0;
          acc[deptId].rcaCount += 1;
          return acc;
        }, {} as Record<string, { totalImpact: number; rcaCount: number }>);

        const formattedData = Object.entries(impactByDept)
          .map(([departmentId, data]) => ({
            departmentId,
            ...data,
          }))
          .sort((a, b) => b.totalImpact - a.totalImpact);

        setDepartmentImpactData(formattedData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while calculating department impact.');
        }
        console.error("Failed to fetch or process department impact data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentImpact();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 min-h-[200px] flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="ml-2 text-gray-600">Loading department impact...</p>
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

  if (departmentImpactData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 min-h-[200px] flex flex-col justify-center items-center text-center">
        <BarChartHorizontalBig size={32} className="text-gray-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-700">No Department Impact Data</h3>
        <p className="text-sm text-gray-500">Could not find any RCAs with department information.</p>
      </div>
    );
  }
  
  const maxTotalImpact = Math.max(...departmentImpactData.map(item => item.totalImpact), 0); // Ensure max is at least 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact by Department</h2>
      
      <div className="space-y-5">
        {departmentImpactData.map((item, index) => {
          const widthPercentage = maxTotalImpact > 0 ? (item.totalImpact / maxTotalImpact) * 100 : 0;
          
          // Consistent color generation based on departmentId
          let hash = 0;
          for (let i = 0; i < item.departmentId.length; i++) {
            hash = item.departmentId.charCodeAt(i) + ((hash << 5) - hash);
          }
          const colorIndex = Math.abs(hash % 5); // Keep 5 colors
          const colorClasses = [
            'bg-blue-500',
            'bg-indigo-500',
            'bg-purple-500',
            'bg-green-500',
            'bg-amber-500'
          ];
          
          return (
            <div key={item.departmentId}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${colorClasses[colorIndex]} mr-2`} />
                  <span className="text-sm font-medium">{item.departmentId}</span>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatCurrency(item.totalImpact)}
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
                  {item.rcaCount} RCA{item.rcaCount === 1 ? '' : 's'}
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