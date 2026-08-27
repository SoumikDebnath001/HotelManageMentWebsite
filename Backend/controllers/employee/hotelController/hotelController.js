const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const { Validator } = require("node-input-validator");

// Register Hotel is no longer available to managers. Hotels are created by their Admin.
const registerHotel = async (req, res) => {
  return res.status(403).json({ status: false, message: "Hotels can only be created by the hotel admin" });
};

// Get My Hotels (by Manager)
const getMyHotels = async (req, res) => {
  try {
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can view own hotels",
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

module.exports = {
  registerHotel,
  getMyHotels,

};
