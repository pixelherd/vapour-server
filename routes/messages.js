const router = require('express').Router();
const {getAll, postMessage} = require('../controllers/messages');

router.get('/', getAll);

router.post('/', postMessage);

module.exports = router;
