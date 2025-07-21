import { FromSchema } from 'json-schema-to-ts';

import config from '../../../config/app.config';
const roles = config.roles;

const createUserPayloadSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    email: {
      type: 'string',
      pattern: '^[^\\s@]+@asu\\.edu$',
    },
    password: {
      type: 'string',
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    role: {
      type: 'string',
      enum: Object.values(roles),
    },
  },
  required: ['username', 'email', 'password', 'firstName', 'lastName'],
  additionalProperties: false,
} as const;

export type CreateUserPayload = FromSchema<typeof createUserPayloadSchema>;
export default createUserPayloadSchema;
