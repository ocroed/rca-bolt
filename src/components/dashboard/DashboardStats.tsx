import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { 
  formatCurrency, 
  formatDowntime
} from '../../utils/formatters';

interface DashboardStatsData {
  totalImpact: number;
  totalDowntime: number;
  ongoingCount: number;
  completedCount: number;
}

const DashboardStats: React.FC = () => {
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.rca.getDashboardStats();
        setStatsData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
        <AlertCircle size={20} className="mr-2" />
        <p><span className="font-semibold">Error:</span> {error}</p>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="col-span-full text-center py-10 text-gray-500">
        No dashboard statistics available.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Financial Impact"
        value={formatCurrency(statsData.totalImpact)}
        icon={<TrendingDown className="text-red-500" size={24} />}
        trend="Updated from live data" // Trend data source TBD
        trendUp={null} // Or determine based on comparison if available
      />
      
      <StatCard 
        title="Total Downtime"
        value={formatDowntime(statsData.totalDowntime)}
        icon={<Clock className="text-amber-500" size={24} />}
        trend="Updated from live data" // Trend data source TBD
        trendUp={null} // Or determine based on comparison if available
      />
      
      <StatCard 
        title="Ongoing RCAs"
        value={statsData.ongoingCount.toString()}
        icon={<AlertTriangle className="text-blue-500" size={24} />}
        trend={`${statsData.ongoingCount} requiring attention`}
        trendUp={null}
      />
      
      <StatCard 
        title="Completed RCAs"
        value={statsData.completedCount.toString()}
        icon={<CheckCircle className="text-green-500" size={24} />}
        trend={`${statsData.completedCount} issues resolved`} // Using completedCount for trend
        trendUp={true} // Assuming more completed is good
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean | null;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      
      <div className={`flex items-center text-xs ${
        trendUp === null 
          ? 'text-gray-500' 
          : trendUp 
            ? 'text-green-600' 
            : 'text-red-600'
      }`}>
        {trendUp !== null && (
          trendUp 
            ? <TrendingUp size={12} className="mr-1" /> 
            : <TrendingDown size={12} className="mr-1" />
        )}
        <span>{trend}</span>
      </div>
    </div>
  );
};

export default DashboardStats;