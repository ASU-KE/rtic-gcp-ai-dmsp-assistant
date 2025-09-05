import { Request, Response, NextFunction } from 'express';
import config from '../config/app.config';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  console.log('auth strategy:', config.auth.strategy);
  if (config.auth.strategy === 'none' || req.user) {
    return next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized Access' });
  }
};
