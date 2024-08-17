var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var multer = require('multer');
var SCENARIO_ASSIGNMENT_CONTROLLER = require('../controllers/scenarioAssignmentsController');
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

router.post('/createScenarioAssignment',auth.verifyToken, upload.fields([{ name: 'audio', maxCount: 1 },{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 10 }]),SCENARIO_ASSIGNMENT_CONTROLLER.createScenarioAssignment)
router.get('/getScenarioAssignment',auth.verifyToken, SCENARIO_ASSIGNMENT_CONTROLLER.getScenarioAssignment)
router.put('/updateScenarioAssignment/:id',auth.verifyToken,upload.fields([{ name: 'audio', maxCount: 1 },{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 10 }]),SCENARIO_ASSIGNMENT_CONTROLLER.updateScenarioAssignment)
router.delete('/deleteScenarioAssignment/:id',auth.verifyToken,SCENARIO_ASSIGNMENT_CONTROLLER.deleteScenarioAssignment)


module.exports = router;
