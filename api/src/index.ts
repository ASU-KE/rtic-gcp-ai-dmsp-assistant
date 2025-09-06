import { WebSocket, RawData } from 'ws';

import config from './config/app.config';

// include and initialize the rollbar library with your access token
import Rollbar from 'rollbar';
const rollbar = new Rollbar({
  accessToken: config.rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

import app from './server';

const server = app.listen(config.port, function () {
  console.log('Server Listening on PORT:', config.port);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

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
  });
});

// Store WebSocket server in the Express app for later use
app.locals.wss = wss;

//
// need this in docker container to properly exit since node doesn't handle SIGINT/SIGTERM
// this also won't work on using npm start since:
// https://github.com/npm/npm/issues/4603
// https://github.com/npm/npm/pull/10868
// https://github.com/RisingStack/kubernetes-graceful-shutdown-example/blob/master/src/index.js
// if you want to use npm then start with `docker run --init` to help, but I still don't think it's
// a graceful shutdown of node process
//

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
  rollbar.info(
    'Got SIGINT (aka ctrl-c in docker). Graceful shutdown ',
    new Date().toISOString()
  );
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
  rollbar.info(
    'Got SIGTERM (docker container stop). Graceful shutdown ',
    new Date().toISOString()
  );
  shutdown();
});

// shut down server
function shutdown() {
  server.close(function onServerClosed(err) {
    if (err) {
      rollbar.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
}
//
// need above in docker container to properly exit
//
