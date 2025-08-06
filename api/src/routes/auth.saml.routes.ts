import bodyParser from 'body-parser';
import { Router, Request, RequestHandler, Response } from 'express';
import passport from 'passport';

const authRoutes = () => {
  const router: Router = Router();

  router.get(
    '/login',
    passport.authenticate('saml', {
      failureRedirect: '/login/failure',
      failureFlash: true,
    }) as RequestHandler,
    function (req, res) {
      res.redirect('/');
    }
  );

  router.post(
    '/login/callback',
    bodyParser.urlencoded({ extended: false }),
    passport.authenticate('saml', {
      failureRedirect: '/',
      failureFlash: true,
    }) as RequestHandler,
    function (req, res) {
      res.redirect('/');
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
