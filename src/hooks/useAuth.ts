import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth/cogniteAuth';
import type { AccountInfo } from '@azure/msal-browser';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountInfo | null;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      // Handle any redirect response first
      await authService.handleRedirectResponse();
      
      // Check authentication status
      const authenticated = await authService.isAuthenticated();
      
      let user = null;
      if (authenticated) {
        user = await authService.getAccount();
        if (!user) {
          // If we think we're authenticated but can't get account, clear state
          await authService.clearAuthState();
          updateState({ 
            isAuthenticated: false, 
            user: null, 
            isLoading: false,
            error: 'Authentication state was corrupted and has been cleared. Please login again.'
          });
          return;
        }
      }

      updateState({
        isAuthenticated: authenticated,
        user,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      updateState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication initialization failed',
      });
    }
  }, [updateState]);

  const login = useCallback(async () => {
    try {
      updateState({ error: null });
      
      const response = await authService.login();
      
      updateState({
        isAuthenticated: true,
        user: response.account,
        error: null,
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateState({ error: errorMessage });
      throw error;
    }
  }, [updateState]);

  const logout = useCallback(async () => {
    try {
      updateState({ error: null });
      
      await authService.logout();
      
      updateState({
        isAuthenticated: false,
        user: null,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      updateState({
        isAuthenticated: false,
        user: null,
        error: 'Logout may have failed, but you have been signed out locally.',
      });
    }
  }, [updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const retryAuth = useCallback(async () => {
    await authService.clearAuthState();
    await initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...state,
    login,
    logout,
    clearError,
    retryAuth,
  };
};