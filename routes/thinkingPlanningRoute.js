var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var THINKING_PLANNING_CONTROLLER = require('../controllers/thinkingPlanningController')



router.post('/createThinkingPlanning',auth.verifyToken,THINKING_PLANNING_CONTROLLER.createThinkingPlanning);
router.get('/getThinkingPlanning/:id',auth.verifyToken,THINKING_PLANNING_CONTROLLER.getThinkingPlanning)
router.put('/updateThinkingPlanning/:id',auth.verifyToken,THINKING_PLANNING_CONTROLLER.updateThinkingPlanning);
router.delete('/deleteThinkingPlanning/:id',auth.verifyToken,THINKING_PLANNING_CONTROLLER.deleteThinkingPlanning)
router.put("/updateThinkingPlanningPublish/:id",auth.verifyToken,THINKING_PLANNING_CONTROLLER.updateThinkingPlanningPublish)


module.exports = router;
