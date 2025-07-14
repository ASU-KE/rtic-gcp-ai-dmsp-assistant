import express, { Application } from 'express';
import Rollbar from 'rollbar';
import cors from 'cors';
import morgan from 'morgan';
import { DataSource } from 'typeorm';
import session from 'express-session';
import passport from 'passport';

// Express Routes Import
import AuthorizationRoutes from './authorization/routes';
import UserRoutes from './users/routes';
import DmpRoutes from './dmp/routes';
import TestRoutes from './test/routes';
import isAuthenticatedMiddleware from './common/middlewares/IsAuthenticatedMiddleware';
import { UserService } from './users/services/UserService';

export function createApp(
  rollbar: Rollbar,
  dataSource: DataSource,
  userService: UserService
) {
  const app: Application = express();

  app.locals.dataSource = dataSource;
  app.locals.userService = userService;

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
  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // true if using HTTPS
        sameSite: 'lax',
      },
    })
  );

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
