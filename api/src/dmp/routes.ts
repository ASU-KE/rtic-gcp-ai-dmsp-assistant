import { Router } from 'express';

const router = Router();

// Controller Imports
import DmpController from './controllers/DmpController';

// Middleware Imports
// import isAuthenticatedMiddleware from '../common/middlewares/IsAuthenticatedMiddleware';
// import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';
// import CheckPermissionMiddleware from '../common/middlewares/CheckPermissionMiddleware';

router.post('/id', DmpController.getDmpReportById);
router.post('/text', DmpController.getDmpReportByText);

export default router;
