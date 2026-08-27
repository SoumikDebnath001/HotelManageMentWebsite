var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////////////////=== imports
const adminController = require('../../controllers/admin/auth/adminController');
const adminHotelController = require('../../controllers/admin/hotelController/adminHotelController');
const roomTypeController = require('../../controllers/shared/HotelControllers/roomTypeController');

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
router.post('/updateHotel', adminHotelController.updateHotel);
router.post('/deleteHotel', adminHotelController.deleteHotel);

//=============== Manager Routes
router.post('/createManager', adminHotelController.createManager);
router.get('/getMyManagers', adminHotelController.getMyManagers);
router.post('/updateManager', adminHotelController.updateManager);
router.post('/deleteManager', adminHotelController.deleteManager);

module.exports = router;
