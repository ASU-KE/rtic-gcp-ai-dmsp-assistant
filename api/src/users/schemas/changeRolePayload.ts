import { roles } from '../../config';

export default {
  type: 'object',
  properties: {
    role: {
      type: 'string',
      enum: Object.values(roles),
    },
  },
  additionalProperties: false,
};
