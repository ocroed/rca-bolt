import React from 'react';
import { Menu, Bell, ChevronDown, Search, LogOut } from 'lucide-react';
import { calculateTotalImpact, formatCurrency } from '../../utils/formatters';
import { mockRCAs } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const totalImpact = calculateTotalImpact(mockRCAs);
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-2 lg:px-6">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 mr-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              RCA <span className="text-blue-700">Center</span>
            </h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-1.5 flex-1 max-w-xl mx-4">
          <Search size={18} className="text-gray-500 mr-2" />
          <input 
            type="text"
            placeholder="Search RCAs, findings, equipment..."
            className="bg-transparent border-none outline-none w-full text-sm text-gray-600 placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="text-sm text-gray-600">
              Total Financial Impact
            </div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(totalImpact)}
            </div>
          </div>
          
          <button className="p-2 relative rounded-full bg-gray-100 hover:bg-gray-200">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="flex items-center relative group">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-2 hidden md:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">Authenticated</div>
            </div>
            <ChevronDown size={16} className="ml-1 text-gray-500" />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;