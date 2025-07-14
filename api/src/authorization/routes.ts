import { Router, Request, Response } from 'express';

// Controller Imports
import AuthorizationController from './controllers/AuthorizationController';
import { UserService } from '../users/services/UserService';

// Middleware Imports
import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';
import isAuthenticatedMiddleware from './../common/middlewares/IsAuthenticatedMiddleware';

// JSON Schema Imports for payload verification
import registerPayload from './schemas/registerPayload';
import loginPayload from './schemas/loginPayload';

import passport from 'passport';

const AuthorizationRoutes = (userService: UserService) => {
  const router: Router = Router();

  const authorizationController = new AuthorizationController(userService);

  router.post(
    '/create-user',
    [
      isAuthenticatedMiddleware.check,
      SchemaValidationMiddleware.verify(registerPayload),
    ],
    authorizationController.register
  );

  router.post(
    '/login',
    [SchemaValidationMiddleware.verify(loginPayload)],
    authorizationController.login
  );

  router.post('/refresh-token', authorizationController.refreshToken);

  router.get('/login/cas', passport.authenticate('cas'));

  router.get(
    '/login/cas/callback',
    passport.authenticate('cas', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      console.log('✅ CAS Callback success, user:', req.user);
      res.redirect('/dmp');
    }
  );

  // User info route for frontend
  // router.get('/api/user', (req: Request, res: Response) => {
  //   if (req.isAuthenticated()) {
  //     res.json({ user: req.user });
  //   } else {
  //     res.status(401).json({ message: 'Unauthorized' });
  //   }
  // });

  return router;
};

export default AuthorizationRoutes;
