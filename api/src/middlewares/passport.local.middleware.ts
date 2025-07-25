import { Express } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { User } from '../entities/user.entity';
import { UserService } from '../modules/users/services/UserService';

export const initLocalPassport = (app: Express, userService: UserService) => {
  passport.use(
    new LocalStrategy((username, password, done) => {
      userService
        .findUser({ username })
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
    })
  );

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, { id: user.id, role: user.role, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName });
    });
  });

  passport.deserializeUser(function (user: User, cb) {
    userService
      .findUser({ id: user.id })
      .then((user) => {
        if (!user) {
          return cb(null, false);
        }
        return cb(null, {id: user.id, role: user.role, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName});
      })
      .catch((err) => {
        return cb(err);
      });
  });
};
