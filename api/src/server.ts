import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import config from './config/app.config';

// Initialize Rollbar error logging and notifications
import Rollbar from 'rollbar';
const rollbar = new Rollbar({
  accessToken: config.rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

import { AppDataSource } from './config/data-source.config';

AppDataSource.initialize()
  .then(() => {
    console.log('TypeORM has been initialized!');
  })
  .catch((err) => {
    console.error('Error during TypeORM initialization:', err);
  });

const app = express();
app.use(express.json());
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

// Express Routes Import
import AuthRoutes from './routes/auth.routes';
import UserRoutes from './routes/user.routes';
import DmpRoutes from './routes/dmp.routes';

// Attaching the routes to the app.
app.use('/', AuthRoutes);
app.use('/user', UserRoutes);
app.use('/dmp', DmpRoutes);

// Health-check endpoint for Kubernetes
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'Healthy' });
});

app.use(rollbar.errorHandler());

export default app;
