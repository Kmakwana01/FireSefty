var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var INCIDENT_PRIORITIES_CONTROLLER = require('../controllers/incidentPrioritiesController')
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

router.post('/createIncidentPriorities', auth.verifyToken,upload.single('icon'), INCIDENT_PRIORITIES_CONTROLLER.createIncidentPriorities)
router.get('/getIncidentPriorities/:id', auth.verifyToken, INCIDENT_PRIORITIES_CONTROLLER.getIncidentPriorities)
router.put('/updateIncidentPriorities/:id', auth.verifyToken,upload.single('icon'), INCIDENT_PRIORITIES_CONTROLLER.updateIncidentPriorities)
router.delete('/deleteIncidentPriorities/:id', auth.verifyToken, INCIDENT_PRIORITIES_CONTROLLER.deleteIncidentPriorities)


router.post('/updateIndex/:id', auth.verifyToken, INCIDENT_PRIORITIES_CONTROLLER.updateIndex)

module.exports = router;
