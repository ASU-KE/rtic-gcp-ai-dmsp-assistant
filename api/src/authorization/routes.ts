import { Router } from 'express';
const router: Router = Router();

// Controller Imports
import AuthorizationController from './controllers/AuthorizationController';

// Middleware Imports
import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';

// JSON Schema Imports for payload verification
import registerPayload from './schemas/registerPayload';
import loginPayload from './schemas/loginPayload';

router.post(
  '/signup',
  [SchemaValidationMiddleware.verify(registerPayload)],
  AuthorizationController.register
);

router.post(
  '/login',
  [SchemaValidationMiddleware.verify(loginPayload)],
  AuthorizationController.login
);

export default router;
