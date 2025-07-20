import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { UserService } from '../modules/users/services/UserService';

export const serializeUser = passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, username: user.username });
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
      // Search for user by username
      userService.findUser({ username }).then((user) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' }); // reject authentication attempt
        }

        userService.verifyPassword(user, password).then((isMatch) => {
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' }); // password incorrect, reject authentication attempt
          }

          return done(null, user); // authentication successful
        }).catch((err) => {
          return done(err);
        });
      }).catch((err) => {
        return done(err);
      });
    }
  ));
};
