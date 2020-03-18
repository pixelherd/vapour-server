const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
<<<<<<< HEAD
const { welcome } = require('../controllers/index');

router.get('/', welcome);
=======

router.get('/', (req, res) => res.render('welcome'))
>>>>>>> origin/dev
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    name: req.user.name,
    id: req.user._id
<<<<<<< HEAD
  })
);

module.exports = router;
=======
  }));

module.exports = router;
>>>>>>> origin/dev
