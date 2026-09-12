var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////////////////=== imports
const hotelController = require('../../controllers/employee/hotelController/hotelController');
const roomController = require('../../controllers/employee/hotelController/roomController');
const bookingController = require('../../controllers/employee/hotelController/bookingController');
const paymentController = require('../../controllers/shared/HotelControllers/paymentController');
const offerController = require('../../controllers/employee/hotelController/offerController');
const ImageUpload = require('../../controllers/shared/Uploads/imageUpload');

const amenityController = require('../../controllers/shared/HotelControllers/amenityController');
const reviewController = require('../../controllers/user/ratingReviewLiked/reviewController');
const { requireManager } = require('../../service/middleware');

router.use(requireManager);

//=============== Hotel Routes
router.post('/registerHotel', hotelController.registerHotel);
router.get('/getMyHotels', hotelController.getMyHotels);
router.get('/getAmenities', amenityController.getAmenities);
router.get('/getHotelReviews', reviewController.getHotelReviews);

//=============== Rooms Routes
router.post('/createHotelRoom', roomController.createHotelRoom);
router.get('/getHotelRooms', roomController.getHotelRooms);
router.post('/updateHotelRoom', roomController.updateHotelRoom);
router.post('/deleteHotelRooms', roomController.deleteHotelRooms);

//=============== Bookings Routes
router.get('/getHotelBookings', bookingController.getHotelBookings);
router.post('/checkInBooking', bookingController.checkInBooking);
router.post('/checkOutBooking', bookingController.checkOutBooking);

//=============== Payment Routes
router.post('/refundPayment', paymentController.refundPayment);

//=============== Offers Routes
router.post('/createOffer', offerController.createOffer);
router.get('/getMyOffers', offerController.getMyOffers);
router.post('/updateOffer', offerController.updateOffer);
router.post('/deleteOffer', offerController.deleteOffer);

//=============== Upload Routes
router.post('/image/upload', upload.single('image'), ImageUpload.ImageUpload);
router.post('/uploadmultipleimages', upload.array('images', 10), ImageUpload.MultipleImageUpload);
router.post('/upload/profile-image', upload.single('image'), ImageUpload.profileImageUpload);
router.post('/upload/hotel-image', upload.single('image'), ImageUpload.hotelImageUpload);
router.post('/upload/hotel-video', upload.single('video'), ImageUpload.hotelVideoUpload);

module.exports = router;
