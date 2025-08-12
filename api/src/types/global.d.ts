// global.d.ts
import 'express';

declare global {
  interface HttpError extends Error {
    status?: number;
    code?: string;
    errno?: number;
  }

  namespace Express {
    interface User {
      username: string;
      email?: string;
    }
  }
}
