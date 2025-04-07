import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
const jwtSecret: string = process.env.JWT_SECRET!;

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
  const authHeader = req.headers.authorization;

  // IF no auth headers are provided
  // THEN return 401 Unauthorized error
  if (!authHeader) {
    res.status(401).json({
      status: false,
      error: {
        message: 'Auth headers not provided in the request.',
      },
    });
    return;
  }

  // IF bearer auth header is not provided
  // THEN return 401 Unauthorized error
  if (!authHeader.startsWith('Bearer')) {
    res.status(401).json({
      status: false,
      error: {
        message: 'Invalid auth mechanism.',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // IF bearer auth header is provided, but token is not provided
  // THEN return 401 Unauthorized error
  if (!token) {
    res.status(401).json({
      status: false,
      error: {
        message: 'Bearer token missing in the authorization headers.',
      },
    });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({
        status: false,
        error: 'Invalid access token provided, please login again.',
      });
      return;
    }

    req.user = decoded as JwtPayload; // Save the user object for further use
    next();
  });
};

export default { check };
