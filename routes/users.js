const router = require('express').Router();
const userController = require('../controllers/users')
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cors = require('cors');


//Find user by id
router.get('/find', userController.findById)

//Find current user by id
router.get('/find-current', userController.findUserById)

//Find all users in the DB
router.get('/find-all', userController.findAll)

//Register Handle
router.post('/register', userController.postRegister)

//Login
router.post('/login', userController.login)

//Logout
router.get('/logout', userController.logout);

//Session handle
router.get('/', userController.session);

module.exports = router;