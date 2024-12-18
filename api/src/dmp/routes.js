const router = require('express').Router();

// Controller Imports
const DmpController = require('./controllers/DmpController');

// Middleware Imports
// const isAuthenticatedMiddleware = require('../common/middlewares/IsAuthenticatedMiddleware');
// const SchemaValidationMiddleware = require('../common/middlewares/SchemaValidationMiddleware');
// const CheckPermissionMiddleware = require('../common/middlewares/CheckPermissionMiddleware');

router.post('/id', DmpController.getDmpReportById);
router.post('/text', DmpController.getDmpReportByText);

module.exports = router;
