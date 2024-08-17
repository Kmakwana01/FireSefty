var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var APPARATUS_CONTROLLER = require('../controllers/apparatusController')



router.post('/createApparatus', auth.verifyToken, APPARATUS_CONTROLLER.createApparatus)
router.get('/getApparatus', auth.verifyToken, APPARATUS_CONTROLLER.getApparatus)
router.put('/updateApparatus/:id', auth.verifyToken, APPARATUS_CONTROLLER.updateApparatus)
router.delete('/deleteApparatus/:id', auth.verifyToken, APPARATUS_CONTROLLER.deleteApparatus)


module.exports = router;
