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
import config from '../config/app.config';

export const initPassport = (app: Express, userService: UserService) => {
  passport.use(
    new SamlStrategy(
      {
        path: '/api/sso/login/callback',
        // callbackUrl: config.auth.saml.callbackUrl,
        entryPoint: config.auth.saml.entryPoint,
        issuer: config.auth.saml.issuer,
        cert: config.auth.saml.cert,
        // wantAssertionsSigned: true,
        wantAuthnResponseSigned: false, // test provider doesn't sign the response payload
      },
      (profile: Profile | null | undefined, done: VerifiedCallback) => {
        // for signon

        if (!profile) {
          return done(new Error('SSO failed'));
        }

        if (profile != null && typeof profile.nameID === 'string')
          console.log(
            `SAML login profile received: ${JSON.stringify(profile)}`
          );

        userService
          .findUser({ username: profile.nameID })
          .then((user) => {
            if (!user) {
              // If user does not exist, create a new user

              userService
                .createUser({
                  username: profile.nameID,
                  email: profile.nameID,
                  password: crypto
                    .getRandomValues(new Uint8Array(32))
                    .toString(), // Secure random password for SAML users
                  firstName: '',
                  lastName: '',
                  role: 'user', // default role
                })
                .then((newUser) => {
                  const userDTO = plainToClass(User, newUser, {
                    excludeExtraneousValues: true,
                  });
                  return done(null, instanceToPlain(userDTO));
                })
                .catch((err) => {
                  return done(
                    err instanceof Error ? err : new Error(String(err))
                  );
                });
            } else {
              // If user exists, return the user
              const userDTO = plainToClass(User, user, {
                excludeExtraneousValues: true,
              });

              console.log(
                `SAML user found: ${JSON.stringify(instanceToPlain(userDTO))} `
              );
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

        console.log(`SAML logout profile received: ${JSON.stringify(profile)}`);

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
