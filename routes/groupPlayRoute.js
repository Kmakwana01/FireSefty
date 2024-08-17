var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var GROUP_PLAY_CONTROLLER = require('../controllers/groupPlayController');
const GROUP_PLAY = require('../models/appGroupPlayModel');
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

router.post('/createGroup', auth.verifyToken, GROUP_PLAY_CONTROLLER.createGroup)
router.get('/getGroup', auth.verifyToken, GROUP_PLAY_CONTROLLER.getGroup)
router.put('/updateGroup/:id', auth.verifyToken, GROUP_PLAY_CONTROLLER.updateGroup)
router.delete('/deleteGroup/:id', auth.verifyToken, GROUP_PLAY_CONTROLLER.deleteGroup)

router.post('/addPlayerInGroup',auth.verifyToken, GROUP_PLAY_CONTROLLER.addPlayerInGroup)
router.get('/getGroupPlayers/:id', auth.verifyToken, GROUP_PLAY_CONTROLLER.getGroupPlayers)
router.delete('/removePlayerFromGroup/:id',auth.verifyToken, GROUP_PLAY_CONTROLLER.removePlayerFromGroup)

router.post('/startGame', auth.verifyToken,GROUP_PLAY_CONTROLLER.startGame)
router.put('/statusChangeForPlayer/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.statusChangeForPlayer)
router.post('/groupPlayStart', auth.verifyToken, GROUP_PLAY_CONTROLLER.groupPlayStart)
router.post('/updateGroupPlay', auth.verifyToken, GROUP_PLAY_CONTROLLER.updateGroupPlay)


// ----------------------------------------------------------------CRUD OF LOBBY----------------------------------------------------------------
router.post('/createGroupLobby', auth.verifyToken,upload.single('file'),GROUP_PLAY_CONTROLLER.createGroupLobby)
router.get('/getGroupLobby',auth.verifyToken,GROUP_PLAY_CONTROLLER.getGroupLobby)
router.put('/updateGroupLobby/:id',upload.single('file'), auth.verifyToken,GROUP_PLAY_CONTROLLER.updateGroupLobby)
router.delete('/deleteGroupLobby/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.deleteGroupLobby)
router.get('/outGoingRequest/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.outGoingRequest)

//------------------------------------------------------------------PLAYER SIDE----------------------------------------------------------------
router.get('/groupPlayRequestsFromHost',auth.verifyToken,GROUP_PLAY_CONTROLLER.groupPlayRequestsFromHost)
router.get('/getOrganizationGames',auth.verifyToken,GROUP_PLAY_CONTROLLER.getOrganizationGames)
router.get('/getDataFromGames/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.getDataFromGames)
router.post('/requestToJoin',auth.verifyToken,GROUP_PLAY_CONTROLLER.requestToJoin)

//------------------------------------------------------------------HOST SIDE----------------------------------------------------------------

router.get('/inComingRequest/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.inComingRequest)
router.put('/statusChangeForHost/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.statusChangeForHost)

//------------------------------------------------------------------GROUP PLAY RESULT SIDE----------------------------------------------------------------


router.get('/singlePlayerResult',auth.verifyToken,GROUP_PLAY_CONTROLLER.singlePlayerResult)
router.get('/groupPlayResult',auth.verifyToken,GROUP_PLAY_CONTROLLER.groupPlayResult)
// router.get('/groupPlayResultAnalytics/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.groupPlayResultAnalytics)

router.get('/getGroupPlayToGamePlayers/:id',auth.verifyToken,GROUP_PLAY_CONTROLLER.getGroupPlayToGamePlayers)

module.exports = router;
