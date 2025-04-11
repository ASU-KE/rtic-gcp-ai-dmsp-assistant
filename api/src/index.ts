import config from './config';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import UserModel from './common/models/User';
import Rollbar from 'rollbar';
import { createApp } from './server';

dotenv.config();
const port = config.port;

// Initialise Rollbar
const rollbar = new Rollbar({
  accessToken: config.rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

const {
  database: { host, database, user, password },
} = config;

const sequelize = new Sequelize(database, user, password, {
  dialect: 'mysql',
  host,
});

// Initialising the Model on sequelize
UserModel.initialise(sequelize);

sequelize
  .sync()
  .then(() => {
    rollbar.info('Sequelize initialized!');

    // Create Express app by injecting dependencies
    const app = createApp(rollbar, sequelize);

    // Start listening
    const server = app.listen(port, () => {
      console.log(`Server listening on PORT: ${port}`);
    });

    // Graceful shutdown
    function shutdown() {
      server.close((err) => {
        if (err) {
          rollbar.error(err);
          process.exit(1);
        }
        process.exit(0);
      });
    }

    //
    // need this in docker container to properly exit since node doesn't handle SIGINT/SIGTERM
    // this also won't work on using npm start since:
    // https://github.com/npm/npm/issues/4603
    // https://github.com/npm/npm/pull/10868
    // https://github.com/RisingStack/kubernetes-graceful-shutdown-example/blob/master/src/index.js
    // if you want to use npm then start with `docker run --init` to help, but I still don't think it's
    // a graceful shutdown of node process
    //

    // Quit on Ctrl-C when running docker in terminal
    process.on('SIGINT', () => {
      rollbar.info('Got SIGINT (Ctrl-C). Graceful shutdown.', new Date().toISOString());
      shutdown();
    });

    // Quit on Docker stop
    process.on('SIGTERM', () => {
      rollbar.info('Got SIGTERM (Docker stop). Graceful shutdown.', new Date().toISOString());
      shutdown();
    });
  })
  .catch((err: Error) => {
    rollbar.error('Sequelize init error:', err);
    process.exit(1);
  });
