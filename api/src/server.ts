import express, { Request, Response, Application } from 'express';
import Rollbar from 'rollbar';
import cors from 'cors';
import morgan from 'morgan';
import { DataSource } from 'typeorm';

// Express Routes Import
import AuthorizationRoutes from './authorization/routes';
import UserRoutes from './users/routes';
import DmpRoutes from './dmp/routes';
import TestRoutes from './test/routes';
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
          ? '*'
          : 'https://dmsp.dev.rtd.asu.edu',
    })
  );
  app.use(express.json());

  app.use('/', AuthorizationRoutes(userService));
  app.use('/user', UserRoutes(userService));
  app.use('/dmp', DmpRoutes);
  app.use('/test', TestRoutes);

  // Health-check endpoint
  // app.get('/healthz', (req: Request, res: Response) => {
  //   res.json({ status: 'Healthy' });
  // });

  // Rollbar error handler
  app.use(rollbar.errorHandler());

  return app;
}
