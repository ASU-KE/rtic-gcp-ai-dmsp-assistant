import { Express } from 'express';
import passport from 'passport';
import {
  Strategy as SamlStrategy,
  Profile,
  VerifiedCallback,
} from '@node-saml/passport-saml';

import { User } from '../entities/user.entity';
import { UserService } from '../modules/users/services/UserService';
import { plainToClass, instanceToPlain } from 'class-transformer';

export const initPassport = (app: Express, userService: UserService) => {
  passport.use(
    new SamlStrategy(
      {
        path: '/login/callback',
        entryPoint:
          'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
        issuer: 'passport-saml',
        cert: 'fake cert', // cert must be provided
      },
      (profile: Profile | null | undefined, done: VerifiedCallback) => {
        // for signon

        if (!profile) {
          return done(new Error('SSO failed'));
        }

        if (profile != null && typeof profile.nameID === 'string')
          userService
            .findUser({ username: profile.nameID })
            .then((user) => {
              if (!user) {
                // If user does not exist, create a new user

                userService
                  .createUser({
                    username: profile.nameID,
                    email: profile.email ?? '',
                    // firstName: profile.givenName ?? '',
                    // lastName: profile.familyName ?? '',
                    role: 'user', // default role
                  })
                  .then((newUser) => {
                    const userDTO = plainToClass(User, newUser, {
                      excludeExtraneousValues: true,
                    });
                    return done(null, instanceToPlain(userDTO));
                  })
                  .catch((err) => {
                    return done(err instanceof Error ? err : new Error(String(err)));
                  });
              } else {
                // If user exists, return the user
                const userDTO = plainToClass(User, user, {
                  excludeExtraneousValues: true,
                });
                return done(null, instanceToPlain(userDTO));
              }
            })
            .catch((err) => {
              return done(err instanceof Error ? err : new Error(String(err)));
            });
      },
      (profile: Profile | null | undefined, done: VerifiedCallback) => {
        // for logout

        if (!profile) {
          return done(new Error('SSO logout failure'));
        }

        if (profile != null && typeof profile.nameID === 'string')
          userService
            .findUser({ username: profile.nameID })
            .then((user) => {
              if (!user) {
                return done(new Error('No user to log out'));
              } else {
                // If user exists, return the user
                const userDTO = plainToClass(User, user, {
                  excludeExtraneousValues: true,
                });
                return done(null, instanceToPlain(userDTO));
              }
            })
            .catch((err) => {
              return done(err instanceof Error ? err : new Error(String(err)));
            });
      }
    )
  );

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      const userDTO = plainToClass(User, user, {
        excludeExtraneousValues: true,
      });

      return cb(null, userDTO);
    });
  });

  passport.deserializeUser(function (user: User, cb) {
    userService
      .findUser({ id: user.id })
      .then((user) => {
        if (!user) {
          return cb(null, false);
        }
        const userDTO = plainToClass(User, user, {
          excludeExtraneousValues: true,
        });
        return cb(null, userDTO);
      })
      .catch((err) => {
        return cb(err instanceof Error ? err : new Error(String(err)));
      });
  });
};
