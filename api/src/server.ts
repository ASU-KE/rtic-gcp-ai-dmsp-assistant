import express, { Request, Response, Application } from 'express';
import Rollbar from 'rollbar';
import cors from 'cors';
import morgan from 'morgan';
import { Sequelize } from 'sequelize';

// Express Routes Import
import AuthorizationRoutes from './authorization/routes';
import UserRoutes from './users/routes';
import DmpRoutes from './dmp/routes';
import TestRoutes from './test/routes';

export function createApp(rollbar: Rollbar, sequelize: Sequelize) {
  const app: Application = express();

  // Store sequelize so routes/middleware can retrieve it later if needed
  app.locals.sequelize = sequelize;

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
