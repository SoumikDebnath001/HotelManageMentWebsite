const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const User = require("../../../Models/user");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const Payment = require("../../../Models/paymentModel");
const Admin = require("../../../Models/admin");
const Employee = require("../../../Models/employee");
const { Validator } = require("node-input-validator");

// Build date range match for reports e.g. { fromDate, toDate } on a given field
const buildDateMatch = (fromDate, toDate, field) => {
  let dateMatch = {};
  if (fromDate) {
    dateMatch.$gte = new Date(fromDate);
  }
  if (toDate) {
    let to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    dateMatch.$lte = to;
  }
  return Object.keys(dateMatch).length > 0 ? { [field]: dateMatch } : {};
};

// Dashboard (by Admin) - totals of hotels, rooms, customers, bookings, revenue & room status
const getDashboard = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view dashboard",
      });
    }

    const totalHotels = await Hotel.countDocuments({ status: "approved", isDeleted: false });
    const pendingHotels = await Hotel.countDocuments({ status: "pending", isDeleted: false });
    const totalRooms = await Rooms.countDocuments({ isDeleted: false });
    const totalCustomers = await User.countDocuments({ isDeleted: false });
    const totalBookings = await HotelRoomBooking.countDocuments({ isDeleted: false });
    const cancelledBookings = await HotelRoomBooking.countDocuments({
      bookingStatus: "cancelled",
      isDeleted: false,
    });
    const availableRooms = await Rooms.countDocuments({
      availabilityStatus: "available",
      isActive: true,
      isDeleted: false,
    });
    const occupiedRooms = await Rooms.countDocuments({
      availabilityStatus: "booked",
      isDeleted: false,
    });
    const totalAdmins = await Admin.countDocuments({ isDeleted: false });
    const totalManagers = await Employee.countDocuments({ role: "manager", isDeleted: false });

    const revenue = await Payment.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Dashboard fetched successfully",
      data: {
        totalHotels: totalHotels,
        pendingHotels: pendingHotels,
        totalRooms: totalRooms,
        totalCustomers: totalCustomers,
        totalBookings: totalBookings,
        cancelledBookings: cancelledBookings,
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
        availableRooms: availableRooms,
        occupiedRooms: occupiedRooms,
        totalAdmins: totalAdmins,
        totalManagers: totalManagers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Booking Report (by Admin) - bookings grouped by status within a date range
const bookingReport = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view reports",
      });
    }

    let match = {
      isDeleted: false,
      ...buildDateMatch(req.query.fromDate, req.query.toDate, "bookedOn"),
    };

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    const summary = await HotelRoomBooking.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$bookingStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

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
      message: "Booking report fetched successfully",
      data: {
        summary: summary,
        bookings: bookings,
      },
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching booking report:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Revenue Report (by Admin) - revenue grouped by day within a date range
const revenueReport = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view reports",
      });
    }

    let match = {
      paymentStatus: "paid",
      isDeleted: false,
      ...buildDateMatch(req.query.fromDate, req.query.toDate, "paidOn"),
    };

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    const revenueByDay = await Payment.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidOn" } },
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
    ]);

    const refunds = await Payment.aggregate([
      {
        $match: {
          paymentStatus: "refunded",
          isDeleted: false,
          ...buildDateMatch(req.query.fromDate, req.query.toDate, "refundedOn"),
        },
      },
      {
        $group: {
          _id: null,
          totalRefunded: { $sum: "$amount" },
          totalRefunds: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Revenue report fetched successfully",
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
        totalPayments: totalRevenue.length > 0 ? totalRevenue[0].totalPayments : 0,
        totalRefunded: refunds.length > 0 ? refunds[0].totalRefunded : 0,
        totalRefunds: refunds.length > 0 ? refunds[0].totalRefunds : 0,
        revenueByDay: revenueByDay,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Customer Report (by Admin) - customers with booking counts & total spent
const customerReport = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view reports",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = { isDeleted: false };

    if (req.query.search) {
      match.$or = [
        { firstMiddleName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const customers = await User.aggregate([
      {
        $match: match,
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "hotelroombookings",
          localField: "_id",
          foreignField: "userId",
          as: "bookings",
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "userId",
          as: "payments",
        },
      },
      {
        $project: {
          password: 0,
          token: 0,
        },
      },
      {
        $addFields: {
          totalBookings: { $size: "$bookings" },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$payments",
                    as: "payment",
                    cond: { $eq: ["$$payment.paymentStatus", "paid"] },
                  },
                },
                as: "payment",
                in: "$$payment.amount",
              },
            },
          },
        },
      },
      {
        $project: {
          bookings: 0,
          payments: 0,
        },
      },
    ]);

    const total = await User.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Customer report fetched successfully",
      data: customers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customer report:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Hotel Report (by Admin) - hotel performance with bookings, revenue & rating
const hotelReport = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view reports",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = { isDeleted: false };

    if (req.query.status) {
      match.status = req.query.status;
    }

    if (req.query.search) {
      match.hotelName = { $regex: req.query.search, $options: "i" };
    }

    const hotels = await Hotel.aggregate([
      {
        $match: match,
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "hotelId",
          as: "rooms",
        },
      },
      {
        $lookup: {
          from: "hotelroombookings",
          localField: "_id",
          foreignField: "hotelId",
          as: "bookings",
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "hotelId",
          as: "payments",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "hotelId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          totalRooms: { $size: "$rooms" },
          totalBookings: { $size: "$bookings" },
          totalRevenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$payments",
                    as: "payment",
                    cond: { $eq: ["$$payment.paymentStatus", "paid"] },
                  },
                },
                as: "payment",
                in: "$$payment.amount",
              },
            },
          },
          averageRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
      {
        $project: {
          rooms: 0,
          bookings: 0,
          payments: 0,
          reviews: 0,
        },
      },
    ]);

    const total = await Hotel.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Hotel report fetched successfully",
      data: hotels,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hotel report:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Room Occupancy Report (by Admin) - room counts by availability status per hotel
const roomOccupancyReport = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view reports",
      });
    }

    let match = { isDeleted: false };

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    const occupancyByHotel = await Rooms.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: { hotelId: "$hotelId", hotelName: "$hotelName" },
          totalRooms: { $sum: 1 },
          availableRooms: {
            $sum: { $cond: [{ $eq: ["$availabilityStatus", "available"] }, 1, 0] },
          },
          occupiedRooms: {
            $sum: { $cond: [{ $eq: ["$availabilityStatus", "booked"] }, 1, 0] },
          },
          maintenanceRooms: {
            $sum: { $cond: [{ $eq: ["$availabilityStatus", "maintenance"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          occupancyPercentage: {
            $round: [
              { $multiply: [{ $divide: ["$occupiedRooms", "$totalRooms"] }, 100] },
              2,
            ],
          },
        },
      },
      {
        $sort: { occupancyPercentage: -1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Room occupancy report fetched successfully",
      data: occupancyByHotel,
    });
  } catch (error) {
    console.error("Error fetching room occupancy report:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Payment Report (by Admin) - payments within a date range with status filter
const paymentReport = async (req, res) => {
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
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view reports",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      isDeleted: false,
      ...buildDateMatch(req.query.fromDate, req.query.toDate, "paidOn"),
    };

    if (req.query.paymentStatus) {
      match.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    const summary = await Payment.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

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
      message: "Payment report fetched successfully",
      data: {
        summary: summary,
        payments: payments,
      },
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payment report:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  bookingReport,
  revenueReport,
  customerReport,
  hotelReport,
  roomOccupancyReport,
  paymentReport,

};
