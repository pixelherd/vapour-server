const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { welcome } = require('../controllers/index');

router.get('/', welcome);
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    name: req.user.name,
    id: req.user._id
  })
);

module.exports = router;
