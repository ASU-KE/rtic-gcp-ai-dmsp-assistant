import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { UserService } from '../modules/users/services/UserService';

export const serializeUser = passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user.id);
  });
});

export const deserializeUser = (UserService: UserService) =>
  passport.deserializeUser(function (id, cb) {
    UserService.findUser({ id: id as number })
      .then((user) => {
        if (!user) {
          return cb(null, false);
        }
        return cb(null, user);
      })
      .catch((err) => {
        return cb(err);
      });
  });

export const configurePassport = (userService: UserService) => {
  passport.use(new LocalStrategy(
    (username, password, done) => {
      userService.findUser({ username }).then((user) => {
        if (!user) {
          return done(null, false);
        }

        const hashedPassword = user.password;
        userService.verifyPassword(hashedPassword, password).then((isMatch) => {
          if (!isMatch) {
            return done(null, false);
          }

          return done(null, user);
        }).catch((err) => {
          return done(err);
        });
      }).catch((err) => {
        return done(err);
      });
    }
  ));
};
