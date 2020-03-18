const router = require('express').Router();
const userController = require('../controllers/users')
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const cors = require('cors');

//Login Page
router.get('/login', userController.greet)

//Find user by id
router.get('/find', userController.findById)

//Register Page
router.get('/register', userController.getRegister)

//Register Handle
router.post('/register', userController.postRegister)

//Login

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/current',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Login with json webtoken
router.post('/api/login', cors(), userController.tokenLogin);

//Logout
router.get('/logout', userController.logout);

//New thread
router.post('/new-thread', userController.postNewThread);

// Private auth route: get current user 
router.get('/current', passport.authenticate('jwt', {session: false}), userController.getCurrentUser)

module.exports = router;