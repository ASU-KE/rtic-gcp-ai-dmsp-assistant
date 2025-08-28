import { Router } from 'express';

// Middleware Imports
import { checkPermission } from '../middlewares/check-permission.middleware';

// Controller Imports
import SubmissionController from '../modules/submissions/controllers/SubmissionController';
import { SubmissionService } from '../modules/submissions/services/SubmissionService';

import config, { Role } from '../config/app.config';

const roles = config.roles;

// Export a function that takes SubmissionService instance
export default (submissionService: SubmissionService) => {
  const router = Router();

  // instantiate controller and permission middleware with injected service
  const submissionController = new SubmissionController(submissionService);

  router.get(
    '/',
    [checkPermission(roles.ADMIN as Role)],
    submissionController.getAllSubmissions
  );

  router.get(
    '/export',
    [checkPermission(roles.ADMIN as Role)],
    submissionController.exportSubmissionsExcel
  );

  return router;
};

