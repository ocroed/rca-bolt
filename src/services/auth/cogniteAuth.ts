import type { Configuration, AccountInfo } from '@azure/msal-browser';
import { PublicClientApplication, InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';
import { CogniteClient } from '@cognite/sdk';

const { VITE_APP_CLUSTER, VITE_APP_CLIENT_ID, VITE_APP_TENANT_ID, VITE_APP_REDIRECT_URI, VITE_APP_PROJECT } =
  import.meta.env;

const SESSION_STORAGE_ACCOUNT_KEY = 'cognite_account_id';
const baseUrl = `https://${VITE_APP_CLUSTER}.cognitedata.com`;
const scopes: string[] = [`${baseUrl}/.default`];

const configuration: Configuration = {
  auth: {
    clientId: VITE_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${VITE_APP_TENANT_ID}`,
    redirectUri: VITE_APP_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const pca = new PublicClientApplication(configuration);

const getToken = async () => {
  try {
    const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
    const account = accountId ? pca.getAccount({ localAccountId: accountId }) : null;

    if (!account) {
      throw new Error('No account found. Please login again.');
    }

    const token = await pca.acquireTokenSilent({
      account,
      scopes,
    });
    
    return token.accessToken;
  } catch (error) {
    console.debug('Silent token acquisition failed:', error);
    throw error;
  }
};

export function getClient() {
  const client = new CogniteClient({
    appId: VITE_APP_CLIENT_ID,
    baseUrl,
    project: VITE_APP_PROJECT,
    getToken,
  });

  return client;
}

export class CogniteAuthService {
  private pca: PublicClientApplication;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private loginInProgress = false;
  private logoutInProgress = false;

  constructor() {
    this.pca = pca;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.pca.initialize().then(() => {
      this.initialized = true;
    });

    return this.initializationPromise;
  }

  async login() {
    await this.initialize();
    
    // Prevent multiple concurrent login attempts
    if (this.loginInProgress) {
      throw new Error('Login is already in progress. Please wait...');
    }

    try {
      this.loginInProgress = true;

      // Check if user is already authenticated
      const accounts = this.pca.getAllAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, account.localAccountId ?? '');
        return { account };
      }

      // Use redirect for authentication - more reliable than popup
      await this.pca.loginRedirect({
        scopes,
        prompt: 'select_account',
      });
      
      // Note: This won't return anything as the page will redirect
      // The response will be handled in handleRedirectResponse()

    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle specific MSAL errors
      if (error instanceof BrowserAuthError) {
        if (error.errorCode === 'interaction_in_progress') {
          throw new Error('Another login process is already running. Please wait and try again.');
        }
      }
      
      throw error;
    } finally {
      this.loginInProgress = false;
    }
  }

  async logout() {
    await this.initialize();
    
    if (this.logoutInProgress) {
      return;
    }

    try {
      this.logoutInProgress = true;
      
      const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
      const account = accountId ? this.pca.getAccount({ localAccountId: accountId }) : null;
      
      // Clear local storage first
      localStorage.removeItem(SESSION_STORAGE_ACCOUNT_KEY);
      
      if (account) {
        // Use redirect logout for consistency
        await this.pca.logoutRedirect({
          account,
          postLogoutRedirectUri: window.location.origin,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we've cleared local storage
    } finally {
      this.logoutInProgress = false;
    }
  }

  async getAccount(): Promise<AccountInfo | null> {
    await this.initialize();
    
    const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
    if (accountId) {
      const account = this.pca.getAccount({ localAccountId: accountId });
      if (account) {
        return account;
      }
    }

    // Fallback: check all accounts
    const accounts = this.pca.getAllAccounts();
    if (accounts.length > 0) {
      const account = accounts[0];
      localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, account.localAccountId ?? '');
      return account;
    }

    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.initialize();
      
      const account = await this.getAccount();
      if (!account) {
        return false;
      }

      // Verify the account is still valid by attempting silent token acquisition
      try {
        await this.pca.acquireTokenSilent({
          account,
          scopes,
        });
        return true;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // Token expired or requires interaction - user needs to login again
          localStorage.removeItem(SESSION_STORAGE_ACCOUNT_KEY);
          return false;
        }
        // Other errors might be temporary, assume authenticated
        return true;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  async handleRedirectResponse() {
    await this.initialize();
    
    try {
      const response = await this.pca.handleRedirectPromise();
      if (response && response.account) {
        localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, response.account.localAccountId ?? '');
        return response;
      }
      return response;
    } catch (error) {
      console.error('Error handling redirect response:', error);
      throw error;
    }
  }

  // Method to clear all authentication state (for error recovery)
  async clearAuthState() {
    try {
      localStorage.removeItem(SESSION_STORAGE_ACCOUNT_KEY);
      
      // Clear all MSAL cache
      const accounts = this.pca.getAllAccounts();
      for (const account of accounts) {
        try {
          await this.pca.logoutSilent({ account });
        } catch (error) {
          // Ignore silent logout errors during cleanup
          console.debug('Silent logout failed during cleanup:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      await this.initialize();
      const account = await this.getAccount();
      
      if (!account) {
        return { status: 'unhealthy', details: 'No authenticated account found' };
      }

      // Try to get a token
      await this.pca.acquireTokenSilent({
        account,
        scopes,
      });

      return { status: 'healthy', details: 'Authentication is working correctly' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const authService = new CogniteAuthService();