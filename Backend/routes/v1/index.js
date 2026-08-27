const multer=require("multer");
var storage = multer.memoryStorage()
const upload = multer({ storage: storage })

var express = require('express');

var router = express.Router();

var adminsRouter = require('./admin');
var usersRouter = require('./user');
var employeesRouter = require('./employee');
var managersRouter = require('./manager');
var superadminsRouter = require('./superadmin');

////////////////////////////////////////////////////////////////////////////////////=== imports
const superadminController = require('../../controllers/superadmin/auth/superadminController');
const employeeController = require('../../controllers/employee/auth/employeeController');
const userController = require('../../controllers/user/auth/userController');
const adminController = require('../../controllers/admin/auth/adminController');
const otpController = require('../../controllers/shared/otp/otpController');
const userHotelController = require('../../controllers/user/hotelController/userHotelController');
const ImageUpload=require('../../controllers/shared/Uploads/imageUpload')
////////////////////////////////////////////////////////////////////////////////////=== Public Routes

//=============== Superadmin Routes
router.post('/superadmin/register', superadminController.register);
router.post('/superadmin/login', superadminController.login);
router.post('/superadmin/verifyOtp', superadminController.verifyOtp);

//================ Hotel Admin Routes
router.post('/admin/login', adminController.login);


//================ Employee Routes
router.post('/employee/login', employeeController.login);
router.post('/employee/forgotPassword', employeeController.forgotPassword);
router.post('/employee/verifyOtp', otpController.verifyOtp);

//================== User Routes
router.post('/user/register', userController.register);
router.post('/user/login', userController.login);
router.post('/user/forgotPassword', userController.forgotPassword);
router.post('/user/verifyOtp', otpController.verifyOtp);

//================== Public Hotel Routes
router.get('/public/getAllHotels', userHotelController.getAllHotels);
router.get('/public/getHotelById', userHotelController.getHotelById);
router.get('/public/getRoomsByHotelId', userHotelController.getRoomsByHotelId);
router.get('/public/roomAvailability', userHotelController.roomAvailability);
router.get('/public/search', userHotelController.search);
router.get('/public/getRoomBookedDates', userHotelController.getRoomBookedDates);


//================== UPload
router.post('/image/upload',upload.single('image'),ImageUpload.ImageUpload);
router.post('/uploadmultipleimages', upload.array('images', 10), admincontroller.MultipleImageUpload);
///////////////////////////////////////////////////////////////////////////////////==== Protected Routes
const middleware = require('../../service/middleware').middleware;
router.use(middleware); 
router.use('/superadmin', superadminsRouter);
router.use('/admin', adminsRouter);
router.use('/employee', employeesRouter);
router.use('/manager', managersRouter);
router.use('/user', usersRouter);

module.exports = router;
