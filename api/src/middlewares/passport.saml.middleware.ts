import { Express } from 'express';
import passport from 'passport';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';

import { User } from '../entities/user.entity';
import { UserService } from '../modules/users/services/UserService';
import { plainToClass } from 'class-transformer';

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
      (profile, done) => {
        // for signon
        userService
          .findUser({ username: profile.nameID })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: 'Incorrect username or password.',
              }); // reject authentication attempt
            }

            userService
              .verifyPassword(user, password)
              .then((isMatch) => {
                if (!isMatch) {
                  return done(null, false, {
                    message: 'Incorrect username or password.',
                  }); // password incorrect, reject authentication attempt
                }

                return done(null, user); // authentication successful
              })
              .catch((err) => {
                return done(err);
              });
          })
          .catch((err) => {
            return done(err);
          });
      },
      (profile, done) => {
        // for logout
        findByNameID(profile.nameID, (err, user) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
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
        return cb(err);
      });
  });
};
