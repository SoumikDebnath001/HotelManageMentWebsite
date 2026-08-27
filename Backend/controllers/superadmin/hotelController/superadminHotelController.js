const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const CountryState = require("../../../Models/countrystate");
const { Validator } = require("node-input-validator");

// Generate Hotel Code (auto generated during approval by Admin) e.g. HTL-WB-KOL-0001
const generateHotelCode = async (stateUniqueCode, cityUniqueCode) => {
  const hotelCount = await Hotel.countDocuments({
    stateUniqueCode: stateUniqueCode,
    cityUniqueCode: cityUniqueCode,
    hotelCode: { $exists: true, $ne: "" },
  });

  const serialNumber = String(hotelCount + 1).padStart(4, "0");
  return `HTL-${stateUniqueCode}-${cityUniqueCode}-${serialNumber}`;
};

// Get All Hotels (by Admin) - optional status filter e.g. ?status=pending
const getAllHotels = async (req, res) => {
  try {
    let query = { isDeleted: false };
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.adminId) {
      query.adminId = new mongoose.Types.ObjectId(String(req.query.adminId));
    }

    const hotels = await Hotel.find(query).populate("managerId", "name email role");

    return res.status(200).json({
      status: true,
      message: "Hotels fetched successfully",
      data: hotels,
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Approve / Reject Hotel (by Admin)
const approveHotel = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
    status: "required|in:approved,rejected",
    countryId: "requiredIf:status,approved",
    stateName: "requiredIf:status,approved",
    cityName: "requiredIf:status,approved",
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
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, isDeleted: false });

    if (!hotel) {
      return res.status(404).json({
        status: false,
        message: "Hotel not found",
      });
    }

    if (hotel.status != "pending") {
      return res.status(400).json({
        status: false,
        message: `Hotel is already ${hotel.status}`,
      });
    }

    if (req.body.status == "approved") {
      const countryState = await CountryState.findOne({ _id: req.body.countryId });

      if (!countryState) {
        return res.status(404).json({
          status: false,
          message: "Country not found",
        });
      }

      const state = countryState.State.find((s) => s.stateName == req.body.stateName);
      if (!state) {
        return res.status(404).json({
          status: false,
          message: "State not found in this country",
        });
      }

      const city = state.city.find((c) => c.cityName == req.body.cityName);
      if (!city) {
        return res.status(404).json({
          status: false,
          message: "City not found in this state",
        });
      }

      hotel.countryId = countryState._id;
      hotel.countryName = countryState.countryName;
      hotel.stateName = state.stateName;
      hotel.stateUniqueCode = state.stateUniqueCode;
      hotel.cityName = city.cityName;
      hotel.cityUniqueCode = city.cityUniqueCode;
      hotel.pinCode = req.body.pinCode ? req.body.pinCode : hotel.pinCode;
      hotel.hotelCode = await generateHotelCode(state.stateUniqueCode, city.cityUniqueCode);
    }

    hotel.status = req.body.status;
    hotel.approvedBy = req.user._id;
    hotel.approvedOn = new Date();
    if (req.body.status == "rejected") {
      hotel.rejectReason = req.body.rejectReason ? req.body.rejectReason : "";
    }
    await hotel.save();

    return res.status(200).json({
      status: true,
      message: `Hotel ${req.body.status} successfully`,
      data: hotel,
    });
  } catch (error) {
    console.error("Error approving hotel:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Toggle Hotel Active Status (by Admin)
const toggleHotelStatus = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
    isActive: "required|boolean",
  });

  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({ status: false, message: "Hotel not found" });
    }

    hotel.isActive = req.body.isActive;
    await hotel.save();

    return res.status(200).json({
      status: true,
      message: `Hotel successfully ${req.body.isActive ? "activated" : "revoked"}`,
      data: hotel,
    });
  } catch (error) {
    console.error("Error toggling hotel status:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

// Update Hotel Details (by Super Admin)
const updateHotel = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
  });

  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({ status: false, message: "Hotel not found" });
    }

    const allowedFields = ["hotelName", "description", "email", "mobileNumber", "address", "starRating"];
    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== "undefined") {
        hotel[field] = req.body[field];
      }
    });

    await hotel.save();

    return res.status(200).json({
      status: true,
      message: "Hotel details updated successfully",
      data: hotel,
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

// Delete Hotel (by Super Admin)
const deleteHotel = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
  });

  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const hotel = await Hotel.findOne({ _id: req.body.hotelId, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({ status: false, message: "Hotel not found" });
    }

    hotel.isDeleted = true;
    hotel.isActive = false;
    await hotel.save();

    return res.status(200).json({
      status: true,
      message: "Hotel deleted successfully",
      data: hotel,
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllHotels,
  approveHotel,
  toggleHotelStatus,
  updateHotel,
  deleteHotel,
};
