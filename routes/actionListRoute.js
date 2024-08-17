var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var ACTION_LIST_CONTROLLER = require('../controllers/actionListController')



router.post('/createActionList', auth.verifyToken, ACTION_LIST_CONTROLLER.createActionList)
router.get('/getActionList/:id', auth.verifyToken, ACTION_LIST_CONTROLLER.getActionList)
router.put('/updateActionList/:id', auth.verifyToken, ACTION_LIST_CONTROLLER.updateActionList)
router.delete('/deleteActionList/:id', auth.verifyToken, ACTION_LIST_CONTROLLER.deleteActionList)

router.post('/updateIndex/:id', auth.verifyToken, ACTION_LIST_CONTROLLER.updateIndex)


module.exports = router;
