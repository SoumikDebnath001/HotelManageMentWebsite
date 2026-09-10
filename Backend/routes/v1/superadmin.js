var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

const countryStateController = require('../../controllers/shared/address/countrystateController');
const employeeController = require('../../controllers/superadmin/employee/employeeController');
const superadminController = require('../../controllers/superadmin/auth/superadminController');
const superadminHotelController = require('../../controllers/superadmin/hotelController/superadminHotelController');
const amenityController = require('../../controllers/shared/HotelControllers/amenityController');
const roomTypeController = require('../../controllers/shared/HotelControllers/roomTypeController');
const bookingController = require('../../controllers/superadmin/hotelController/bookingController');
const offerController = require('../../controllers/superadmin/hotelController/offerController');
const dashboardController = require('../../controllers/superadmin/dashboard/dashboardController');
const ImageUpload = require('../../controllers/shared/Uploads/imageUpload');

const { requireSuperAdmin } = require('../../service/middleware');

router.use(requireSuperAdmin);

router.get('/getMyProfile', superadminController.getMyProfile);
router.post('/createAdmin', superadminController.createAdmin);
router.get('/getAllAdmins', superadminController.getAllAdmins);
router.post('/updateAdmin', superadminController.updateAdmin);
router.post('/deleteAdmin', superadminController.deleteAdmin);

router.get('/getAllUsers', superadminController.getAllUsers);
router.post('/updateUserStatus', superadminController.updateUserStatus);
router.post('/deleteUser', superadminController.deleteUser);

router.post('/addCountryState', countryStateController.createCountryState);
router.get('/getAllCountryStates', countryStateController.getAllCountryStates);
router.post('/addEmployee', employeeController.createEmployee);
router.get('/getAllHotels', superadminHotelController.getAllHotels);
router.post('/approveHotel', superadminHotelController.approveHotel);
router.post('/updateHotel', superadminHotelController.updateHotel);
router.post('/deleteHotel', superadminHotelController.deleteHotel);
router.post('/toggleHotelStatus', superadminHotelController.toggleHotelStatus);
router.post('/createAmenity', amenityController.createAmenity);
router.get('/getAmenities', amenityController.getAmenities);
router.post('/updateAmenity', amenityController.updateAmenity);
router.post('/deleteAmenity', amenityController.deleteAmenity);
router.post('/createRoomType', roomTypeController.createRoomType);
router.get('/getRoomTypes', roomTypeController.getRoomTypes);
router.post('/updateRoomType', roomTypeController.updateRoomType);
router.post('/deleteRoomType', roomTypeController.deleteRoomType);
router.get('/getAllBookings', bookingController.getAllBookings);
router.get('/getAllOffers', offerController.getAllOffers);
router.get('/getDashboard', dashboardController.getDashboard);
router.get('/bookingReport', dashboardController.bookingReport);
router.get('/revenueReport', dashboardController.revenueReport);
router.get('/customerReport', dashboardController.customerReport);
router.get('/hotelReport', dashboardController.hotelReport);
router.get('/roomOccupancyReport', dashboardController.roomOccupancyReport);
router.get('/paymentReport', dashboardController.paymentReport);

//=============== Upload Routes
router.post('/image/upload', upload.single('image'), ImageUpload.ImageUpload);
router.post('/uploadmultipleimages', upload.array('images', 10), ImageUpload.MultipleImageUpload);
router.post('/upload/profile-image', upload.single('image'), ImageUpload.profileImageUpload);
router.post('/upload/hotel-image', upload.single('image'), ImageUpload.hotelImageUpload);
router.post('/upload/hotel-video', upload.single('video'), ImageUpload.hotelVideoUpload);

module.exports = router;
