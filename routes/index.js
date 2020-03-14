const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// router.get('/', (req, res) => res.render('welcome')) 
router.get('/current', ensureAuthenticated, (req, res) =>
  res.json( {
    name: req.user.name,
    id: req.user._id
  }));

module.exports = router;