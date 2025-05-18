import { RequestHandler } from 'express';
import { Request } from 'express';
import { UserService } from '../../users/services/UserService';
import { Role } from '../../config';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number; // use number if your JWT sets it that way
    username: string;
    role?: string;
  };
}

export function CheckPermissionMiddleware(userService: UserService) {
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

      const foundUser = await userService.findUser({ id: Number(user.userId) });

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
          error: `Unauthorized: This endpoint is restricted to users with the '${role}' role.`,
        });
        return;
      }

      next();
    };
  };

  return { has };
}
