var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var SINGLE_PLAYER_CONTROLLER = require('../controllers/singlePlayerController')

router.get('/getAllData',auth.verifyToken,SINGLE_PLAYER_CONTROLLER.getAllData)
router.get('/getTacticalDecisionGameAndTdgLibrary/:id', auth.verifyToken, SINGLE_PLAYER_CONTROLLER.getTacticalDecisionGameAndTdgLibrary)
router.post('/saveTacticalDecisionGameListAnswer', auth.verifyToken, SINGLE_PLAYER_CONTROLLER.saveTacticalDecisionGameListAnswer)
router.get('/getStatistics/:id', auth.verifyToken, SINGLE_PLAYER_CONTROLLER.getStatistics)
// router.get('/getThinkingPlanningFromObjectives/:id',auth.verifyToken, SINGLE_PLAYER_CONTROLLER.getThinkingPlanningFromObjectives)
router.get('/getFunctionKeys',auth.verifyToken, SINGLE_PLAYER_CONTROLLER.getFunctionKeys)
router.post('/saveFunctionKeyAnswer',auth.verifyToken, SINGLE_PLAYER_CONTROLLER.saveFunctionKeyAnswer)
router.get('/getTacticalDecisionGameFromActionList',auth.verifyToken, SINGLE_PLAYER_CONTROLLER.getTacticalDecisionGameFromActionList)
router.get('/getStatisticsForGroupPlayResult/:id',auth.verifyToken, SINGLE_PLAYER_CONTROLLER.getStatisticsForGroupPlayResult)

module.exports = router;
