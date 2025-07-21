import { Router } from 'express';
import passport from 'passport';

import SchemaValidationMiddleware from '../middlewares/SchemaValidationMiddleware';
import loginPayload from '../modules/auth/schemas/loginPayload';

const authRoutes = () => {
  const router: Router = Router();

  router.post('/login', [
    SchemaValidationMiddleware.verify(loginPayload),
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
    }),
  ]);

  router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.redirect('/login');
    });
  });

  return router;
};

export default authRoutes;
