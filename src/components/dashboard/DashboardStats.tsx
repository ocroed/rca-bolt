import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { mockRCAs } from '../../data/mockData';
import { 
  formatCurrency, 
  formatDowntime, 
  calculateTotalImpact, 
  calculateTotalDowntime 
} from '../../utils/formatters';

const DashboardStats: React.FC = () => {
  const totalImpact = calculateTotalImpact(mockRCAs);
  const totalDowntime = calculateTotalDowntime(mockRCAs);
  
  const ongoingRCAs = mockRCAs.filter(rca => 
    rca.status === 'draft' || rca.status === 'in-progress' || rca.status === 'review'
  );
  
  const completedRCAs = mockRCAs.filter(rca => 
    rca.status === 'completed' || rca.status === 'archived'
  );
  
  const criticalRCAs = mockRCAs.filter(rca => rca.impact.severityLevel >= 4);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Financial Impact"
        value={formatCurrency(totalImpact)}
        icon={<TrendingDown className="text-red-500\" size={24} />}
        trend="12.5% increase from last quarter"
        trendUp={false}
      />
      
      <StatCard 
        title="Total Downtime"
        value={formatDowntime(totalDowntime)}
        icon={<Clock className="text-amber-500\" size={24} />}
        trend="3.2 days less than previous quarter"
        trendUp={true}
      />
      
      <StatCard 
        title="Ongoing RCAs"
        value={ongoingRCAs.length.toString()}
        icon={<AlertTriangle className="text-blue-500\" size={24} />}
        trend={`${ongoingRCAs.length} requiring immediate attention`}
        trendUp={null}
      />
      
      <StatCard 
        title="Completed RCAs"
        value={completedRCAs.length.toString()}
        icon={<CheckCircle className="text-green-500\" size={24} />}
        trend={`${criticalRCAs.length} critical issues resolved`}
        trendUp={true}
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