var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var INCIDENT_TYPE_CONTROLLER = require('../controllers/incidentTypeController')



router.post('/createIncidentType',auth.verifyToken,INCIDENT_TYPE_CONTROLLER.createIncidentType)
router.get('/getIncidentType/:id',auth.verifyToken,INCIDENT_TYPE_CONTROLLER.getIncidentType)
router.put('/updateIncidentType/:id',auth.verifyToken,INCIDENT_TYPE_CONTROLLER.updateIncidentType)
router.delete('/deleteIncidentType/:id',auth.verifyToken,INCIDENT_TYPE_CONTROLLER.deleteIncidentType)

router.post('/updateIndex/:id',auth.verifyToken,INCIDENT_TYPE_CONTROLLER.updateIndex)


module.exports = router;
