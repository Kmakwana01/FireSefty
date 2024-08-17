var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var ASSIGNMENT_CONTROLLER = require('../controllers/assignmentController')



router.post('/createAssignment',auth.verifyToken,ASSIGNMENT_CONTROLLER.createAssignment)
router.get('/getAssignment/:id',auth.verifyToken,ASSIGNMENT_CONTROLLER.getAssignment)
router.put('/updateAssignment/:id',auth.verifyToken,ASSIGNMENT_CONTROLLER.updateAssignment)
router.delete('/deleteAssignment/:id',auth.verifyToken,ASSIGNMENT_CONTROLLER.deleteAssignment)

router.post('/updateIndex/:id',auth.verifyToken,ASSIGNMENT_CONTROLLER.updateIndex)

module.exports = router;
