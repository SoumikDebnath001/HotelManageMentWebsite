var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////////////////=== imports
const employeeController = require('../../controllers/employee/auth/employeeController');
const ImageUpload = require('../../controllers/shared/Uploads/imageUpload');

const { requireEmployee } = require('../../service/middleware');

router.use(requireEmployee);

//=============== Employee Routes
router.post('/changePassword', employeeController.changePassword);
router.get('/getMyProfile', employeeController.getMyProfile);



//=============== Upload Routes
router.post('/image/upload', upload.single('image'), ImageUpload.ImageUpload);
router.post('/uploadmultipleimages', upload.array('images', 10), ImageUpload.MultipleImageUpload);
router.post('/upload/profile-image', upload.single('image'), ImageUpload.profileImageUpload);
router.post('/upload/hotel-image', upload.single('image'), ImageUpload.hotelImageUpload);
router.post('/upload/hotel-video', upload.single('video'), ImageUpload.hotelVideoUpload);


module.exports = router;
