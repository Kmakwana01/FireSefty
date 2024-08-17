var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var PROFILE_CONTROLLER = require('../controllers/profileController');
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

router.post('/createProfile',upload.single('profileImage'), auth.verifyToken,PROFILE_CONTROLLER.createProfile)
router.get('/getProfile/:id', auth.verifyToken,PROFILE_CONTROLLER.getProfile)
router.put('/updateProfile/:id',upload.single('profileImage'), auth.verifyToken,PROFILE_CONTROLLER.updateProfile)
router.delete('/deleteProfile/:id',auth.verifyToken,PROFILE_CONTROLLER.deleteProfile)
router.get('/getFireFighters',auth.verifyToken,PROFILE_CONTROLLER.getFireFighters)
router.get('/getProfileUser/:id',auth.verifyToken,PROFILE_CONTROLLER.getProfileUser)
router.get('/getProfileById',auth.verifyToken,PROFILE_CONTROLLER.getProfileById)
router.post('/updatePasswordOfProfile',auth.verifyToken,PROFILE_CONTROLLER.updatePasswordOfProfile)
router.put('/updateProfileOfUser',upload.single('profileImage'),auth.verifyToken,PROFILE_CONTROLLER.updateProfileOfUser)

router.put('/OPPasswordUpdate',auth.verifyToken,PROFILE_CONTROLLER.updatePasswordOfOrganizationProfile)
module.exports = router;