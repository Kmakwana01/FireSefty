var express = require('express');
var router = express.Router();

var auth = require("../middleware/auth")
var RESPONSE_TYPE_CONTROLLER = require('../controllers/responseTypeController')



router.post('/createResponseType',auth.verifyToken,RESPONSE_TYPE_CONTROLLER.createResponseType)
router.get('/getResponseType',auth.verifyToken,RESPONSE_TYPE_CONTROLLER.getResponseType)
router.put('/updateResponseType/:id',auth.verifyToken,RESPONSE_TYPE_CONTROLLER.updateResponseType)
router.delete('/deleteResponseType/:id',auth.verifyToken,RESPONSE_TYPE_CONTROLLER.deleteResponseType)

router.post('/updateIndex',auth.verifyToken,RESPONSE_TYPE_CONTROLLER.updateIndex)


module.exports = router;
