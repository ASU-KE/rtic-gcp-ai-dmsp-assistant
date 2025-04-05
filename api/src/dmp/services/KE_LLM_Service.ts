import config from '../../config';
import promptConfig from '../../system_prompt.config';

interface LlmResponse {
  response: string;
  metadata?: Record<string, any>;
}

export default {
  queryLlm: async (planText: string): Promise<LlmResponse | undefined> => {
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
        const err: HttpError = new Error(`Network response was not ok: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const result: LlmResponse = await response.json();
      return result;
    } catch (error: unknown) {
      console.error('There was a problem fetching the data:', error);
      return undefined;
    }
  },
};
