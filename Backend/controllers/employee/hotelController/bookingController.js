const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const { Validator } = require("node-input-validator");

// Get Hotel Bookings (by Manager) - bookings of own hotel with pagination
const getHotelBookings = async (req, res) => {
  const v = new Validator(req.query, {
    hotelId: "required",
    bookingStatus: "in:booked,checkedIn,checkedOut,cancelled",
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
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can view own hotel bookings",
      });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user.hotelId)),
          isDeleted: false,
        },
      },
    ]);

    if (hotels.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Hotel not found or you are not the manager of this hotel",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      hotelId: new mongoose.Types.ObjectId(String(req.query.hotelId)),
      isDeleted: false,
    };

    if (req.query.bookingStatus) {
      match.bookingStatus = req.query.bookingStatus;
    }

    if (req.query.paymentStatus) {
      match.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.search) {
      const regex = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      match.$or = [{ userName: regex }, { roomNumber: regex }, { roomType: regex }, { offerCode: regex }];
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

// Check-In Booking (by Manager) - verify booking & mark customer as checked in
const checkInBooking = async (req, res) => {
  const v = new Validator(req.body, {
    bookingId: "required",
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
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can check-in a booking",
      });
    }

    const booking = await HotelRoomBooking.findOne({ _id: req.body.bookingId, isDeleted: false });

    if (!booking) {
      return res.status(404).json({
        status: false,
        message: "Booking not found",
      });
    }

    if (String(booking.hotelId) != String(req.user.hotelId)) {
      return res.status(403).json({ status: false, message: "You are not the manager of this hotel" });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user.hotelId)),
          isDeleted: false,
        },
      },
    ]);

    if (hotels.length == 0) {
      return res.status(403).json({
        status: false,
        message: "You are not the manager of this hotel",
      });
    }

    if (booking.bookingStatus != "booked") {
      return res.status(400).json({
        status: false,
        message: `Booking cannot be checked in, it is ${booking.bookingStatus}`,
      });
    }

    if (booking.paymentStatus != "paid") {
      return res.status(400).json({
        status: false,
        message: "Payment is pending, please complete the payment before check-in",
      });
    }

    booking.bookingStatus = "checkedIn";
    booking.checkedInOn = new Date();
    await booking.save();

    // Room status becomes booked during the stay
    await Rooms.updateOne(
      { _id: booking.roomId, isDeleted: false },
      { $set: { availabilityStatus: "booked" } }
    );

    return res.status(200).json({
      status: true,
      message: "Booking checked in successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error checking in booking:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Check-Out Booking (by Manager) - close the booking & room becomes available again
const checkOutBooking = async (req, res) => {
  const v = new Validator(req.body, {
    bookingId: "required",
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
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can check-out a booking",
      });
    }

    const booking = await HotelRoomBooking.findOne({ _id: req.body.bookingId, isDeleted: false });

    if (!booking) {
      return res.status(404).json({
        status: false,
        message: "Booking not found",
      });
    }

    if (String(booking.hotelId) != String(req.user.hotelId)) {
      return res.status(403).json({ status: false, message: "You are not the manager of this hotel" });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user.hotelId)),
          isDeleted: false,
        },
      },
    ]);

    if (hotels.length == 0) {
      return res.status(403).json({
        status: false,
        message: "You are not the manager of this hotel",
      });
    }

    if (booking.bookingStatus != "checkedIn") {
      return res.status(400).json({
        status: false,
        message: `Booking cannot be checked out, it is ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = "checkedOut";
    booking.checkedOutOn = new Date();
    await booking.save();

    // Room status becomes available again
    await Rooms.updateOne(
      { _id: booking.roomId, isDeleted: false },
      { $set: { availabilityStatus: "available" } }
    );

    return res.status(200).json({
      status: true,
      message: "Booking checked out successfully, room is available again",
      data: booking,
    });
  } catch (error) {
    console.error("Error checking out booking:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getHotelBookings,
  checkInBooking,
  checkOutBooking,
};
