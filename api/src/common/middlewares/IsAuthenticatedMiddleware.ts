import passport from 'passport';
import { Request, Response, NextFunction, RequestHandler } from 'express';

interface JwtPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

const check: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  passport.authenticate(
    'jwt',
    { session: false },
    (
      err: Error | null,
      user: JwtPayload | false,
      info?: { message?: string }
    ) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          status: false,
          error: {
            message: info?.message ?? 'Invalid or missing authentication token',
          },
        });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

export default { check };
