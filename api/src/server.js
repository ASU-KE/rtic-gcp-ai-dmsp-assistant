const express = require('express');

const { rollbarToken } = require('./config');
// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar');
var rollbar = new Rollbar({
  accessToken: rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

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
    rollbar.log('Sequelize Initialised!!');

    // Attaching the routes to the app.
    app.use('/', AuthorizationRoutes);
    app.use('/user', UserRoutes);
    app.use('/dmp', DmpRoutes);
    app.use('/test', TestRoutes);

    app.get('/healthz', function (req, res) {
      // do app logic here to determine if app is truly healthy
      // you should return 200 if healthy, and anything else will fail
      // if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
      res.send(JSON.stringify({ status: 'Healthy' }));
    });

    app.use(rollbar.errorHandler());
  })
  .catch((err) => {
    rollbar.error('Sequelize Initialisation threw an error:', err);
  });

module.exports = app;
