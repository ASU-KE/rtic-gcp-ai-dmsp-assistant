import { Router, Request, RequestHandler, Response } from 'express';
import passport from 'passport';

const authRoutes = () => {
  const router: Router = Router();

  // /api/sso/login
  // This route initiates the SAML authentication process
  router.get(
    '/login',
    passport.authenticate('saml', {
      successRedirect: '/',
      failureRedirect: '/api/sso/login/fail',
    }) as RequestHandler
  );

  // /api/sso/login/fail
  // This route handles the case where SAML authentication fails
  // It can be used to display an error message or redirect to a specific page
  router.get('/login/fail', (req, res) => {
    res.status(401).send('Login failed');
  });

  // /api/sso/login/callback
  // This route is the callback URL that SAML will redirect to after authentication
  // It processes the SAML response and logs the user in
  router.post(
    '/login/callback',
    passport.authenticate('saml', {
      failureRedirect: '/api/sso/login',
      failureFlash: true,
    }) as RequestHandler,
    function (req, res) {
      res.redirect('/login/callback'); // after authenticating user, redirect to the frontend login callback page to complete session registration
    }
  );

  // /api/sso/logout
  // This route handles user logout
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
