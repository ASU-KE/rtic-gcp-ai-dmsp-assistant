import Rollbar from 'rollbar';
import http from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';

import config from './config/app.config';
import { AppDataSource } from './config/orm.config';
import { configurePassport } from './config/passport.config';
import { createApp } from './server';

import { User } from './entities/User';
import { UserService } from './modules/users/services/UserService';

const port = config.port;

// Initialise Rollbar
const rollbar = new Rollbar({
  accessToken: config.rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

AppDataSource.initialize()
  .then(() => {
    rollbar.info('TypeORM DataSource initialized!');

    // Create a UserService instance
    const userRepo = AppDataSource.getRepository(User);
    const userService = new UserService(userRepo);

    // Configure Passport
    configurePassport(userService);

    // Create Express app by injecting dependencies
    const app = createApp(rollbar, AppDataSource, userService);

    // Add Passport middleware
    // app.use(passport.initialize());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = http.createServer(app);

    const wss = new WebSocketServer({ server });

    app.locals.wss = wss;

    wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (data: RawData) => {
        let message: string;

        if (typeof data === 'string') {
          message = data;
        } else if (data instanceof Buffer) {
          message = data.toString('utf-8');
        } else if (data instanceof ArrayBuffer) {
          message = Buffer.from(new Uint8Array(data)).toString('utf-8');
        } else if (Array.isArray(data)) {
          message = Buffer.concat(data).toString('utf-8');
        } else {
          message = '[Unrecognized message format]';
        }
        console.log('Received:', message);
      });
    });

    // Start listening
    server.listen(port, () => {
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
      rollbar.info(
        'Got SIGINT (Ctrl-C). Graceful shutdown.',
        new Date().toISOString()
      );
      shutdown();
    });

    // Quit on Docker stop
    process.on('SIGTERM', () => {
      rollbar.info(
        'Got SIGTERM (Docker stop). Graceful shutdown.',
        new Date().toISOString()
      );
      shutdown();
    });
  })
  .catch((err: Error) => {
    rollbar.error('TypeORM init error:', err);
    process.exit(1);
  });
