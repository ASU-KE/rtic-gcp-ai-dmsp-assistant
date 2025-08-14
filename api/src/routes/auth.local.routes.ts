import { plainToClass } from 'class-transformer';
import { Router, Request, Response } from 'express';
import passport from 'passport';

import { User } from '../entities/user.entity';
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
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const userDTO = plainToClass(User, req.user as User, {
        excludeExtraneousValues: true,
      });
      res.status(200).json({ message: 'Login successful', user: userDTO });
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
