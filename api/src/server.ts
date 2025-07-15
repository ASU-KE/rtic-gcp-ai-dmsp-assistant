import cors from 'cors';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import Rollbar from 'rollbar';
import { DataSource } from 'typeorm';

import isAuthenticatedMiddleware from './middlewares/IsAuthenticatedMiddleware';
import { UserService } from './modules/users/services/UserService';

// Express Routes Imports
import AuthorizationRoutes from './routes/auth.routes';
import { GitHubOAuthStrategy } from './routes/GitHubOAuthStrategy';
import { GoogleOAuthStrategy } from './routes/GoogleOAuthStrategy';
import DmpRoutes from './routes/dmp.routes';
// import UserRoutes from './routes/user.routes';
import ExampleRoutes from './routes/example.routes';

export function createApp(
  rollbar: Rollbar,
  dataSource: DataSource,
  userService: UserService
) {
  const app: Application = express();

  app.locals.dataSource = dataSource;
  app.locals.userService = userService;

  // Register middlewares
  app.use(bodyParser.json());
  // Log common HTTP requests and methods
  app.use(morgan('common'));

  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'development'
          ? 'https://dmsp.local.asu.edu'
          : 'https://dmsp.dev.rtd.asu.edu',
      credentials: true,
    })
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // Set to false if not using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax',
      },
    })
  );

  //init passport middlewares
  app.use(passport.initialize());
  app.use(passport.session());

  // app.use('/', AuthorizationRoutes(userService));
  app.use('/user', [isAuthenticatedMiddleware.check], UserRoutes(userService));
  app.use('/dmp', DmpRoutes);
  app.use('/test', [isAuthenticatedMiddleware.check], TestRoutes);

  // Health-check endpoint
  app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Rollbar error handler
  app.use(rollbar.errorHandler());

  return app;
}
