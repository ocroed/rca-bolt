import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  Users, 
  Calendar, 
  AlertTriangle,
  FileBarChart
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const location = useLocation();
  
  return (
    <aside className={`bg-gray-900 text-white fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <div className="flex items-center">
            <FileBarChart size={24} className="text-blue-400" />
            <span className="ml-2 text-xl font-bold">RCA Center</span>
          </div>
        </div>
        
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
            Main
          </div>
          
          <SidebarLink 
            to="/dashboard"
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            isActive={location.pathname === '/dashboard'}
          />
          <SidebarLink 
            to="/active-incidents"
            icon={<AlertTriangle size={18} />} 
            label="Active Incidents" 
            isActive={location.pathname === '/active-incidents'}
          />
          <SidebarLink 
            to="/rca-database"
            icon={<FileText size={18} />} 
            label="RCA Database" 
          />
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase">
            Management
          </div>
          
          <SidebarLink 
            to="/team"
            icon={<Users size={18} />} 
            label="Team Management" 
          />
          <SidebarLink 
            to="/schedule"
            icon={<Calendar size={18} />} 
            label="Schedule" 
          />
          <SidebarLink 
            to="/reports"
            icon={<BarChart3 size={18} />} 
            label="Reports" 
          />
          <SidebarLink 
            to="/settings"
            icon={<Settings size={18} />} 
            label="Settings" 
          />
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-md p-3">
            <div className="text-sm font-medium">Need Help?</div>
            <div className="text-xs text-gray-400 mt-1">
              Check out our documentation or contact support for assistance.
            </div>
            <button className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded w-full transition duration-150">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'text-white bg-gray-800'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto h-2 w-2 rounded-full bg-blue-400"></span>
      )}
    </Link>
  );
};

export default Sidebar;