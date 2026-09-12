const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const RoomSelection = require("../../../Models/roomSelectionModel");
const { applyOffer } = require("../../../service/offerService");
const Payment = require("../../../Models/paymentModel");
const { Validator } = require("node-input-validator");
const crypto = require("crypto");

// Book Room (by User) - availability check by dates, then booking creation
const bookRoom = async (req, res) => {
  const v = new Validator(req.body, {
    roomId: "required",
    checkInDate: "required|date",
    checkOutDate: "required|date",
    adults: "required|integer",
    children: "integer",
    razorpay_payment_id: "required",
    razorpay_order_id: "required",
    razorpay_signature: "required",
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
        message: "Only user can book a room",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
      .digest("hex");

    console.log("PAYMENT DEBUG:", {
      secret: process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing",
      expected: req.body.razorpay_signature,
      generated: generatedSignature,
      order_id: req.body.razorpay_order_id,
      payment_id: req.body.razorpay_payment_id
    });

    if (generatedSignature !== req.body.razorpay_signature) {
      return res.status(400).json({ status: false, message: "Payment verification failed. Invalid signature." });
    }

    const checkInDate = new Date(req.body.checkInDate);
    const checkOutDate = new Date(req.body.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        status: false,
        message: "Check-in date cannot be in the past",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        status: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const rooms = await Rooms.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.body.roomId)),
          isActive: true,
          isDeleted: false,
        },
      },
    ]);

    if (rooms.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Room not found",
      });
    }

    const room = rooms[0];

    if (room.availabilityStatus == "maintenance") {
      return res.status(400).json({
        status: false,
        message: "Room is under maintenance",
      });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(room.hotelId)),
          status: "approved",
          isActive: true,
          isDeleted: false,
        },
      },
    ]);

    if (hotels.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Hotel not found or not approved",
      });
    }

    if (room.maxAdults && req.body.adults > room.maxAdults) {
      return res.status(400).json({
        status: false,
        message: `Maximum ${room.maxAdults} adults allowed in this room`,
      });
    }

    if (room.maxChildren && req.body.children && req.body.children > room.maxChildren) {
      return res.status(400).json({
        status: false,
        message: `Maximum ${room.maxChildren} children allowed in this room`,
      });
    }

    // Availability check - any overlapping booking for the requested dates
    const overlappingBookings = await HotelRoomBooking.aggregate([
      {
        $match: {
          roomId: new mongoose.Types.ObjectId(String(req.body.roomId)),
          bookingStatus: { $in: ["booked", "checkedIn"] },
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
          isDeleted: false,
        },
      },
    ]);

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Room is not available for the selected dates",
      });
    }

    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = numberOfNights * room.pricePerNight;

    let discountAmount = 0;
    let offerCode = "";
    if (req.body.offerCode) {
      const offerResult = await applyOffer(req.body.offerCode, room.hotelId, totalAmount);
      if (offerResult.error) {
        return res.status(400).json({
          status: false,
          message: offerResult.error,
        });
      }
      discountAmount = offerResult.discountAmount;
      offerCode = offerResult.offer.offerCode;
    }

    let bookingData = {
      userId: req.user._id,
      userName: req.user.firstMiddleName
        ? `${req.user.firstMiddleName} ${req.user.lastName ? req.user.lastName : ""}`.trim()
        : req.user.email,
      hotelId: hotels[0]._id,
      hotelName: hotels[0].hotelName,
      roomId: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfNights: numberOfNights,
      adults: req.body.adults,
      children: req.body.children ? req.body.children : 0,
      pricePerNight: room.pricePerNight,
      totalAmount: totalAmount,
      offerCode: offerCode,
      discountAmount: discountAmount,
      payableAmount: totalAmount - discountAmount,
      paymentStatus: "paid",
      bookingStatus: "booked",
      bookedOn: new Date(),
      customFields: req.body.customFields ? req.body.customFields : [],
    };

    const bookingInsert = new HotelRoomBooking(bookingData);
    await bookingInsert.save();

    let paymentData = {
      bookingId: bookingInsert._id,
      userId: req.user._id,
      userName: bookingInsert.userName,
      hotelId: bookingInsert.hotelId,
      hotelName: bookingInsert.hotelName,
      roomId: bookingInsert.roomId,
      roomNumber: bookingInsert.roomNumber,
      amount: bookingInsert.payableAmount ? bookingInsert.payableAmount : bookingInsert.totalAmount,
      paymentMethod: "Razorpay",
      transactionId: req.body.razorpay_payment_id,
      paymentStatus: "paid",
      paidOn: new Date(),
    };

    const paymentInsert = new Payment(paymentData);
    await paymentInsert.save();

    // Mark room selection as final if the user had selected this room
    await RoomSelection.updateMany(
      {
        userId: req.user._id,
        roomId: room._id,
        isFinal: false,
        isActive: true,
        isDeleted: false,
      },
      { $set: { isFinal: true } }
    );

    return res.status(201).json({
      status: true,
      message: "Room booked successfully, payment confirmed",
      data: bookingInsert,
    });
  } catch (error) {
    console.error("Error booking room:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Cancel Booking (by User) - own booking, only before check-in
const cancelBooking = async (req, res) => {
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
    if (req.userType != "User") {
      return res.status(403).json({
        status: false,
        message: "Only user can cancel own booking",
      });
    }

    const booking = await HotelRoomBooking.findOne({
      _id: req.body.bookingId,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!booking) {
      return res.status(404).json({
        status: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus != "booked") {
      return res.status(400).json({
        status: false,
        message: `Booking cannot be cancelled, it is already ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = "cancelled";
    booking.cancelledOn = new Date();
    booking.cancelReason = req.body.cancelReason ? req.body.cancelReason : "";
    await booking.save();

    return res.status(200).json({
      status: true,
      message: booking.paymentStatus == "paid"
        ? "Booking cancelled successfully, refund will be processed"
        : "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Booking Details (by User) - own booking with payment details (booking confirmation)
const getBookingById = async (req, res) => {
  const v = new Validator(req.query, {
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
    const bookings = await HotelRoomBooking.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.query.bookingId)),
          userId: new mongoose.Types.ObjectId(String(req.user._id)),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "bookingId",
          as: "payments",
        },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
    ]);

    if (bookings.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Booking details fetched successfully",
      data: bookings[0],
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Customer Booking History (by User) - pagination + optional bookingStatus filter
const getMyBookings = async (req, res) => {
  const v = new Validator(req.query, {
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
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      userId: new mongoose.Types.ObjectId(String(req.user._id)),
      isDeleted: false,
    };

    if (req.query.bookingStatus) {
      match.bookingStatus = req.query.bookingStatus;
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
  bookRoom,
  cancelBooking,
  getBookingById,
  getMyBookings,
};
