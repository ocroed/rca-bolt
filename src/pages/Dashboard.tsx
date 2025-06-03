import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import DashboardStats from '../components/dashboard/DashboardStats';
import StatusDistribution from '../components/dashboard/StatusDistribution';
import RecentRCAs from '../components/dashboard/RecentRCAs';
import ImpactChart from '../components/dashboard/ImpactChart';
import DepartmentImpact from '../components/dashboard/DepartmentImpact';
import CreateRCAModal, { RCAFormData } from '../components/modals/CreateRCAModal';

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRCA = (data: RCAFormData) => {
    // TODO: Implement RCA creation logic
    console.log('Creating new RCA:', data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of RCA status and impact metrics</p>
        </div>
        
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={20} className="mr-2" />
          <span className="font-medium">Create New RCA</span>
        </button>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentRCAs />
        </div>
        <div>
          <DepartmentImpact />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution />
        <ImpactChart />
      </div>

      <CreateRCAModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRCA}
      />
    </div>
  );
};

export default Dashboard;