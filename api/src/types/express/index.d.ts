import { WebSocketServer } from 'ws';
import 'express';

declare global {
  interface HttpError extends Error {
    status?: number;
  }
}

declare module 'express' {
  interface Request {
    user?: {
      userId: number;
      username: string;
    };
  }
}

declare global {
  namespace Express {
    interface Application {
      locals: {
        wss: WebSocketServer;
      };
    }
  }
}
