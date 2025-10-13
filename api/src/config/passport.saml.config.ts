import passport from 'passport';
import {
  Strategy as SamlStrategy,
  Profile,
  VerifiedCallback,
} from '@node-saml/passport-saml';
import { MetadataReader, toPassportConfig } from 'passport-saml-metadata';

import { User } from '../entities/user.entity';
import { UserService } from '../modules/users/services/UserService';
import { plainToClass, instanceToPlain } from 'class-transformer';
import config from './app.config';

export const getSamlStrategy = (userService: UserService) => {
  // Read and parse the SAML IdP metadata XML file
  const reader = new MetadataReader(config.auth.saml.idpMetadataFile);
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
      signatureAlgorithm: 'sha256',
      ...spConfig,
    },
    (profile: Profile | null | undefined, done: VerifiedCallback) => {
      // for signon

      if (!profile) {
        return done(new Error('SSO failed'));
      }

      userService
        .findUser({ username: profile.nameID })
        .then((user) => {
          if (!user) {
            // If user does not exist, create a new user
            const userDetail = {
              username: profile.nameID,
              email: profile.nameID,
              password: '', // No password for SAML users
              firstName:
                typeof profile['urn:oid:2.5.4.42'] === 'string'
                  ? profile['urn:oid:2.5.4.42']
                  : '',
              lastName:
                typeof profile['urn:oid:2.5.4.4'] === 'string'
                  ? profile['urn:oid:2.5.4.4']
                  : '',
              role: 'user', // default role
            };

            userService
              .createUser(userDetail)
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
  );

  return strategy;
};

export const generateSamlMetadata = (samlStrategy: SamlStrategy) => {
  return samlStrategy.generateServiceProviderMetadata(
    config.auth.saml.spPublicCert,
    config.auth.saml.spPublicCert
  );
};

export const initSamlPassport = (
  samlStrategy: SamlStrategy,
  userService: UserService
) => {
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
