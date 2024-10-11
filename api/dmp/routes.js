const router = require('express').Router();

// Controller Imports
const DmpController = require('./controllers/DmpController');

// Middleware Imports
// const isAuthenticatedMiddleware = require('../common/middlewares/IsAuthenticatedMiddleware');
// const SchemaValidationMiddleware = require('../common/middlewares/SchemaValidationMiddleware');
// const CheckPermissionMiddleware = require('../common/middlewares/CheckPermissionMiddleware');

// DMP ids consist of a string containing a slash, we must parse as two params
router.post('/', DmpController.getDmpReportById);

module.exports = router;
