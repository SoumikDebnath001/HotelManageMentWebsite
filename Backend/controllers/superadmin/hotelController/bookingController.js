const mongoose = require("mongoose");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const { Validator } = require("node-input-validator");

// Get All Bookings (by Admin) - pagination + optional filters
const getAllBookings = async (req, res) => {
  const v = new Validator(req.query, {
    bookingStatus: "in:booked,checkedIn,checkedOut,cancelled",
    paymentStatus: "in:pending,paid,refunded",
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
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view all bookings",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = { isDeleted: false };

    if (req.query.bookingStatus) {
      match.bookingStatus = req.query.bookingStatus;
    }

    if (req.query.paymentStatus) {
      match.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    if (req.query.userId) {
      match.userId = new mongoose.Types.ObjectId(String(req.query.userId));
    }

    const bookings = await HotelRoomBooking.aggregate([
      {
        $match: match,
      },
      {
        $sort: { bookedOn: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await HotelRoomBooking.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBookings,
};
