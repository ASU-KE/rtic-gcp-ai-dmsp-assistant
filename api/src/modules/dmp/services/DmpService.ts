import NodeCache from 'node-cache';
import { URLSearchParams } from 'url';
import config from '../../../config/app.config';

interface DmpApiResponse {
  items: {
    dmp: {
      dmproadmap_related_identifiers: { identifier: string }[];
    };
  }[];
}

interface OAuthResponse {
  access_token: string;
  expires_in: number;
}

// cache DMPTool API Oauth2 token
const cache = new NodeCache({ stdTTL: 600 });

export default {
  getDmpResource: async (dmpId: string): Promise<string> => {
    const {
      endpoints: { authEndpoint, getDmpEndpoint },
      dmptoolClientId,
      dmptoolClientSecret,
    } = config;

    // get Bearer token for authentication
    const bearerToken = Buffer.from(
      `${dmptoolClientId}:${dmptoolClientSecret}`
    ).toString('base64');

    // Request Oauth2 token from DMPTool service
    let token = cache.get<string>('TOKEN') ?? null;
    const tokenTimestamp = cache.get<number>('TIMESTAMP') ?? Date.now();
    const tokenExpires = cache.get<number>('TTL') ?? 600;

    const tokenAge = (Date.now() - tokenTimestamp) / 1000;
    if (tokenAge > tokenExpires || token === null) {
      // fetch Oauth2 access token
      try {
        const headers = new Headers();
        headers.append('Authorization', `Basic ${bearerToken}`);

        // api endpoint requires the body to be submitted as a form
        const formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        formData.append(
          'scope',
          'https://auth.dmphub.uc3prd.cdlib.net/prd.read'
        );

        const response = await fetch(authEndpoint, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const err: HttpError = new Error(
            `Network response was not ok: ${response.status}`
          );
          err.status = 500;
          throw err;
        }

        const data = (await response.json()) as OAuthResponse;

        token = data.access_token;
        cache.set('TOKEN', token);
        cache.set('TTL', data.expires_in);
        cache.set('TIMESTAMP', Date.now());
      } catch (error: unknown) {
        console.error('There was a problem fetching the data:', error);
        throw error;
      }
    }

    try {
      const headers = new Headers();
      const cachedToken = cache.get<string>('TOKEN') ?? '';
      headers.append('Authorization', `Bearer ${cachedToken}`);
      headers.append('Accept', `application/json`);
      headers.append('Content-Type', `application/json`);

      const response = await fetch(`${getDmpEndpoint}/${dmpId}`, {
        headers,
      });

      if (!response.ok) {
        const err: HttpError = new Error(
          `DMP fetch failed: ${response.status}`
        );
        err.status = 500;
        throw err;
      }

      const data = (await response.json()) as DmpApiResponse;
      // check if requested DMP ID returned a record
      if (!data.items?.[0]) {
        const err: HttpError = new Error('Requested DMP not found.');
        err.status = 404;
        throw err;
      }

      const identifiers = data.items[0].dmp.dmproadmap_related_identifiers;

      if (!Array.isArray(identifiers) || identifiers.length === 0) {
        const err: HttpError = new Error('No related identifiers found.');
        err.status = 404;
        throw err;
      }

      // due to bug in api (as of 10/1/2024), the active version of a DMP is the last element
      // in the dmproadmap_related_identifiers array.
      // pop() is the most efficient (fast) method to access the last element of an array
      const plan = identifiers[identifiers.length - 1];

      return plan.identifier;
    } catch (error: unknown) {
      console.error('Error fetching DMP resource:', error);
      throw error;
    }
  },
};
