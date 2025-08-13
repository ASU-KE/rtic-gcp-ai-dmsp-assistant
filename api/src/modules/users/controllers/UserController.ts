import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { DeleteResult } from 'typeorm';

import { UserService } from '../services/UserService';
import { User } from '../../../entities/user.entity';
import { CreateUserPayload } from '../schemas/create-user.schema';
import config from '../../../config/app.config';

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  createUser = async (
    req: Request<object, object, CreateUserPayload>,
    res: Response
  ) => {
    const payload = req.body;
    if (!payload.username || !payload.email || !payload.password) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: 'Username, email, and password are required.' },
      });
    }

    let role = payload.role;
    role ??= config.roles.USER;
    const password = await this.userService.hashPassword(payload.password);

    this.userService
      .createUser(Object.assign(payload, { password, role }))
      .then((user: User) => {
        return res.status(200).json({
          status: true,
          data: {
            user: user,
          },
          error: null,
        });
      })
      .catch((err: HttpError) => {
        if (
          err.code === '23505' ||
          err.code === 'ER_DUP_ENTRY' ||
          err.errno === 1062
        ) {
          return res.status(400).json({
            status: false,
            data: null,
            error: {
              message: 'A user with that email or username already exists.',
            },
          });
        }

        return res.status(500).json({
          status: false,
          data: null,
          error: err,
        });
      });
  };

  getUser = (req: Request, res: Response) => {
    const user = req.user as User;

    if (!user) {
      res.status(401).json({
        status: false,
        data: null,
        error: { message: 'Unauthorized access.' },
      });
      return;
    }

    this.userService
      .findUser({ id: user.id })
      .then((foundUser: User | null) => {
        if (!foundUser) {
          res.status(404).json({
            status: false,
            data: null,
            error: { message: 'User not found.' },
          });
          return;
        }

        const userDto = plainToClass(User, foundUser, {
          excludeExtraneousValues: true,
        });
        res.status(200).json({
          status: true,
          data: {
            user: userDto,
          },
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          data: null,
          error: err,
        });
      });
  };

  updateUser = (
    req: Request<
      { userId: string },
      object,
      { firstName: string; lastName: string; role: string }
    >,
    res: Response
  ) => {
    const { user } = req;
    const { userId } = req.params;
    const { firstName, lastName, role } = req.body;

    if (!user) {
      res.status(401).json({
        status: false,
        data: null,
        error: { message: 'Unauthorized access.' },
      });
      return;
    }

    if (!Object.keys(req.body).length) {
      res.status(400).json({
        status: false,
        data: null,
        error: {
          message: 'Body is empty, hence cannot update the user.',
        },
      });
      return;
    }

    this.userService
      .updateUser({ id: Number(userId) }, { firstName, lastName, role })
      .then(() => this.userService.findUser({ id: Number(userId) }))
      .then((updatedUser: User | null) => {
        if (!updatedUser) {
          res.status(404).json({
            status: false,
            data: null,
            error: { message: 'User not found after update.' },
          });
          return;
        }

        const userDto = plainToClass(User, updatedUser, {
          excludeExtraneousValues: true,
        });
        res.status(200).json({
          status: true,
          data: {
            user: userDto,
          },
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          data: null,
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
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          data: null,
          error: err,
        });
      });
  };

  getAllUsers = (req: Request, res: Response) => {
    this.userService
      .findAllUsers(req.query)
      .then((users: User[]) => {
        const userDtos = users.map((user) =>
          plainToClass(User, user, { excludeExtraneousValues: true })
        );
        res.status(200).json({
          status: true,
          data: { user: userDtos },
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          data: null,
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
            data: null,
            error: { message: 'User not found after role change.' },
          });
          return;
        }

        const userDto = plainToClass(User, user, {
          excludeExtraneousValues: true,
        });
        res.status(200).json({
          status: true,
          data: {
            user: userDto,
          },
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          data: null,
          error: err,
        });
      });
  };
}
