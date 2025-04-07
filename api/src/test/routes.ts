import { Router } from 'express';

const router: Router = Router();

// Controller Imports
import TestController from './controllers/TestController';

router.get('/hello', TestController.getHello);

export default router;
