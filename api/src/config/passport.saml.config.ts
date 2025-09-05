import passport from 'passport';
import {
  Strategy as SamlStrategy,
  Profile,
  VerifiedCallback,
} from '@node-saml/passport-saml';
import { MetadataReader, toPassportConfig } from 'passport-saml-metadata';
import fs from 'fs';
import path from 'path';

import { User } from '../entities/user.entity';
import { UserService } from '../modules/users/services/UserService';
import { plainToClass, instanceToPlain } from 'class-transformer';
import config from './app.config';

export const getSamlStrategy = (userService: UserService) => {
  // Read and parse the SAML IdP metadata XML file
  const reader = new MetadataReader(
    fs.readFileSync(path.join(__dirname, '../config/saml-idp-metadata.xml'), 'utf8')
  );
  const { entryPoint, logoutUrl, idpCert: cert } = toPassportConfig(reader);

  const spConfig = {
      callbackUrl: config.auth.saml.callbackUrl,
      logoutCallbackUrl: config.auth.saml.logoutCallbackUrl,
      issuer: config.auth.saml.issuer,
      privateKey: config.auth.saml.spPrivateKey,
      decryptionPvk: config.auth.saml.spPrivateKey,
  };

  const strategy = new SamlStrategy(
    {
      entryPoint,
      logoutUrl,
      cert,
      ...spConfig,
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

            console.log(
              `SAML user not found, creating new user: ${profile.nameID}`
            );
            const userDetail = {
              username: profile.nameID,
              email: profile.nameID,
              password: '', // No password for SAML users
              firstName: 'Test first name',
              lastName: 'Test last name',
              role: 'user', // default role
            };
            userService
              .createUser(userDetail)
              .then((newUser) => {
                console.log(`SAML user created: ${JSON.stringify(newUser)}`);
                const userDTO = plainToClass(User, newUser, {
                  excludeExtraneousValues: true,
                });
                return done(null, instanceToPlain(userDTO));
              })
              .catch((err) => {
                console.error(`Error creating SAML user: ${err}`);
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
  );

  return strategy;
};

export const generateSamlMetadata = (samlStrategy: SamlStrategy) => {
  samlStrategy.generateServiceProviderMetadata(
    config.auth.saml.spPrivateKey,
    config.auth.saml.spPrivateKey
    );
};

export const initSamlPassport = (samlStrategy: SamlStrategy, userService: UserService) => {
  passport.use(samlStrategy);

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
