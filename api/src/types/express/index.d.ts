import { WebSocketServer } from 'ws';
import 'express';

declare global {
  interface HttpError extends Error {
    status?: number;
    code?: string;
    errno?: number;
  }
}

declare global {
  namespace Express {
    interface User {
      userId: number;
      username: string;
    }
    interface Request {
      user?: User;
    }
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
