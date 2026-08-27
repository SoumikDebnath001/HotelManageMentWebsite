const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const Payment = require("../../../Models/paymentModel");
const { Validator } = require("node-input-validator");

// Generate Transaction Id e.g. TXN-1720000000000-4821
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Make Payment (by User) - pay for own booking, booking status updated accordingly
const makePayment = async (req, res) => {
  const v = new Validator(req.body, {
    bookingId: "required",
    paymentMethod: "required|in:card,upi,netbanking,wallet,cash",
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
        message: "Only user can make payment for own booking",
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

    if (booking.bookingStatus == "cancelled") {
      return res.status(400).json({
        status: false,
        message: "Booking is cancelled, payment not allowed",
      });
    }

    if (booking.paymentStatus == "paid") {
      return res.status(400).json({
        status: false,
        message: "Payment is already done for this booking",
      });
    }

    let paymentData = {
      bookingId: booking._id,
      userId: req.user._id,
      userName: booking.userName,
      hotelId: booking.hotelId,
      hotelName: booking.hotelName,
      roomId: booking.roomId,
      roomNumber: booking.roomNumber,
      amount: booking.payableAmount ? booking.payableAmount : booking.totalAmount,
      paymentMethod: req.body.paymentMethod,
      transactionId: generateTransactionId(),
      paymentStatus: "paid",
      paidOn: new Date(),
    };

    const paymentInsert = new Payment(paymentData);
    await paymentInsert.save();

    booking.paymentStatus = "paid";
    await booking.save();

    return res.status(201).json({
      status: true,
      message: "Payment completed successfully, booking is confirmed",
      data: {
        payment: paymentInsert,
        bookingConfirmation: booking,
      },
    });
  } catch (error) {
    console.error("Error making payment:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Payment History (by User) - own payments with pagination
const getMyPayments = async (req, res) => {
  const v = new Validator(req.query, {
    paymentStatus: "in:paid,refunded",
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

    if (req.query.paymentStatus) {
      match.paymentStatus = req.query.paymentStatus;
    }

    const payments = await Payment.aggregate([
      {
        $match: match,
      },
      {
        $sort: { paidOn: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Payment.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Payments fetched successfully",
      data: payments,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Refund Payment (by Manager) - refund of cancelled & paid booking of own hotel
const refundPayment = async (req, res) => {
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
        message: "Only manager can refund a payment",
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

    if (booking.bookingStatus != "cancelled") {
      return res.status(400).json({
        status: false,
        message: "Only cancelled bookings can be refunded",
      });
    }

    if (booking.paymentStatus != "paid") {
      return res.status(400).json({
        status: false,
        message: `Refund not allowed, payment status is ${booking.paymentStatus}`,
      });
    }

    const payment = await Payment.findOne({
      bookingId: booking._id,
      paymentStatus: "paid",
      isDeleted: false,
    });

    if (!payment) {
      return res.status(404).json({
        status: false,
        message: "Payment not found for this booking",
      });
    }

    payment.paymentStatus = "refunded";
    payment.refundedOn = new Date();
    payment.refundReason = req.body.refundReason ? req.body.refundReason : booking.cancelReason;
    await payment.save();

    booking.paymentStatus = "refunded";
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Payment refunded successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  makePayment,
  getMyPayments,
  refundPayment,

};
