import { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { Role } from '../config/app.config';

export function CheckPermissionMiddleware() {
  const has = (role: Role): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { user } = req;

      if (!user || user.role !== role) {
        res.status(403).json({
          status: false,
          error: `Unauthorized`,
        });
        return;
      }

      next();
    };
  };

  return { has };
}
