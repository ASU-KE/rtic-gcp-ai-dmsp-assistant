import { Router, Request, Response } from 'express';
import passport from 'passport';

import SchemaValidationMiddleware from '../middlewares/schema-validation.middleware';
import loginPayload from '../modules/auth/schemas/loginPayload';

const authRoutes = () => {
  const router: Router = Router();

  router.post(
    '/login',
    [
      SchemaValidationMiddleware.verify(loginPayload),
      passport.authenticate('local'),
    ],
    function (req: Request, res: Response) {
      res.status(200).json({ message: 'Login successful', user: req.user });
    }
  );

  router.get('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logout successful' });
    });
  });

  return router;
};

export default authRoutes;
