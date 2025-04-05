import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserModel, { UserInstance } from '../../common/models/User';
import { RegisterPayload } from '../schemas/registerPayload';
import config from '../../config';
import { Request, Response } from 'express';
import { LoginPayload } from '../schemas/loginPayload';

const jwtSecret = process.env.JWT_SECRET!;
const jwtExpirationInSeconds = process.env.JWT_EXPIRATION_SECS ?? '3000';

// Generates an Access Token using username and userId for the user's authentication
const generateAccessToken = (username: string, userId: number): string => {
  return jwt.sign(
    {
      userId,
      username,
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

export default {
  register: (req: Request<{}, {}, RegisterPayload> , res: Response) => {
    const payload = req.body;

    const encryptedPassword: string = encryptPassword(payload.password);
    let role = payload.role;

    if (!role) {
      role = config.roles.USER;
    }

    UserModel.createUser(
      Object.assign(payload, { password: encryptedPassword, role })
    )
      .then((user: UserInstance) => {
        // Generating an AccessToken for the user, which will be
        // required in every subsequent request.
        const accessToken = generateAccessToken(payload.username, user.id);

        return res.status(200).json({
          status: true,
          data: {
            user: user.toJSON(),
            token: accessToken,
          },
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  login: (req: Request<{}, {}, LoginPayload>, res: Response) => {
    const { username, password } = req.body as { username: string; password: string };

    UserModel.findUser({ username })
      .then((user: any) => {
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
        const accessToken = generateAccessToken(user.username, user.id);

        return res.status(200).json({
          status: true,
          data: {
            user: user.toJSON(),
            token: accessToken,
          },
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
