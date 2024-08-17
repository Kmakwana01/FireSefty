var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require("../middleware/auth")
var ACTION_KEY_CONTROLLER = require('../controllers/actionKeysController');
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

router.post('/createActionKeys', auth.verifyToken, upload.single('icon'), ACTION_KEY_CONTROLLER.createActionKeys)
router.get('/getActionKeys/:id', auth.verifyToken, ACTION_KEY_CONTROLLER.getActionKeys)
router.put('/updateActionKeys/:id', auth.verifyToken, upload.single('icon'), ACTION_KEY_CONTROLLER.updateActionKeys)
router.delete('/deleteActionKeys/:id', auth.verifyToken, ACTION_KEY_CONTROLLER.deleteActionKeys)


router.post('/updateIndex/:id', auth.verifyToken, ACTION_KEY_CONTROLLER.updateIndex)


module.exports = router;
