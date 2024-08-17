var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var SCENARIO_CONTROLLER = require('../controllers/scenarioController')


router.post('/createScenario', auth.verifyToken, SCENARIO_CONTROLLER.createScenario)
router.get('/getScenario', auth.verifyToken, SCENARIO_CONTROLLER.getScenario)
router.put('/updateScenario/:id', auth.verifyToken, SCENARIO_CONTROLLER.updateScenario)
router.delete('/deleteScenario/:id', auth.verifyToken, SCENARIO_CONTROLLER.deleteScenario)
router.put('/updateScenarioPublish/:id',auth.verifyToken, SCENARIO_CONTROLLER.updateScenarioPublish)

module.exports = router;
