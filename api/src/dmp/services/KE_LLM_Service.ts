import config from '../../config';
import promptConfig from '../../system_prompt.config';
import { WebSocketServer, WebSocket } from 'ws';

interface LlmResponse {
  response: string;
  metadata?: Record<string, unknown>;
}

export default {
  queryLlm: async (
    planText: string,
    ws?: WebSocket,
    wss?: WebSocketServer
  ): Promise<LlmResponse | undefined> => {
    const {
      action,
      endpoints: { queryLlmWebsocketEndpoint },
      llmAccessSecret,
      llmOptions: {
        modelProvider,
        modelName,
        modelParams: {
          systemPrompt: { sourceType, sourceValue },
        },
      },
    } = config;

    const system_prompt =
      sourceType === 'file' ? promptConfig.prompt : sourceValue;

    return new Promise<LlmResponse | undefined>((resolve, reject) => {
      const upstream = new WebSocket(
        `${queryLlmWebsocketEndpoint}/?access_token=${llmAccessSecret}`
      );

      let fullResponse = '';
      let timeoutChunk: string | null = null;
      let receivedValidChunk = false;

      upstream.on('open', () => {
        upstream.send(
          JSON.stringify({
            action: action,
            model_provider: modelProvider,
            model_name: modelName,
            model_params: { system_prompt },
            query: planText,
          })
        );
      });

      upstream.on('message', (data) => {
        let chunk = '';

        if (typeof data === 'string') {
          chunk = data;
        } else if (data instanceof Buffer) {
          chunk = data.toString('utf-8');
        } else if (data instanceof ArrayBuffer) {
          chunk = Buffer.from(data).toString('utf-8');
        } else if (Array.isArray(data)) {
          chunk = Buffer.concat(data).toString('utf-8');
        } else {
          console.warn('Unknown data format received in WebSocket message');
        }

        try {
          const parsedInner = JSON.parse(chunk) as { message?: string };
          if (parsedInner.message === 'Endpoint request timed out') {
            timeoutChunk = JSON.stringify({ chunk });
            return;
          }
        } catch {
          // Ignore JSON parsing error
        }
        receivedValidChunk = true

        fullResponse += chunk;

        const message = JSON.stringify({ chunk });

        // Send to individual WebSocket
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(message);
        }

        // Broadcast to all connected clients
        wss?.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      upstream.on('close', () => {
        console.log('WebSocket connection closed');
        if (!receivedValidChunk && timeoutChunk && ws?.readyState === WebSocket.OPEN) {
          ws.send(timeoutChunk);
        }
        resolve({ response: fullResponse, metadata: {} });
      });

      upstream.on('error', (err) => {
        console.error('WebSocket error:', err);
        reject(err instanceof Error ? err : new Error(String(err)));
      });
    });
  },
};
