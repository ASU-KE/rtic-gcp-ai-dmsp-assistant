import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (req.user) {
    return next();
  } else {
    res.json({ success: false, message: 'Unauthorized' });
  }
};
