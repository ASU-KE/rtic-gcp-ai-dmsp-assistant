import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';

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

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to false if not using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax',
    },
  })
);

// Init passport middlewares
// app.use(passport.initialize());
// app.use(passport.session());

// Express Routes Import
import AuthRoutes from './routes/auth.routes';
import UserRoutes from './routes/user.routes';
import DmpRoutes from './routes/dmp.routes';
import { UserService } from './modules/users/services/UserService';

// Register routes
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     isAuthenticated: req.isAuthenticated(),
//     message: 'DMSP AI Tool API',
//   });
// });

// Health-check for Kubernetes
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'Healthy' });
});

// Initialize new userService with TypeORM data source and inject into route providers
const userService = new UserService(AppDataSource);

// Unprotected routes
app.use('/', AuthRoutes(userService));
// app.use('/api', GitHubOAuthStrategy(), GoogleOAuthStrategy());


app.use('/user', UserRoutes(userService));
app.use('/dmp', DmpRoutes);


// Rollbar error handler
app.use(rollbar.errorHandler());

export default app;
