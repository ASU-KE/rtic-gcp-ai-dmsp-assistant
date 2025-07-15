import config from '../../config/app.config';
const roles = config.roles;

export default {
  type: 'object',
  properties: {
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
  additionalProperties: false,
};
