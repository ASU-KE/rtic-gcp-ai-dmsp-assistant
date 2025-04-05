import Ajv, { Options, AnySchema } from 'ajv';
const AJV_OPTS: Options = { allErrors: true };
import { Request, Response, NextFunction, RequestHandler } from 'express';

export = {
  /**
   * @description Compiles the schema provided in argument and validates the data for the
   * compiled schema, and returns errors if any
   *
   * @param {Object} schema - AJV Schema to validate against
   *
   * @returns {Function} - Express request handler
   */
  verify: (schema: AnySchema): RequestHandler => {
    if (!schema) {
      throw new Error('Schema not provided');
    }

    return (req: Request, res: Response, next: NextFunction) => {
      const { body } = req;
      const ajv = new Ajv(AJV_OPTS);
      const validate = ajv.compile(schema);
      const isValid = validate(body);

      if (!isValid) {
        res.send({
          status: false,
          error: {
            message: `Invalid Payload: ${ajv.errorsText(validate.errors)}`,
          },
        });
      }

      return next();
    };
  },
};
