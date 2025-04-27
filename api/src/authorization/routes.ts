import { Router } from 'express';

// Controller Imports
import AuthorizationController from './controllers/AuthorizationController';
import { UserService } from '../users/services/UserService';

// Middleware Imports
import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';

// JSON Schema Imports for payload verification
import registerPayload from './schemas/registerPayload';
import loginPayload from './schemas/loginPayload';

const AuthorizationRoutes = (userService: UserService) => {
  const router: Router = Router();

  const authorizationController = new AuthorizationController(userService);

  router.post(
    '/signup',
    [SchemaValidationMiddleware.verify(registerPayload)],
    authorizationController.register
  );

  router.post(
    '/login',
    [SchemaValidationMiddleware.verify(loginPayload)],
    authorizationController.login
  );

  return router;
};

export default AuthorizationRoutes;
