var express = require('express');
var router = express.Router();
const zip = require('../controllers/zipController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('restore',upload.single('zipFilePath'), zip.restoreZip);

module.exports = router;