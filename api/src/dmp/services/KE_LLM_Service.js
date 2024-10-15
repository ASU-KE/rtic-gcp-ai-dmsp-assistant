module.exports = {
  queryLlm: async (planText) => {
    const {
      endpoints: { queryLlmRestEndpoint },
      llmAccessSecret,
      llmOptions: {
        modelProvider,
        modelName,
        modelParams: {
          systemPrompt: { sourceType, sourceValue },
        },
      },
    } = require('../../config');

    let systemPrompt = sourceValue;
    if (sourceType === 'file') {
      const { prompt } = require('../../system_prompt.config');
      systemPrompt = prompt;
    }

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${llmAccessSecret}`);
      headers.append('Accept', `application/json`);
      headers.append('Content-Type', `application/json`);

      const body = JSON.stringify({
        model_provider: modelProvider,
        model_name: modelName,
        query: planText,
        model_params: {
          system_prompt: systemPrompt,
        },
      });

      const response = await fetch(queryLlmRestEndpoint, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('There was a problem fetching the data:', error);
    }
  },
};
