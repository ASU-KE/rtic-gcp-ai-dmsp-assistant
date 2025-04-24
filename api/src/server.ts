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

export function createApp(rollbar: Rollbar, dataSource: DataSource) {
  const app: Application = express();

  app.locals.dataSource = dataSource;

  app.use(morgan('common'));
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'development'
          ? '*'
          : 'https://dmsp.ai.dev.rtd.asu.edu',
    })
  );
  app.use(express.json());

  app.use('/', AuthorizationRoutes);
  app.use('/user', UserRoutes);
  app.use('/dmp', DmpRoutes);
  app.use('/test', TestRoutes);

  // Health-check endpoint
  app.get('/healthz', (req: Request, res: Response) => {
    res.json({ status: 'Healthy' });
  });

  // Rollbar error handler
  app.use(rollbar.errorHandler());

  return app;
}
