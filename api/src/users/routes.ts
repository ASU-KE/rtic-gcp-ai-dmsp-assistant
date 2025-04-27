import { Router } from 'express';

// Middleware Imports
import isAuthenticatedMiddleware from './../common/middlewares/IsAuthenticatedMiddleware';
import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';
import CheckPermissionMiddleware from '../common/middlewares/CheckPermissionMiddleware';

// Controller Imports
import UserController from './controllers/UserController';
import { UserService } from './services/UserService';

// JSON Schema Imports for payload verification
import updateUserPayload from './schemas/updateUserPayload';
import changeRolePayload from './schemas/changeRolePayload';

import config, { Role } from '../config';
const roles = config.roles;
const router = Router();

// Instantiate the controller with the service injected
const userController = new UserController(UserService);

router.get('/', [isAuthenticatedMiddleware.check], userController.getUser);

router.patch(
  '/',
  [
    isAuthenticatedMiddleware.check,
    SchemaValidationMiddleware.verify(updateUserPayload),
  ],
  userController.updateUser
);

router.get(
  '/all',
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN as Role),
  ],
  userController.getAllUsers
);

router.patch(
  '/change-role/:userId',
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN as Role),
    SchemaValidationMiddleware.verify(changeRolePayload),
  ],
  userController.changeRole
);

router.delete(
  '/:userId',
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN as Role),
  ],
  userController.deleteUser
);

export default router;
