let express = require('express');
let router = express.Router();
let IMPORT_DATA_CONTROLLER = require('../controllers/importDataController');
const { verifyToken } = require('../middleware/auth');


router.post('/getAllData', verifyToken , IMPORT_DATA_CONTROLLER.getAllData);
router.post('/import', verifyToken , IMPORT_DATA_CONTROLLER.importData);
router.post('/syncData', verifyToken , IMPORT_DATA_CONTROLLER.syncData);

module.exports = router;
