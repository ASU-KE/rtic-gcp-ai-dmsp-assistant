import { RequestHandler } from 'express';
import { Request } from 'express';
import { UserService as UserModel } from '../../common/services/UserService';
import { User } from '../../common/models/User';
import { Role } from '../../config';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number; // use number if your JWT sets it that way
    username: string;
  };
}

const has = (role: Role): RequestHandler => {
  return async (req, res, next) => {
    const { user } = req as AuthenticatedRequest;

    if (!user) {
      res.status(401).json({
        status: false,
        error: 'No user found in request context.',
      });
      return;
    }

    const foundUser: User | null = await UserModel.findUser({
      id: Number(user.userId),
    });

    if (!foundUser) {
      res.status(403).json({
        status: false,
        error: 'Invalid access token provided, please login again.',
      });
      return;
    }

    if (foundUser.role !== role) {
      res.status(403).json({
        status: false,
        error: `You need to be a ${role} to access this endpoint.`,
      });
      return;
    }

    next();
  };
};

export default { has };
