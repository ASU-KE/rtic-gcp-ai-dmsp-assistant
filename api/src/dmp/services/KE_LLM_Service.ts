import config from '../../config';
import promptConfig from '../../system_prompt.config';

export default {
  queryLlm: async (planText: any) => {
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
    } = config;

    let systemPrompt = sourceValue;
    if (sourceType === 'file') {
      systemPrompt = promptConfig.prompt;
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
