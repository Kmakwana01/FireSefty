var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var OBJECTIVES_CONTROLLER = require('../controllers/objectivesController')


router.post('/createObjectives', auth.verifyToken,OBJECTIVES_CONTROLLER.createObjectives)
router.get('/getObjectives/:id', auth.verifyToken, OBJECTIVES_CONTROLLER.getObjectives)
router.put('/updateObjectives/:id', auth.verifyToken, OBJECTIVES_CONTROLLER.updateObjectives)
router.delete('/deleteObjectives/:id', auth.verifyToken, OBJECTIVES_CONTROLLER.deleteObjectives)


router.post('/updateIndex/:id', auth.verifyToken, OBJECTIVES_CONTROLLER.updateIndex)


module.exports = router;
