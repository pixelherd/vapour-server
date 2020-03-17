const router = require('express').Router();

const userController = require('../controllers/users')

//Login Page
router.get('/login', userController.greet)

//Find user by id
router.get('/find', userController.findById)

//Register Page
router.get('/register', userController.getRegister)

//Register Handle
router.post('/register', userController.postRegister)

//Login
router.post('/login', userController.login);

//Logout
router.get('/logout', userController.logout);

module.exports = router;