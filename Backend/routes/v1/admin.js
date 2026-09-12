var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////////////////=== imports
const adminController = require('../../controllers/admin/auth/adminController');
const adminHotelController = require('../../controllers/admin/hotelController/adminHotelController');
const roomTypeController = require('../../controllers/shared/HotelControllers/roomTypeController');
const ImageUpload = require('../../controllers/shared/Uploads/imageUpload');

const amenityController = require('../../controllers/shared/HotelControllers/amenityController');
const { requireAdmin } = require('../../service/middleware');

router.use(requireAdmin);

//=============== Profile & Dashboard Routes
router.get('/getMyProfile', adminController.getMyProfile);
router.post('/changePassword', adminController.changePassword);
router.get('/sendChangePasswordOtp', adminController.sendChangePasswordOtp);
router.get('/getMyDashboardStats', adminHotelController.getMyDashboardStats);

//=============== Hotel Routes
router.post('/createHotel', adminHotelController.createHotel);
router.get('/getMyHotels', adminHotelController.getMyHotels);
router.get('/getAmenities', amenityController.getAmenities);
router.post('/updateHotel', adminHotelController.updateHotel);
router.post('/deleteHotel', adminHotelController.deleteHotel);

//=============== Manager Routes
router.post('/createManager', adminHotelController.createManager);
router.get('/getMyManagers', adminHotelController.getMyManagers);
router.post('/updateManager', adminHotelController.updateManager);
router.post('/deleteManager', adminHotelController.deleteManager);

//=============== Upload Routes
router.post('/image/upload', upload.single('image'), ImageUpload.ImageUpload);
router.post('/uploadmultipleimages', upload.array('images', 10), ImageUpload.MultipleImageUpload);
router.post('/upload/profile-image', upload.single('image'), ImageUpload.profileImageUpload);
router.post('/upload/hotel-image', upload.single('image'), ImageUpload.hotelImageUpload);
router.post('/upload/hotel-video', upload.single('video'), ImageUpload.hotelVideoUpload);

module.exports = router;
