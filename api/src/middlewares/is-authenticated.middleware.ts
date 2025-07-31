import { Request, Response, NextFunction } from 'express';
import config from '../config/app.config';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (config.auth.strategy === 'none' || req.user) {
    return next();
  } else {
    res.json({ success: false, message: 'Unauthorized' });
  }
};
