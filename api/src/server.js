// IMPORTANT: Make sure to import `instrument.js` at the top of your file.
require('./instrument.js');

const Sentry = require('@sentry/node');
const express = require('express');

const app = express();
const cors = require('cors');
const morgan = require('morgan');

const { Sequelize } = require('sequelize');

// Express Routes Import
const AuthorizationRoutes = require('./authorization/routes');
const UserRoutes = require('./users/routes');
const DmpRoutes = require('./dmp/routes');
const TestRoutes = require('./test/routes');

// Sequelize model imports
const UserModel = require('./common/models/User');

app.use(morgan('common'));
app.use(cors());

// Middleware that parses the body payloads as JSON to be consumed next set
// of middlewares and controllers.
app.use(express.json());

const {
  database: { host, database, user, password },
} = require('./config');

const sequelize = new Sequelize(database, user, password, {
  dialect: 'mysql',
  host,
});

// Initialising the Model on sequelize
UserModel.initialise(sequelize);

// Sync the models defined in sequelize with the database tables that already exist
// in the database. Tables that do not exist will be created.
sequelize
  .sync()
  .then(() => {
    console.log('Sequelize Initialised!!');

    // Attaching the routes to the app.
    app.use('/', AuthorizationRoutes);
    app.use('/user', UserRoutes);
    app.use('/dmp', DmpRoutes);
    app.use('/test', TestRoutes);

    app.get('/debug-sentry', function mainHandler(req, res) {
      throw new Error('My first Sentry error!');
    });

    app.get('/healthz', function (req, res) {
      // do app logic here to determine if app is truly healthy
      // you should return 200 if healthy, and anything else will fail
      // if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
      res.send(JSON.stringify({ status: 'Healthy' }));
    });

    // The error handler must be registered before any other error middleware and after all controllers
    Sentry.setupExpressErrorHandler(app);
  })
  .catch((err) => {
    console.error('Sequelize Initialisation threw an error:', err);
  });

module.exports = app;
