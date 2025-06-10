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
  system: {
    allowNativeBroker: false,
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
  }
};

const pca = new PublicClientApplication(configuration);

const getToken = async () => {
  try {
    await pca.initialize();
    const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
    const account = accountId ? pca.getAccount({ localAccountId: accountId }) : null;

    // Handle redirect response first
    const redirectResponse = await pca.handleRedirectPromise();
    if (redirectResponse !== null && redirectResponse.account) {
      localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, redirectResponse.account.localAccountId || '');
      return redirectResponse.accessToken;
    }

    if (!account) {
      throw new Error('No account found. Please login again.');
    }

    try {
      const token = await pca.acquireTokenSilent({
        account,
        scopes,
      });
      localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, token.account.localAccountId || '');
      return token.accessToken;
    } catch (error) {
      // If acquireTokenSilent fails, throw the error to let the main auth flow handle user interaction
      // Do not call acquireTokenRedirect here as it can cause MSAL state issues
      throw error;
    }
  } catch (error) {
    console.debug('Failed to get token', error);
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

// Helper function to ensure we're in the top-level window
const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Helper function to break out of iframe if needed
const breakOutOfIframe = (): void => {
  if (isInIframe()) {
    try {
      if (window.top) {
        window.top.location.href = window.location.href;
      }
    } catch (e) {
      // If we can't access window.top, redirect current window
      window.location.href = window.location.href;
    }
  }
};

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
    
    // Check if we're in an iframe and break out if necessary
    if (isInIframe()) {
      console.warn('Application is running in iframe, breaking out to top-level window');
      breakOutOfIframe();
      return;
    }
    
    // Prevent multiple concurrent login attempts
    if (this.loginInProgress) {
      throw new Error('Login is already in progress. Please wait...');
    }

    try {
      this.loginInProgress = true;

      // Check if user is already authenticated
      const accounts = this.pca.getAllAccounts();
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        if (account && account.localAccountId) {
          localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, account.localAccountId);
          return { account };
        }
      }

      // Ensure we're in the top-level window before attempting redirect
      if (window.self !== window.top) {
        throw new Error('Redirect authentication must be initiated from the top-level window');
      }

      // Use redirect for authentication - more reliable than popup
      await this.pca.loginRedirect({
        scopes,
        prompt: 'select_account',
        redirectStartPage: window.location.href,
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
        if (error.errorCode === 'redirect_in_iframe') {
          // If we get this error, try to break out of iframe
          breakOutOfIframe();
          throw new Error('Application must run in the main browser window. Redirecting...');
        }
      }
      
      throw error;
    } finally {
      this.loginInProgress = false;
    }
  }

  async logout() {
    await this.initialize();
    
    // Check if we're in an iframe and break out if necessary
    if (isInIframe()) {
      console.warn('Application is running in iframe, breaking out to top-level window for logout');
      breakOutOfIframe();
      return;
    }
    
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
        // Ensure we're in the top-level window before attempting redirect
        if (window.self !== window.top) {
          throw new Error('Logout redirect must be initiated from the top-level window');
        }
        
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
    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      if (account && account.localAccountId) {
        localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, account.localAccountId);
        return account;
      }
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
        localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, response.account.localAccountId || '');
        return response;
      }
      return response;
    } catch (error) {
      console.error('Error handling redirect response:', error);
      
      // If we get iframe error during redirect handling, try to break out
      if (error instanceof BrowserAuthError && error.errorCode === 'redirect_in_iframe') {
        breakOutOfIframe();
      }
      
      throw error;
    }
  }

  // Method to clear all authentication state (for error recovery)
  async clearAuthState() {
    try {
      localStorage.removeItem(SESSION_STORAGE_ACCOUNT_KEY);
      
      // Clear all MSAL cache
      const accounts = this.pca.getAllAccounts();
      if (accounts && accounts.length > 0) {
        for (const account of accounts) {
          try {
            await this.pca.logoutSilent({ account });
          } catch (error) {
            // Ignore silent logout errors during cleanup
            console.debug('Silent logout failed during cleanup:', error);
          }
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
      
      // Check if we're in iframe
      if (isInIframe()) {
        return { 
          status: 'unhealthy', 
          details: 'Application is running in iframe - authentication may not work properly' 
        };
      }
      
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

  // Method to check if app is running in iframe
  isInIframe(): boolean {
    return isInIframe();
  }
}

export const authService = new CogniteAuthService();