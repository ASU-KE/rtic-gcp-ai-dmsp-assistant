import { Router } from 'express';

// Middleware Imports
import isAuthenticatedMiddleware from './../common/middlewares/IsAuthenticatedMiddleware';
import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';
import CheckPermissionMiddleware from '../common/middlewares/CheckPermissionMiddleware';

// Controller Imports
import UserController from './controllers/UserController';

// JSON Schema Imports for payload verification
import updateUserPayload from './schemas/updateUserPayload';
import changeRolePayload from './schemas/changeRolePayload';

import { roles } from '../config';
const router = Router();

router.get('/', [isAuthenticatedMiddleware.check], UserController.getUser);

router.patch(
  '/',
  [
    isAuthenticatedMiddleware.check,
    SchemaValidationMiddleware.verify(updateUserPayload),
  ],
  UserController.updateUser
);

router.get(
  '/all',
  [isAuthenticatedMiddleware.check, CheckPermissionMiddleware.has(roles.ADMIN)],
  UserController.getAllUsers
);

router.patch(
  '/change-role/:userId',
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
    SchemaValidationMiddleware.verify(changeRolePayload),
  ],
  UserController.changeRole
);

router.delete(
  '/:userId',
  [isAuthenticatedMiddleware.check, CheckPermissionMiddleware.has(roles.ADMIN)],
  UserController.deleteUser
);

export default router;
