var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////////////////=== imports
const employeeController = require('../../controllers/employee/auth/employeeController');

const { requireEmployee } = require('../../service/middleware');

router.use(requireEmployee);

//=============== Employee Routes
router.post('/changePassword', employeeController.changePassword);
router.get('/getMyProfile', employeeController.getMyProfile);



module.exports = router;
