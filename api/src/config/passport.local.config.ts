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
    function(username, password, done) {
      userService.findUser({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
};
