const router = require('express').Router();

// Controller Imports
const TestController = require('./controllers/TestController');

router.get('/hello', TestController.getHello);

module.exports = router;
