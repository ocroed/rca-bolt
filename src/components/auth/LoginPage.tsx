import React, { useState } from 'react';
import { FileBarChart, Loader2, AlertCircle, Building2, Shield } from 'lucide-react';
import { authService } from '../../services/auth/cogniteAuth';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login();
      // Note: loginRedirect will cause a page reload, so this code after login() may not execute
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to authenticate. Please check your credentials and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <FileBarChart size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RCA Center</h1>
          <p className="text-gray-600">Manufacturing Root Cause Analysis Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">
              Sign in with your Cognite Data Fusion account to continue
            </p>
          </div>

          {/* Features Preview */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 size={16} className="mr-3 text-blue-500" />
              <span>Access manufacturing data and analytics</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Shield size={16} className="mr-3 text-green-500" />
              <span>Secure enterprise authentication</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileBarChart size={16} className="mr-3 text-purple-500" />
              <span>Comprehensive RCA tracking and reporting</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign in with Microsoft'
            )}
          </button>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By signing in, you agree to access manufacturing data through Cognite Data Fusion.
              Contact your system administrator if you need access.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Powered by Cognite Data Fusion • Secure Industrial Data Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;