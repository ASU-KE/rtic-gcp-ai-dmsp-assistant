import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt';
import { Strategy as CasStrategy } from 'passport-cas2';
import { UserService } from '../modules/users/services/UserService';
import { User } from '../entities/User';

interface JwtPayload {
  userId: number;
  username: string;
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

export const configurePassport = (userService: UserService) => {
  // if (!jwtOptions.secretOrKey) {
  //   throw new Error('JWT_SECRET is not defined in environment variables');
  // }

  // passport.use(
  //   new JwtStrategy(
  //     jwtOptions,
  //     (payload: JwtPayload, done: VerifiedCallback) => {
  //       userService
  //         .findUser({ id: payload.userId })
  //         .then((user) =>
  //           user
  //             ? done(null, {
  //                 userId: user.id,
  //                 username: user.username,
  //                 role: user.role,
  //               })
  //             : done(null, false)
  //         )
  //         .catch((err) => done(err, false));
  //     }
  //   )
  // );
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // --- 🟡 CAS Strategy (for VITE_FRONTEND_AUTH === 'cas') ---
  if (process.env.VITE_FRONTEND_AUTH === 'cas') {
    // passport.use(
    //   new CasStrategy(
    //     {
    //       version: 'CAS3.0', // Or 'CAS4.0'
    //       ssoBaseURL: 'https://weblogin.asu.edu/cas/',
    //       serverBaseURL: 'https://dmsp.dev.rtd.asu.edu',
    //       serviceURL: `https://dmsp.dev.rtd.asu.edu/login/cas/callback`,
    //     },
    //     async (login: string, profile: any, done: VerifiedCallback) => {
    //       try {
    //         // You can later fetch from DB or create the user
    //         // const existingUser: User | null = await userService.findUserByUsername?.(login);

    //         // if (existingUser) {
    //         //   return done(null, {
    //         //     userId: existingUser.id,
    //         //     username: existingUser.username,
    //         //     role: existingUser.role,
    //         //   });
    //         // } else {
    //         //   // Optionally: auto-create the user or deny
    //           return done(null, { login });
    //         // }
    //       } catch (err) {
    //         return done(err, false);
    //       }
    //     }
    //   )
    // );
    passport.use(new CasStrategy({
      casURL: 'https://weblogin.asu.edu/cas/login?'  // use correct URL for ASU CAS
    }, (login: any, done: any) => {
      return done(null, { login });
    }));
  }
};
