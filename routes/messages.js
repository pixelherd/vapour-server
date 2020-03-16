const router = require('express').Router();
const messagesContoller = require('../controllers/messages');

router.get('/', messagesContoller.getAll);

router.post('/', messagesContoller.postMessage);

module.exports = router;
