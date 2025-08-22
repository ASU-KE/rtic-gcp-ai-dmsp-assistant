interface Config {
  database: {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
  };
  port: string;
  rollbarToken: string;
  passwordSaltRounds: number;
  sessionSecret: string;
  dmptoolClientId: string;
  dmptoolClientSecret: string;
  llmAccessSecret: string;
  roles: {
    USER: string;
    ADMIN: string;
  };
  action: string;
  endpoints: {
    authEndpoint: string;
    getDmpEndpoint: string;
    queryLlmRestEndpoint: string;
    queryLlmWebsocketEndpoint: string;
  };
  llmOptions: {
    modelProvider: string;
    modelName: string;
    modelParams: {
      temperature: number | null;
      maxTokens: number | null;
      systemPrompt: {
        sourceType: string;
        sourceValue: string;
      };
      topK: number | null;
      topP: number | null;
    };
    enableSearch: boolean | null;
    searchParams: {
      dbType: string;
      collection: string;
      tags: string[] | null;
      sourceName: string[] | null;
      topK: number | null;
      outputFields: string[] | null;
      retrievalType: string | null;
      promptMode: string | null;
      searchPrompt: string | null;
      expr: string | null;
    };
    projectId: string | null;
    sessionId: string | null;
    enableHistory: boolean | null;
    enhancePrompt: {
      timezone: string;
      time: boolean;
      date: boolean;
      verbosity: string;
    } | null;
    evalParams: {
      contextUtilization: boolean;
      harmfulness: boolean;
    } | null;
    responseFormat: {
      type: string;
    } | null;
    semanticCaching: boolean | null;
    history:
      | {
          query: string;
          response: string;
        }[]
      | null;
  };
}

const config: Config = {
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ?? '3306',
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  },
  // if you're not using docker compose for local development, this will default to 8080
  // to prevent non-root permission problems with 80. Dockerfile is set to make this 80
  // because containers don't have that issue :)
  port: process.env.API_PORT ?? '3001',
  rollbarToken: process.env.ROLLBAR_TOKEN!,
  passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS ?? '10', 10),
  sessionSecret: process.env.SESSION_SECRET!,
  dmptoolClientId: process.env.DMPTOOL_CLIENT_ID!,
  dmptoolClientSecret: process.env.DMPTOOL_CLIENT_SECRET!,
  llmAccessSecret: process.env.LLM_ACCESS_SECRET!,
  roles: {
    USER: 'user',
    ADMIN: 'admin',
  },
  action: 'queryV2',
  endpoints: {
    authEndpoint: 'https://auth.dmphub.uc3prd.cdlib.net/oauth2/token',
    getDmpEndpoint: 'https://api.dmphub.uc3prd.cdlib.net/dmps',
    queryLlmRestEndpoint: 'https://api-main-beta.aiml.asu.edu/queryV2',
    queryLlmWebsocketEndpoint: 'wss://apiws-main-beta.aiml.asu.edu',
  },
  llmOptions: {
    modelProvider: 'gcp-deepmind', // string (Required): "aws", "openai", "gcp", "gcp-deepmind", "azure"
    modelName: 'gemini2flash', // string (Required)
    modelParams: {
      temperature: 0.1, // float (Optional): 0-0.99 (model specific parameter) Randomness and Diversity parameter. Use a lower value to decrease randomness in the response.
      maxTokens: null, // int (Optional): refer to model specific parameters below. The maximum number of tokens in the generated response.
      // systemPrompt: null, // object (Optional): Object contains the custom system prompt as a string or reference to an external file.
      systemPrompt: {
        sourceType: 'file', // string: "string" or "file"
        sourceValue: 'system_prompt.config.ts', // string: Provide the system propmt text or the filename for file containing the system prompt.
      },
      topK: null, // int (Optional): 0-40 Randomness and Diversity parameter. The number of token choices the model uses to generate the next token.
      topP: null, // float (Optional): 0-1 Randomness and Diversity parameter. Use a lower value to ignore less probable options.
    },
    enableSearch: null, // boolean (default = false): Enable for Retrieval Augmented Generation (RAG) to have model search your document collection and generate its response from the search results.
    searchParams: {
      dbType: 'opensearch', // string: Open Search is the only engine currently available.
      collection: 'test_collection', // string: Name of the collection in the data store. Managed through an AWS S3 bucket (aiml-llm-platform-poc-us-west-2-data-opensearch-ke)
      tags: null, // array (Optional): ["tag1", "tag2"]. You can use this to filter your data before searching with tags you provided while uploading the data.
      sourceName: null, // array (Optional): ["file_name1.pdf", "file_name2.txt"]. You can use this to filter your data before searching with file names you provided while uploading the data.
      topK: null, // int (default = 3): You can set the number of chunks or documents you want to retrieve here. It can range from 1 to how many ever you want. Keep in mind, setting a higher number makes the response time slow and sometimes the quality may drop.
      outputFields: null, // array (Optional): ["source_name", "content", "source_type"]. This lets you get the metadata at the end of a response. You need to set the response format to json in the additional params.
      retrievalType: null, // string (default = 'chunk'): 'chunk', 'neighbor', 'document'
      promptMode: null, // string (default = 'restricted'): "restricted", "unrestricted", "custom"
      searchPrompt: null, // string (Only required when prompt_mode is set to custom): "This is your new prompt when search is enabled. The model will have this prompt with placeholders {data} and {query} added by the user."
      expr: null, // string (Optional): "metadata1 == 'corresponding_filter' && metadata2 == 'corresponding_filter'". You can define a custom expression to filter your results.
    },
    projectId: null, // string (Optional): "project_id". When you specify a project_id all the parameters that you specify in the payload will get overwritten by the parameters set on the platform. To change the parameters, you will need to be the admin or a collaborator for that project and you will be able to change the parameters.
    sessionId: null, // string (Optional): "random_uuid". If you want to preserve your history in a particular session and use it later, you can specify this value.
    enableHistory: null, // boolean (default = false): Enabling this lets the model use the history from the current session.
    enhancePrompt: null, // object (Optional)
    // enhancePrompt: {
    //   timezone: 'MST', // string (default = "MST"): Sets the timezone to the desired timezone.
    //   time: false, // boolean (default = false): If true, the model considers the current time in its responses.
    //   date: false, // boolean (default = false): If true, the model includes the current date in its responses.
    //   verbosity: null, // string (default is none): "brief", "detailed", "succinct". Controls the level of detail in the model's responses; can be set to brief, detailed, or succinct to adjust the verbosity.
    // },
    evalParams: null, // object (Optional): These are experimental features and might not always work. Any feedback is appreciated.
    // evalParams: {
    //   contextUtilization: false, // bool (default = false)
    //   harmfulness: false, // bool (default = false)
    // },
    responseFormat: null, // object (Optional)
    // responseFormat: {
    //   type: 'text', // string (default = "text"): "json" or "text"
    // },
    semanticCaching: null, // boolean (default = false): This lets you cache your responses and use it when a query is asked with the same params.
    history: null, // list (default is empty): This lets you pass your own history to the model. The history should be a list of dictionary items with the keys "query" and "response". Keep in mind if you enable this, your conversation history will not be used.
  },
};

export type Role = 'user' | 'admin';
export default config;
