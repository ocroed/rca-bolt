import { CogniteClient } from '@cognite/sdk';

const APP_NAME = 'RCA-Dashboard-App-Placeholder'; // Placeholder - User should replace
const PROJECT_NAME = 'YOUR_PROJECT_NAME_PLACEHOLDER'; // Placeholder - User should replace
const CLUSTER = 'YOUR_CLUSTER_PLACEHOLDER'; // e.g., 'westeurope-1', 'api', etc. - User should replace
// IMPORTANT: Replace with actual authentication method.
// Using a placeholder API key for now.
// For production, consider using OAuth 2.0 client credentials or other secure methods.
const API_KEY = 'YOUR_API_KEY_PLACEHOLDER'; // Placeholder - User should replace

const cogniteClient = new CogniteClient({
  appId: APP_NAME,
  project: PROJECT_NAME,
  baseUrl: `https://${CLUSTER}.cognitedata.com`,
  getToken: async () => {
    // IMPORTANT: This is a placeholder for API key authentication.
    // If using an API key, it's typically passed directly or via a more secure mechanism.
    // For OAuth, this function would handle the token fetching and refreshing logic.
    // DO NOT commit actual API keys directly into source code in a real application.
    // Consider environment variables or a configuration service.
    if (API_KEY === 'YOUR_API_KEY_PLACEHOLDER' || !API_KEY) {
      console.warn('Using placeholder API key for Cognite SDK. Please configure actual credentials.');
      // Optionally, you could prevent SDK initialization if no real key is provided,
      // but for now, we'll let it proceed with a non-functional placeholder.
      // throw new Error("Cognite API Key not configured.");
    }
    return `Bearer ${API_KEY}`;
  },
});

// You can add a simple test call here to verify basic configuration,
// but it will likely fail until placeholders are replaced.
// Example (optional, and will fail with placeholders):
/*
cogniteClient.login.status()
  .then(status => console.log('Cognite SDK login status:', status))
  .catch(err => console.error('Cognite SDK login failed:', err.message));
*/

export default cogniteClient;
