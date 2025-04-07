// types/express/index.d.ts
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
