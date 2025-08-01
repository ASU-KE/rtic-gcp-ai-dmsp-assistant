import { Request, Response, NextFunction } from 'express';
import { Role } from '../config/app.config';
import { User } from '../entities/user.entity';

export const checkPermission = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;

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
