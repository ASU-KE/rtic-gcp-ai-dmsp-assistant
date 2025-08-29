import 'reflect-metadata';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import Rollbar from 'rollbar';

import { TypeormStore } from 'connect-typeorm';
import session from 'express-session';
import { Session } from './entities/session.entity';

import config from './config/app.config';
import { AppDataSource } from './config/data-source.config';

import { initLocalPassport } from './middlewares/passport.local.middleware';
import { initSamlPassport } from './middlewares/passport.saml.middleware';
import { isAuthenticated } from './middlewares/is-authenticated.middleware';

import { UserService } from './modules/users/services/UserService';
import { SubmissionService } from './modules/submissions/services/SubmissionService';
import LocalAuthRoutes from './routes/auth.local.routes';
import SamlAuthRoutes from './routes/auth.saml.routes';
import SubmissionRoutes from './routes/submission.routes';
import UserRoutes from './routes/user.routes';
import DmpRoutes from './routes/dmp.routes';

// Initialize Rollbar error logging and notifications
const rollbar = new Rollbar({
  accessToken: config.rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('TypeORM has been initialized!');
  })
  .catch((err) => {
    console.error('Error during TypeORM initialization:', err);
  });

// Initialize new userService and submissionService with TypeORM data source to inject into route and authproviders
const userService = new UserService(AppDataSource);
const submissionService = new SubmissionService(AppDataSource);

const app = express();
app.use(express.json());
app.use(morgan('common'));
app.use(rollbar.errorHandler());

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://dmsp.local.asu.edu',
      'https://dmsp.dev.rtd.asu.edu',
      'https://dmsp.local.rtd.asu.edu',
    ],
    credentials: true, // allow session cookie from browser to pass through
  })
);
// Initialize session store with TypeORM
const sessionStore = new TypeormStore({
  cleanupLimit: 2,
  limitSubquery: false, // If using MariaDB.
  ttl: 86400,
});

const sessionRepository = AppDataSource.getRepository(Session);
app.use(
  session({
    name: config.auth.sessionName,
    secret: config.auth.sessionSecret,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    proxy: true, // trust first proxy for secure cookies in production
    store: sessionStore.connect(sessionRepository),
    cookie: {
      sameSite: 'none', // required for cross-site cookies
      secure: true, // Must be true when samesite is 'none' and using HTTPS (or with localhost)
      httpOnly: true, // Helps prevent XSS attacks by not allowing client-side scripts to access the cookie
    },
  })
);

// Body parser middleware for SAML authentication
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Init Passport middleware
app.use(passport.initialize());
app.use(passport.session());
if (config.auth.strategy === 'local') {
  initLocalPassport(app, userService);
}
if (config.auth.strategy === 'saml') {
  initSamlPassport(app, userService);
}

// Register  unprotected routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    isAuthenticated: req.isAuthenticated(),
    message: 'DMSP AI Tool API',
  });
});
if (config.auth.strategy === 'saml') {
  app.use('/api/sso', SamlAuthRoutes());
}
if (config.auth.strategy === 'local') {
  app.use('/api/auth', LocalAuthRoutes());
}

// Health-check for Kubernetes
app.get('/api/healthz', (req, res) => {
  res.status(200).json({ status: 'Healthy' });
});

// Protected routes
app.use('/api/user', isAuthenticated, UserRoutes(userService));
app.use(
  '/api/submissions',
  isAuthenticated,
  SubmissionRoutes(submissionService)
);
app.use('/api/dmp', isAuthenticated, DmpRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Path Not Found' });
});

export default app;
