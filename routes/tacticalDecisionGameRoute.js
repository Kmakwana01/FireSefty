var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var TACTICAL_DECISION_GAME_CONTROLLER = require('../controllers/tacticalDecisionGameController');
const TACTICAL_DECISION_GAME = require('../models/tacticalDecisionGameModel');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let extension = path.extname(file.originalname)
        cb(null, Date.now() + uniqueSuffix + extension)
    }
})

const upload = multer({ storage: storage })

const multipleUpload = upload.any([{ name: 'audio', maxCount: 4 }, { name: 'image', maxCount: 4}]);

// router.post('/createTacticalDecisionGame',auth.verifyToken,upload.fields([{ name: 'audio', maxCount: 4 }, { name: 'image', maxCount: 4}]),TACTICAL_DECISION_GAME_CONTROLLER.createTacticalDecisionGame)


router.post('/createTacticalDecisionGame',auth.verifyToken,multipleUpload,TACTICAL_DECISION_GAME_CONTROLLER.createTacticalDecisionGame)

router.get('/getTacticalDecisionGame/:id',auth.verifyToken,TACTICAL_DECISION_GAME_CONTROLLER.getTacticalDecisionGame)

// router.put('/updateTacticalDecisionGame/:id',auth.verifyToken,upload.fields([{ name: 'audios', maxCount: 1 }, { name: 'images', maxCount: 10 }]),TACTICAL_DECISION_GAME_CONTROLLER.updateTacticalDecisionGame)

router.put('/updateTacticalDecisionGame/:id',auth.verifyToken,multipleUpload,TACTICAL_DECISION_GAME_CONTROLLER.updateTacticalDecisionGame)

router.delete('/deleteTacticalDecisionGame/:id',auth.verifyToken,TACTICAL_DECISION_GAME_CONTROLLER.deleteTacticalDecisionGame)
router.put('/updateTacticalDecisionGamePublish/:id',auth.verifyToken, TACTICAL_DECISION_GAME_CONTROLLER.updateTacticalDecisionGamePublish)


module.exports = router;
