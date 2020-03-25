const router = require("express").Router();
const userController = require("../controllers/users");

//Find user by id
router.get("/find", userController.findById);

//Find current user by id
router.get("/find-current", userController.findUserById);

//Update current user
router.put("/update-current", userController.updateCurrent);

//Find all users in the DB
router.get("/find-all", userController.findAll);

//Register Handle
router.post("/register", userController.postRegister);

//Login
router.post("/login", userController.login);

//Logout
router.get("/logout", userController.logout);

//Session handle
router.get("/", userController.session);

module.exports = router;
