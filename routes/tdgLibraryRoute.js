var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth")
var multer = require('multer');
var TDG_LIBRARY_CONTROLLER = require('../controllers/tdgLibraryController');
const TDG_LIBRARY = require('../models/tdgLibraryModel');
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

router.post('/createTdgLibrary',auth.verifyToken, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]),TDG_LIBRARY_CONTROLLER.createTdgLibrary)
router.get('/getTdgLibrary/:id',auth.verifyToken, TDG_LIBRARY_CONTROLLER.getTdgLibrary)
router.put('/updateTdgLibrary/:id',auth.verifyToken,upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]),TDG_LIBRARY_CONTROLLER.updateTdgLibrary)
router.delete('/deleteTdgLibrary/:id',auth.verifyToken,TDG_LIBRARY_CONTROLLER.deleteTdgLibrary)
router.post('/createDemo',upload.single('image'),TDG_LIBRARY_CONTROLLER.form)
router.put('/updateTdgPublish/:id',auth.verifyToken, TDG_LIBRARY_CONTROLLER.updateTdgPublish)


module.exports = router;
