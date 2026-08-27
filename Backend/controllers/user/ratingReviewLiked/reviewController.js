const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const Review = require("../../../Models/reviewModel");
const { Validator } = require("node-input-validator");

// Add Review (by User) - only after a checked-out stay in the hotel
const addReview = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
    rating: "required|integer|min:1|max:5",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    if (req.userType != "User") {
      return res.status(403).json({
        status: false,
        message: "Only user can add a review",
      });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.body.hotelId)),
          status: "approved",
          isActive: true,
          isDeleted: false,
        },
      },
    ]);

    if (hotels.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Hotel not found",
      });
    }

    const checkedOutBookings = await HotelRoomBooking.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(req.user._id)),
          hotelId: new mongoose.Types.ObjectId(String(req.body.hotelId)),
          bookingStatus: "checkedOut",
          isDeleted: false,
        },
      },
    ]);

    if (checkedOutBookings.length == 0) {
      return res.status(400).json({
        status: false,
        message: "You can review only after completing a stay in this hotel",
      });
    }

    const existingReviews = await Review.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(req.user._id)),
          hotelId: new mongoose.Types.ObjectId(String(req.body.hotelId)),
          isDeleted: false,
        },
      },
    ]);

    if (existingReviews.length > 0) {
      return res.status(400).json({
        status: false,
        message: "You have already reviewed this hotel, please update your review",
      });
    }

    let reviewData = {
      userId: req.user._id,
      userName: req.user.firstMiddleName
        ? `${req.user.firstMiddleName} ${req.user.lastName ? req.user.lastName : ""}`.trim()
        : req.user.email,
      hotelId: hotels[0]._id,
      hotelName: hotels[0].hotelName,
      bookingId: checkedOutBookings[checkedOutBookings.length - 1]._id,
      rating: req.body.rating,
      review: req.body.review ? req.body.review : "",
      reviewedOn: new Date(),
    };

    const reviewInsert = new Review(reviewData);
    await reviewInsert.save();

    return res.status(201).json({
      status: true,
      message: "Review added successfully",
      data: reviewInsert,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Review (by User) - own review only
const updateReview = async (req, res) => {
  const v = new Validator(req.body, {
    reviewId: "required",
    rating: "integer|min:1|max:5",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    const review = await Review.findOne({
      _id: req.body.reviewId,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!review) {
      return res.status(404).json({
        status: false,
        message: "Review not found",
      });
    }

    const allowedFields = ["rating", "review", "customFields", "isActive"];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") {
        review[field] = req.body[field];
      }
    });

    review.updatedOn = new Date();
    await review.save();

    return res.status(200).json({
      status: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Review (by User) - soft delete own review
const deleteReview = async (req, res) => {
  const v = new Validator(req.body, {
    reviewId: "required",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    const review = await Review.findOne({
      _id: req.body.reviewId,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!review) {
      return res.status(404).json({
        status: false,
        message: "Review not found",
      });
    }

    review.isDeleted = true;
    await review.save();

    return res.status(200).json({
      status: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Hotel Reviews (by User) - reviews of a hotel with average rating & pagination
const getHotelReviews = async (req, res) => {
  const v = new Validator(req.query, {
    hotelId: "required",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      hotelId: new mongoose.Types.ObjectId(String(req.query.hotelId)),
      isActive: true,
      isDeleted: false,
    };

    const reviews = await Review.aggregate([
      {
        $match: match,
      },
      {
        $sort: { reviewedOn: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const ratingSummary = await Review.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$hotelId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const total = await Review.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Reviews fetched successfully",
      data: {
        averageRating: ratingSummary.length > 0 ? Math.round(ratingSummary[0].averageRating * 10) / 10 : 0,
        totalReviews: ratingSummary.length > 0 ? ratingSummary[0].totalReviews : 0,
        reviews: reviews,
      },
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addReview,
  updateReview,
  deleteReview,
  getHotelReviews,

};
