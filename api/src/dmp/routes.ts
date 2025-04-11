import { Router } from 'express';
import { DmpController } from './controllers/DmpController';

import DmpService from './services/DmpService';
import PdfService from './services/PdfService';
import LlmService from './services/KE_LLM_Service';

const router = Router();

// Middleware Imports
// import isAuthenticatedMiddleware from '../common/middlewares/IsAuthenticatedMiddleware';
// import SchemaValidationMiddleware from '../common/middlewares/SchemaValidationMiddleware';
// import CheckPermissionMiddleware from '../common/middlewares/CheckPermissionMiddleware';

const dmpController = DmpController({
  dmpService: DmpService,
  pdfService: PdfService,
  llmService: LlmService,
});

router.post('/id', dmpController.getDmpReportById);
router.post('/text', dmpController.getDmpReportByText);

export default router;

