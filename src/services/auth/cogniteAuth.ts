import type { Configuration } from '@azure/msal-browser';
import { PublicClientApplication } from '@azure/msal-browser';
import { CogniteClient } from '@cognite/sdk';

const { VITE_APP_CLUSTER, VITE_APP_CLIENT_ID, VITE_APP_TENANT_ID, VITE_APP_REDIRECT_URI, VITE_APP_PROJECT } =
  import.meta.env;

const SESSION_STORAGE_ACCOUNT_KEY = 'account';
const baseUrl = `https://${VITE_APP_CLUSTER}.cognitedata.com`;
const scopes: string[] = [`${baseUrl}/.default`];

const configuration: Configuration = {
  auth: {
    clientId: VITE_APP_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${VITE_APP_TENANT_ID}`,
    redirectUri: VITE_APP_REDIRECT_URI,
  },
};

const pca = new PublicClientApplication(configuration);

const getToken = async () => {
  try {
    await pca.initialize();
    const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
    const account = (accountId ? pca.getAccount({ localAccountId: accountId }) : undefined) ?? undefined;

    const redirectResponse = await pca.handleRedirectPromise();
    if (redirectResponse !== null) {
      const response = redirectResponse;
      localStorage.setItem('account', response.account.localAccountId ?? '');
      return response.accessToken;
    }
    try {
      const token = await pca.acquireTokenSilent({
        account,
        scopes,
      });
      localStorage.setItem('account', token.account.localAccountId ?? '');
      return token.accessToken;
    } catch (e) {
      // Don't initiate interactive authentication here to avoid conflicts
      // Let the LoginPage handle interactive authentication via loginPopup
      throw new Error('Silent token acquisition failed. Interactive login required.');
    }
  } catch (e) {
    console.debug('Failed to get token', e);
    throw e;
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

  constructor() {
    this.pca = pca;
  }

  async initialize() {
    if (!this.initialized) {
      await this.pca.initialize();
      this.initialized = true;
    }
  }

  async login() {
    await this.initialize();
    try {
      const response = await this.pca.loginPopup({
        scopes,
      });
      localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, response.account.localAccountId ?? '');
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    await this.initialize();
    const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
    const account = accountId ? this.pca.getAccount({ localAccountId: accountId }) : null;
    
    if (account) {
      await this.pca.logoutPopup({
        account,
      });
    }
    localStorage.removeItem(SESSION_STORAGE_ACCOUNT_KEY);
  }

  async getAccount() {
    await this.initialize();
    const accountId = localStorage.getItem(SESSION_STORAGE_ACCOUNT_KEY);
    return accountId ? this.pca.getAccount({ localAccountId: accountId }) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const account = await this.getAccount();
    return account !== null;
  }

  async handleRedirectResponse() {
    await this.initialize();
    const response = await this.pca.handleRedirectPromise();
    if (response) {
      localStorage.setItem(SESSION_STORAGE_ACCOUNT_KEY, response.account.localAccountId ?? '');
    }
    return response;
  }
}

export const authService = new CogniteAuthService();