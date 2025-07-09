import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserService } from '../../users/services/UserService';
import { User } from '../../users/entities/User';
import { RegisterPayload } from '../schemas/registerPayload';
import config from '../../config';
import { Request, Response } from 'express';
import { LoginPayload } from '../schemas/loginPayload';

const jwtSecret: string = config.jwtSecret;
const refreshSecret: string = process.env.JWT_REFRESH_SECRET!;
const jwtExpirationInSeconds = parseInt(config.jwtExpiration ?? '86400', 10);
const refreshExpiration = parseInt(config.jwtRefreshExpiration ?? '604800', 10);

// Generates an Access Token using username and userId for the user's authentication
const generateAccessToken = (user: {
  id: number;
  username: string;
  role?: string;
}): string => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: jwtExpirationInSeconds,
    }
  );
};

// Encrypts the password using SHA256 Algorithm, for enhanced security of the password
const encryptPassword = (password: string): string => {
  // We will hash the password using SHA256 Algorithm before storing in the DB
  // Creating SHA-256 hash object
  const hash = crypto.createHash('sha256');
  // Update the hash object with the string to be encrypted
  hash.update(password);
  // Get the encrypted value in hexadecimal format
  return hash.digest('hex');
};

export default class AuthorizationController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  register = (req: Request<object, object, RegisterPayload>, res: Response) => {
    const payload = req.body;

    const encryptedPassword: string = encryptPassword(payload.password);
    let role = payload.role;

    role ??= config.roles.USER;

    this.userService
      .createUser(Object.assign(payload, { password: encryptedPassword, role }))
      .then((user: User) => {
        // Generating an AccessToken for the user, which will be
        // required in every subsequent request.
        const accessToken = generateAccessToken({
          id: user.id,
          username: user.username,
          role: user.role,
        });

        const refreshToken = jwt.sign(
          { userId: user.id, username: user.username },
          refreshSecret,
          { expiresIn: refreshExpiration }
        );

        return res.status(200).json({
          status: true,
          data: {
            user: user,
            token: accessToken,
            refreshToken: refreshToken,
          },
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
            error: {
              message: 'A user with that email or username already exists.',
            },
          });
        }

        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  };

  login = (req: Request<object, object, LoginPayload>, res: Response) => {
    const { username, password } = req.body;

    this.userService
      .findUser({ username })
      .then((user: User | null) => {
        // IF user is not found with the given username
        // THEN Return user not found error
        if (!user) {
          return res.status(400).json({
            status: false,
            error: {
              message: `Could not find any user with username: \`${username}\`.`,
            },
          });
        }

        const encryptedPassword = encryptPassword(password);

        // IF Provided password does not match with the one stored in the DB
        // THEN Return password mismatch error
        if (user.password !== encryptedPassword) {
          return res.status(400).json({
            status: false,
            error: {
              message: `Provided username and password did not match.`,
            },
          });
        }

        // Generating an AccessToken for the user, which will be
        // required in every subsequent request.
        const accessToken = generateAccessToken({
          id: user.id,
          username: user.username,
          role: user.role,
        });

        const refreshToken = jwt.sign(
          { userId: user.id, username: user.username },
          refreshSecret,
          { expiresIn: refreshExpiration }
        );

        return res.status(200).json({
          status: true,
          data: {
            user: user,
            token: accessToken,
            refreshToken: refreshToken,
          },
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          status: false,
          error: err.message,
        });
      });
  };

  refreshToken = async (
    req: Request<object, object, { refreshToken?: string }>,
    res: Response
  ): Promise<any> => {
    const token = req.body.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ status: false, error: { message: 'Refresh token missing' } });
    }
    try {
      const payload = jwt.verify(token, refreshSecret) as {
        userId: number;
        username: string;
      };
      const user = await this.userService.findUser({ id: payload.userId });

      if (!user) {
        return res
          .status(403)
          .json({ status: false, error: { message: 'User not found' } });
      }
      const newAccessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      return res
        .status(200)
        .json({ status: true, data: { accessToken: newAccessToken } });
    } catch {
      return res.status(403).json({
        status: false,
        error: { message: 'Invalid or expired refresh token' },
      });
    }
  };
}
