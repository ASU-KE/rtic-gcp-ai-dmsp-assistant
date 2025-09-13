import { Router } from 'express';

// Middleware Imports
import { checkPermission } from '../middlewares/check-permission.middleware';

// Controller Imports
import RubricController from '../modules/rubrics/controllers/RubricController';
import { RubricService } from '../modules/rubrics/services/RubricService';

import config, { Role } from '../config/app.config';

const roles = config.roles;

// Export a function that takes SubmissionService instance
export default (rubricService: RubricService) => {
  const router = Router();

  // instantiate controller and permission middleware with injected service
  const rubricController = new RubricController(rubricService);

  router.get(
    '/',
    [checkPermission(roles.ADMIN as Role)],
    rubricController.getAllRubrics
  );

  router.get(
    '/:agency',
    [checkPermission(roles.ADMIN as Role)],
    rubricController.getRubric
  );

  router.post(
    '/',
    [checkPermission(roles.ADMIN as Role)],
    rubricController.createRubric
  );

  router.patch(
    '/:agency',
    [checkPermission(roles.ADMIN as Role)],
    rubricController.updateRubric
  );

  router.delete(
    '/:agency',
    [checkPermission(roles.ADMIN as Role)],
    rubricController.deleteRubric
  );

  return router;
};
