var express = require('express');
var router = express.Router();
const multer = require("multer");
const path = require("path");
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////////////////=== imports
const userController = require('../../controllers/user/auth/userController');
const userHotelController = require('../../controllers/user/hotelController/userHotelController');
const wishlistController = require('../../controllers/user/ratingReviewLiked/wishlistController');
const roomSelectionController = require('../../controllers/user/hotelController/roomSelectionController');
const bookingController = require('../../controllers/user/hotelController/bookingController');
const paymentController = require('../../controllers/shared/HotelControllers/paymentController');
const offerController = require('../../controllers/user/hotelController/offerController');
const reviewController = require('../../controllers/user/ratingReviewLiked/reviewController');
const amenityController = require('../../controllers/shared/HotelControllers/amenityController');
const roomTypeController = require('../../controllers/shared/HotelControllers/roomTypeController');
const ImageUpload = require('../../controllers/shared/Uploads/imageUpload');

const { requireUser } = require('../../service/middleware');

router.use(requireUser);

//=============== Profile Routes
router.get('/getMyProfile', userController.getMyProfile);
router.post('/updateMyProfile', userController.updateMyProfile);
router.post('/changePassword', userController.changePassword);

//=============== Hotels & Rooms Routes
router.get('/getAllHotels', userHotelController.getAllHotels);
router.get('/getHotelFilterOptions', userHotelController.getHotelFilterOptions);
router.get('/getHotelById', userHotelController.getHotelById);
router.get('/getRoomsByHotelId', userHotelController.getRoomsByHotelId);
router.get('/roomAvailability', userHotelController.roomAvailability);
router.get('/getRoomById', userHotelController.getRoomById);
router.get('/search', userHotelController.search);

//=============== Masters Routes
router.get('/getAmenities', amenityController.getAmenities);
router.get('/getRoomTypes', roomTypeController.getRoomTypes);

//=============== Wishlist Routes
router.post('/addToWishlist', wishlistController.addToWishlist);
router.get('/getMyWishlist', wishlistController.getMyWishlist);
router.post('/removeFromWishlist', wishlistController.removeFromWishlist);

//=============== Room Selection Routes
router.post('/selectRoom', roomSelectionController.selectRoom);
router.get('/getMySelectedRooms', roomSelectionController.getMySelectedRooms);
router.post('/removeSelectedRoom', roomSelectionController.removeSelectedRoom);

//=============== Offers Routes
router.get('/getActiveOffers', offerController.getActiveOffers);

//=============== Booking Routes
router.post('/bookRoom', bookingController.bookRoom);
router.post('/cancelBooking', bookingController.cancelBooking);
router.get('/getBookingById', bookingController.getBookingById);
router.get('/getMyBookings', bookingController.getMyBookings);

//=============== Payment Routes
router.post('/makePayment', paymentController.makePayment);
router.post('/createRazorpayOrder', paymentController.createRazorpayOrder);
router.get('/getMyPayments', paymentController.getMyPayments);

//=============== Reviews Routes
router.post('/addReview', reviewController.addReview);
router.post('/updateReview', reviewController.updateReview);
router.post('/deleteReview', reviewController.deleteReview);
router.get('/getHotelReviews', reviewController.getHotelReviews);

//=============== Upload Routes
router.post('/image/upload', upload.single('image'), ImageUpload.ImageUpload);
router.post('/uploadmultipleimages', upload.array('images', 10), ImageUpload.MultipleImageUpload);
router.post('/upload/profile-image', upload.single('image'), ImageUpload.profileImageUpload);
router.post('/upload/hotel-image', upload.single('image'), ImageUpload.hotelImageUpload);
router.post('/upload/hotel-video', upload.single('video'), ImageUpload.hotelVideoUpload);

module.exports = router;
