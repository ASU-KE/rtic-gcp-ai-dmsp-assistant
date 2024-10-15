const NodeCache = require('node-cache');
const { URLSearchParams } = require('url');

module.exports = {
  getDmpResource: async (dmpId) => {
    const {
      endpoints: { authEndpoint },
      dmptoolClientId,
      dmptoolClientSecret,
    } = require('../../config');

    // get Bearer token for authentication
    const bearerToken = Buffer.from(
      `${dmptoolClientId}:${dmptoolClientSecret}`
    ).toString('base64');

    // cache DMPTool API Oauth2 token
    const cache = new NodeCache({ stdTTL: 600 });

    // Request Oauth2 token from DMPTool service
    const token = cache.get('TOKEN') ?? null;
    const tokenTimestamp = cache.get('TIMESTAMP') ?? Date(2010, 1, 1);
    const tokenExpires = cache.get('TTL') ?? 600;

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
          const err = new Error(
            `Network response was not ok: ${response.status}`
          );
          err.status = 500;
          throw err;
        }

        const data = await response.json();

        cache.set('TOKEN', data.access_token);
        cache.set('TTL', data.expires_in);
        cache.set('TIMESTAMP', Date.now());
      } catch (error) {
        console.error('There was a problem fetching the data:', error);
      }
    }

    // fetch the DMP record
    const {
      endpoints: { getDmpEndpoint },
    } = require('../../config');

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${cache.get('TOKEN')}`);
      headers.append('Accept', `application/json`);
      headers.append('Content-Type', `application/json`);

      const response = await fetch(`${getDmpEndpoint}/${dmpId}`, {
        headers,
      });

      if (!response.ok) {
        const err = new Error(
          `Network response was not ok: ${response.status}`
        );
        err.status = 500;
        throw err;
      }

      const data = await response.json();
      // check if requested DMP ID returned a record
      if (data.items[0] === null) {
        const err = new Error('Requested DMP not found.');
        err.status = 404;
        throw err;
      }

      // due to bug in api (as of 10/1/2024), the active version of a DMP is the last element
      // in the dmproadmap_related_identifiers array.
      // pop() is the most efficient (fast) method to access the last element of an array
      const plan = data.items[0]?.dmp.dmproadmap_related_identifiers.pop();

      return plan.identifier;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
