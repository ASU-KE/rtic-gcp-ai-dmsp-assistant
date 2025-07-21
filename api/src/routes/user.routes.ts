import { Router } from 'express';

// Middleware Imports
import SchemaValidationMiddleware from '../middlewares/schema-validation.middleware';
import { CheckPermissionMiddleware } from '../middlewares/check-permission.middleware';

// Controller Imports
import UserController from '../modules/users/controllers/UserController';
import { UserService } from '../modules/users/services/UserService';

// JSON Schema Imports for payload verification
import updateUserPayload from '../modules/users/schemas/updateUserPayload';
import changeRolePayload from '../modules/users/schemas/changeRolePayload';

import config, { Role } from '../config/app.config';
const roles = config.roles;

// Export a function that takes UserService instance
export default (userService: UserService) => {
  const router = Router();

  // instantiate controller and permission middleware with injected service
  const userController = new UserController(userService);
  const checkPermissionMiddleware = CheckPermissionMiddleware(userService);

  router.get('/', userController.getUser);

  router.patch(
    '/update/:userId',
    [
      checkPermissionMiddleware.has(roles.ADMIN as Role),
      SchemaValidationMiddleware.verify(updateUserPayload),
    ],
    userController.updateUser
  );

  router.get(
    '/all',
    [checkPermissionMiddleware.has(roles.ADMIN as Role)],
    userController.getAllUsers
  );

  router.patch(
    '/change-role/:userId',
    [
      checkPermissionMiddleware.has(roles.ADMIN as Role),
      SchemaValidationMiddleware.verify(changeRolePayload),
    ],
    userController.changeRole
  );

  router.delete(
    '/delete/:userId',
    [checkPermissionMiddleware.has(roles.ADMIN as Role)],
    userController.deleteUser
  );

  return router;
};
