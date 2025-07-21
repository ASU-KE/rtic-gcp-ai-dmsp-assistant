import config from '../../../config/app.config';
import { FromSchema } from 'json-schema-to-ts';
const roles = config.roles;

const registerPayloadSchema = {
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

export type RegisterPayload = FromSchema<typeof registerPayloadSchema>;
export default registerPayloadSchema;
