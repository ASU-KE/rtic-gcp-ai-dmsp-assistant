import { Router } from 'express';

const router: Router = Router();

// Controller Imports
import ExampleController from '../modules/example/controllers/ExampleController';

router.get('/hello', ExampleController.getHello);

export default router;
