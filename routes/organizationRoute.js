var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var ORGANIZATION_CONTROLLER = require('../controllers/organizationController')
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

router.post('/createOrganization',upload.single('logo'), auth.verifyToken,ORGANIZATION_CONTROLLER.createOrganization)
router.get('/getOrganization',auth.verifyToken,ORGANIZATION_CONTROLLER.getOrganization)
router.put('/updateOrganization/:id',upload.single('logo'),auth.verifyToken,ORGANIZATION_CONTROLLER.updateOrganization)
router.delete('/deleteOrganization/:id',auth.verifyToken,ORGANIZATION_CONTROLLER.deleteOrganization)
router.put('/updatePassword/:id',auth.verifyToken,ORGANIZATION_CONTROLLER.updatePassword)

module.exports = router;
