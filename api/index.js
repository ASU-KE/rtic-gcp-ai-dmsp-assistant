const Express = require('express');
const app = Express();
const cors = require('cors');
const morgan = require('morgan');
const { Sequelize } = require('sequelize');

require('dotenv').config();

const port = process.env.PORT || 3000; //eslint-disable-line no-undef

// Express Routes Import
const AuthorizationRoutes = require('./authorization/routes');
const UserRoutes = require('./users/routes');
const DmpRoutes = require('./dmp/routes');
const TestRoutes = require('./test/routes');

// Sequelize model imports
const UserModel = require('./common/models/User');

app.use(morgan('tiny'));
app.use(cors());

// Middleware that parses the body payloads as JSON to be consumed next set
// of middlewares and controllers.
app.use(Express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './storage/data.db', // Path to the file that will store the SQLite DB.
});

// Initialising the Model on sequelize
UserModel.initialise(sequelize);

// Syncing the models that are defined on sequelize with the tables that alredy exists
// in the database. It creates models as tables that do not exist in the DB.
sequelize
  .sync()
  .then(() => {
    console.log('Sequelize Initialised!!');

    // Attaching the Authentication and User Routes to the app.
    app.use('/', AuthorizationRoutes);
    app.use('/user', UserRoutes);
    app.use('/dmp', DmpRoutes);
    app.use('/test', TestRoutes);

    app.listen(port, () => {
      console.log('Server Listening on PORT:', port);
    });
  })
  .catch((err) => {
    console.error('Sequelize Initialisation threw an error:', err);
  });
