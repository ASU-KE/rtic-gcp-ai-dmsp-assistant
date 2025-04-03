import config from '../../config';
const roles = config.roles

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
