import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt';
import { UserService } from '../../users/services/UserService';

interface JwtPayload {
  userId: number;
  username: string;
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

export const configurePassport = (userService: UserService) => {
  if (!jwtOptions.secretOrKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  passport.use(
    new JwtStrategy(
      jwtOptions,
      (payload: JwtPayload, done: VerifiedCallback) => {
        userService
          .findUser({ id: payload.userId })
          .then((user) => (user ? done(null, user) : done(null, false)))
          .catch((err) => done(err, false));
      }
    )
  );
};
