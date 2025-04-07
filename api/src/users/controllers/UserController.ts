import UserModel, { UserInstance } from './../../common/models/User';
import { Request, Response } from 'express';

interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: string;
  // etc...
  // Or if fully dynamic, use `[key: string]: unknown;`
}

interface AuthenticatedRequest extends Request<object, object, UpdateUserBody> {
  user?: {
    userId: number;
    username: string;
  };
}

export default {
  getUser: (req: AuthenticatedRequest, res: Response) => {
    const { user } = req;

    if (!user) {
      res.status(401).json({
        status: false,
        error: { message: 'Unauthorized access.' },
      });
      return;
    }

    UserModel.findUser({ id: user.userId })
      .then((foundUser: UserInstance | null) => {
        if (!foundUser) {
          res.status(404).json({
            status: false,
            error: { message: 'User not found.' },
          });
          return;
        }

        res.status(200).json({
          status: true,
          data: foundUser.toJSON(),
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  updateUser: (req: AuthenticatedRequest, res: Response) => {
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

    UserModel.updateUser({ id: user.userId }, payload)
      .then(() => UserModel.findUser({ id: user.userId }))
      .then((updatedUser: UserInstance | null) => {
        if (!updatedUser) {
          res.status(404).json({
            status: false,
            error: { message: 'User not found after update.' },
          });
          return;
        }

        res.status(200).json({
          status: true,
          data: updatedUser.toJSON(),
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  deleteUser: (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;

    UserModel.deleteUser({ id: Number(userId) })
      .then((numberOfEntriesDeleted: number) => {
        res.status(200).json({
          status: true,
          data: {
            numberOfUsersDeleted: numberOfEntriesDeleted,
          },
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  getAllUsers: (req: Request, res: Response) => {
    UserModel.findAllUsers(req.query)
      .then((users: UserInstance[]) => {
        res.status(200).json({
          status: true,
          data: users.map((user) => user.toJSON()),
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  changeRole: (
    req: Request<{ userId: string }, object, { role: string }>,
    res: Response
  ) => {
    const { userId } = req.params;
    const { role } = req.body;

    UserModel.updateUser({ id: Number(userId) }, { role })
      .then(() => UserModel.findUser({ id: Number(userId) }))
      .then((user: UserInstance | null) => {
        if (!user) {
          res.status(404).json({
            status: false,
            error: { message: 'User not found after role change.' },
          });
          return;
        }

        res.status(200).json({
          status: true,
          data: user.toJSON(),
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
