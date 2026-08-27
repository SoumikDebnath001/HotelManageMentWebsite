const Hotel = require("../../../Models/hotel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const Payment = require("../../../Models/paymentModel");
const Employee = require("../../../Models/employee");
const { Validator } = require("node-input-validator");
const passwordHash = require("password-hash");
var jwt = require("jsonwebtoken");

function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const createHotel = async (req, res) => {
  const v = new Validator(req.body, { hotelName: "required" });
  if (!(await v.check())) return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });

  try {
    const hotelData = { adminId: req.user._id, status: "pending", createdOn: new Date() };
    const allowedFields = ["hotelName", "description", "email", "mobileNumber", "address", "countryId", "starRating", "amenities", "image", "customFields"];
    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") hotelData[field] = req.body[field];
    });
    const hotelInsert = new Hotel(hotelData);
    await hotelInsert.save();
    return res.status(201).json({ status: true, message: "Hotel created successfully", data: hotelInsert });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ adminId: req.user._id, isDeleted: false });
    return res.status(200).json({ status: true, message: "Hotels fetched successfully", data: hotels });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const updateHotel = async (req, res) => {
  const v = new Validator(req.body, { hotelId: "required" });
  if (!(await v.check())) return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });

  try {
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, adminId: req.user._id, isDeleted: false });
    if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });
    const allowedFields = ["hotelName", "description", "email", "mobileNumber", "address", "starRating", "amenities", "image", "customFields", "isActive", "status", "approvedBy", "approvedOn"];
    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") hotel[field] = req.body[field];
    });
    await hotel.save();
    return res.status(200).json({ status: true, message: "Hotel updated successfully", data: hotel });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const deleteHotel = async (req, res) => {
  const v = new Validator(req.body, { hotelId: "required" });
  if (!(await v.check())) return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });

  try {
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, adminId: req.user._id, isDeleted: false });
    if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });
    hotel.isDeleted = true;
    await hotel.save();
    return res.status(200).json({ status: true, message: "Hotel deleted successfully", data: hotel });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const createManager = async (req, res) => {
  const v = new Validator(req.body, { email: "required|email", hotelId: "required" });
  if (!(await v.check())) return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });

  try {
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, adminId: req.user._id, isDeleted: false });
    if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });
    const existingManager = await Employee.findOne({ email: req.body.email, isDeleted: false });
    if (existingManager) return res.status(400).json({ status: false, message: "Employee already exists with this email" });

    const managerInsert = new Employee({
      name: req.body.name ? req.body.name : req.body.email,
      email: req.body.email,
      role: "manager",
      hotelId: hotel._id,
      password: passwordHash.generate(req.body.email),
      token: createToken({ email: req.body.email, role: "manager", createdOn: new Date() }),
      isDefaultPassword: true,
      createdOn: new Date(),
    });
    await managerInsert.save();
    managerInsert.password = null;
    return res.status(201).json({ status: true, message: "Manager created successfully, default password is the manager email", data: managerInsert });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const getMyManagers = async (req, res) => {
  try {
    const hotels = await Hotel.find({ adminId: req.user._id, isDeleted: false }).select("_id");
    const managers = await Employee.find({ role: "manager", hotelId: { $in: hotels.map((hotel) => hotel._id) }, isDeleted: false }).select("-password -token");
    return res.status(200).json({ status: true, message: "Managers fetched successfully", data: managers });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const updateManager = async (req, res) => {
  const v = new Validator(req.body, { managerId: "required" });
  if (!(await v.check())) return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });

  try {
    const manager = await Employee.findOne({ _id: req.body.managerId, role: "manager", isDeleted: false });
    if (!manager) return res.status(404).json({ status: false, message: "Manager not found" });
    const currentHotel = await Hotel.findOne({ _id: manager.hotelId, adminId: req.user._id, isDeleted: false });
    if (!currentHotel) return res.status(403).json({ status: false, message: "You are not allowed to manage this manager" });
    if (req.body.hotelId && String(req.body.hotelId) != String(manager.hotelId)) {
      const hotel = await Hotel.findOne({ _id: req.body.hotelId, adminId: req.user._id, isDeleted: false });
      if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });
      manager.hotelId = hotel._id;
    }
    ["name", "image", "customFields", "isActive"].forEach((field) => {
      if (typeof req.body[field] != "undefined") manager[field] = req.body[field];
    });
    await manager.save();
    manager.password = null;
    manager.token = null;
    return res.status(200).json({ status: true, message: "Manager updated successfully", data: manager });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const deleteManager = async (req, res) => {
  const v = new Validator(req.body, { managerId: "required" });
  if (!(await v.check())) return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  try {
    const manager = await Employee.findOne({ _id: req.body.managerId, role: "manager", isDeleted: false });
    if (!manager) return res.status(404).json({ status: false, message: "Manager not found" });
    const hotel = await Hotel.findOne({ _id: manager.hotelId, adminId: req.user._id, isDeleted: false });
    if (!hotel) return res.status(403).json({ status: false, message: "You are not allowed to manage this manager" });
    manager.isDeleted = true;
    manager.isActive = false;
    await manager.save();
    return res.status(200).json({ status: true, message: "Manager deleted successfully", data: manager });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const getMyDashboardStats = async (req, res) => {
  try {
    const hotels = await Hotel.find({ adminId: req.user._id, isDeleted: false }).select("_id");
    const hotelIds = hotels.map(h => h._id);

    const totalBookings = await HotelRoomBooking.countDocuments({ hotelId: { $in: hotelIds }, isDeleted: false });
    
    const revenue = await Payment.aggregate([
      {
        $match: {
          hotelId: { $in: hotelIds },
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
      message: "Stats fetched successfully",
      data: {
        totalBookings: totalBookings,
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = { createHotel, getMyHotels, updateHotel, deleteHotel, createManager, getMyManagers, updateManager, deleteManager, getMyDashboardStats };
