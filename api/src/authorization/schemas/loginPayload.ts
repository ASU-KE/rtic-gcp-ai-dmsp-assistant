export default {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
  required: ['username', 'password'],
  additionalProperties: false,
};

export type LoginPayload = {
  username: string;
  password: string;
};
