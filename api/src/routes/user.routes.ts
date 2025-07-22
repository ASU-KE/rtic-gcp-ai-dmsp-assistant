import { Router } from 'express';

// Middleware Imports
import SchemaValidationMiddleware from '../middlewares/schema-validation.middleware';
import { checkPermission } from '../middlewares/check-permission.middleware';

// Controller Imports
import UserController from '../modules/users/controllers/UserController';
import { UserService } from '../modules/users/services/UserService';

// JSON Schema Imports for payload verification
import changeRolePayload from '../modules/users/schemas/change-role.schema';
import createUserPayload from '../modules/users/schemas/create-user.schema';
import updateUserPayload from '../modules/users/schemas/update-user.schema';

import config, { Role } from '../config/app.config';
const roles = config.roles;

// Export a function that takes UserService instance
export default (userService: UserService) => {
  const router = Router();

  // instantiate controller and permission middleware with injected service
  const userController = new UserController(userService);

  router.get('/', userController.getUser);

  router.post(
    '/create/',
    [
      checkPermission(roles.ADMIN as Role),
      SchemaValidationMiddleware.verify(createUserPayload),
    ],
    userController.createUser
  );

  router.patch(
    '/update/:userId',
    [
      checkPermission(roles.ADMIN as Role),
      SchemaValidationMiddleware.verify(updateUserPayload),
    ],
    userController.updateUser
  );

  router.get(
    '/all',
    [checkPermission(roles.ADMIN as Role)],
    userController.getAllUsers
  );

  router.patch(
    '/change-role/:userId',
    [
      checkPermission(roles.ADMIN as Role),
      SchemaValidationMiddleware.verify(changeRolePayload),
    ],
    userController.changeRole
  );

  router.delete(
    '/delete/:userId',
    [checkPermission(roles.ADMIN as Role)],
    userController.deleteUser
  );

  return router;
};
