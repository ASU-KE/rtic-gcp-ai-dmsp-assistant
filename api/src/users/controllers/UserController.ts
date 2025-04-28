import { UserService } from '../services/UserService';
import { User } from '../entities/User';
import { Request, Response } from 'express';
import { DeleteResult } from 'typeorm';

interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: string;
}

interface AuthenticatedRequest extends Request<object, object, UpdateUserBody> {
  user?: {
    userId: number;
    username: string;
  };
}

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  getUser = (req: AuthenticatedRequest, res: Response) => {
    const { user } = req;

    if (!user) {
      res.status(401).json({
        status: false,
        error: { message: 'Unauthorized access.' },
      });
      return;
    }

    this.userService
      .findUser({ id: user.userId })
      .then((foundUser: User | null) => {
        if (!foundUser) {
          res.status(404).json({
            status: false,
            error: { message: 'User not found.' },
          });
          return;
        }

        res.status(200).json({
          status: true,
          data: foundUser,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  };

  updateUser = (req: AuthenticatedRequest, res: Response) => {
    const { user, body: payload } = req;

    if (!user) {
      res.status(401).json({
        status: false,
        error: { message: 'Unauthorized access.' },
      });
      return;
    }

    if (!Object.keys(payload).length) {
      res.status(400).json({
        status: false,
        error: {
          message: 'Body is empty, hence cannot update the user.',
        },
      });
      return;
    }

    this.userService
      .updateUser({ id: user.userId }, payload)
      .then(() => this.userService.findUser({ id: user.userId }))
      .then((updatedUser: User | null) => {
        if (!updatedUser) {
          res.status(404).json({
            status: false,
            error: { message: 'User not found after update.' },
          });
          return;
        }

        res.status(200).json({
          status: true,
          data: updatedUser,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  };

  deleteUser = (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;

    this.userService
      .deleteUser({ id: Number(userId) })
      .then((result: DeleteResult) => {
        const deleted = result.affected ?? 0;
        res.status(200).json({
          status: true,
          data: {
            numberOfUsersDeleted: deleted,
          },
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  };

  getAllUsers = (req: Request, res: Response) => {
    this.userService
      .findAllUsers(req.query)
      .then((users: User[]) => {
        res.status(200).json({
          status: true,
          data: users,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  };

  changeRole = (
    req: Request<{ userId: string }, object, { role: string }>,
    res: Response
  ) => {
    const { userId } = req.params;
    const { role } = req.body;

    this.userService
      .updateUser({ id: Number(userId) }, { role })
      .then(() => this.userService.findUser({ id: Number(userId) }))
      .then((user: User | null) => {
        if (!user) {
          res.status(404).json({
            status: false,
            error: { message: 'User not found after role change.' },
          });
          return;
        }

        res.status(200).json({
          status: true,
          data: user,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  };
}
