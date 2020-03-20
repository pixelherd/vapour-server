const router = require('express').Router();
const userController = require('../controllers/users')
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cors = require('cors');

//Login Page
router.get('/login', userController.greet)

//Find user by id
router.get('/find', userController.findById)

//Find current user by id
router.get('/find-current', userController.findUserById)

//Find all users in the DB
router.get('/find-all', userController.findAll)

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

// Private auth route: get current user 
router.get('/current', passport.authenticate('jwt', {session: false}), userController.getCurrentUser)

module.exports = router;