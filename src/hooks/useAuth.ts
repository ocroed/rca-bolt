import { useState, useEffect } from 'react';
import { authService } from '../services/auth/cogniteAuth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Handle redirect response first
        await authService.handleRedirectResponse();
        
        // Check if user is authenticated
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const account = await authService.getAccount();
          setUser(account);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    try {
      const response = await authService.login();
      setIsAuthenticated(true);
      setUser(response.account);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
};