var express = require('express');
var router = express.Router();
var USER_CONTROLLER = require('../controllers/userController')
var AUTH = require('../middleware/auth');

router.post('/signup',USER_CONTROLLER.signUp);
router.post('/login',USER_CONTROLLER.logIn);
router.post('/forgetPassword',USER_CONTROLLER.forgetPassword);
router.post('/compareCode',USER_CONTROLLER.compareCode);
router.post('/resetPassword',USER_CONTROLLER.resetPassword);
router.post('/logout',AUTH.verifyToken, USER_CONTROLLER.logOut)
// router.post('/logout',AUTH.verifyToken, USER_CONTROLLER.logOut)
router.post('/token',USER_CONTROLLER.token)
router.get('/token/:token', AUTH.verifyToken , USER_CONTROLLER.tokenVerify);

module.exports = router;
