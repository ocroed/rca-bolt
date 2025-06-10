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

      // Handle any redirect response first - this is crucial for redirect flow
      const redirectResponse = await authService.handleRedirectResponse();
      
      // If we just handled a successful redirect, the user is now authenticated
      if (redirectResponse && redirectResponse.account) {
        updateState({
          isAuthenticated: true,
          user: redirectResponse.account,
          isLoading: false,
          error: null,
        });
        return;
      }
      
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
            error: null, // Don't show error for this case, just require re-login
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
      
      // For redirect flow, this will redirect the page
      // So we won't get a response back immediately
      await authService.login();
      
      // This code won't execute for redirect flow
      // The response will be handled when the page loads after redirect
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateState({ error: errorMessage });
      throw error;
    }
  }, [updateState]);

  const logout = useCallback(async () => {
    try {
      updateState({ error: null });
      
      // For redirect flow, this will redirect the page
      await authService.logout();
      
      // This code won't execute for redirect flow
      
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