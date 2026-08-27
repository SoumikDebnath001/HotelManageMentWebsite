const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const { Validator } = require("node-input-validator");

// Get All Hotels (by User) - only approved & active hotels
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      {
        $match: {
          status: "approved",
          isActive: true,
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

// Get Single Hotel by Id (by User)
const getHotelById = async (req, res) => {
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
    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.query.hotelId)),
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

    return res.status(200).json({
      status: true,
      message: "Hotel fetched successfully",
      data: hotels[0],
    });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Rooms by Hotel Id (by User) - only active rooms of approved hotel
const getRoomsByHotelId = async (req, res) => {
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
    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.query.hotelId)),
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

    const rooms = await Rooms.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(String(req.query.hotelId)),
          isActive: true,
          isDeleted: false,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Room Availability (by User) - available rooms of a hotel, optional availabilityStatus filter
const roomAvailability = async (req, res) => {
  const v = new Validator(req.query, {
    hotelId: "required",
    availabilityStatus: "in:available,booked,maintenance",
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
    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.query.hotelId)),
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

    const rooms = await Rooms.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(String(req.query.hotelId)),
          availabilityStatus: req.query.availabilityStatus ? req.query.availabilityStatus : "available",
          isActive: true,
          isDeleted: false,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Room availability fetched successfully",
      data: rooms,
    });
  } catch (error) {
    console.error("Error fetching room availability:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Single Room by Room Id (by User)
const getRoomById = async (req, res) => {
  const v = new Validator(req.query, {
    roomId: "required",
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
    const rooms = await Rooms.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.query.roomId)),
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

    return res.status(200).json({
      status: true,
      message: "Room fetched successfully",
      data: rooms[0],
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Search Hotels & Rooms (by User) - by hotelId, roomId or regex search text
const search = async (req, res) => {
  try {
    if (!req.query.search && !req.query.hotelId && !req.query.roomId) {
      return res.status(400).json({
        status: false,
        message: "search, hotelId or roomId is required",
      });
    }

    let hotelMatch = {
      status: "approved",
      isActive: true,
      isDeleted: false,
    };

    if (req.query.hotelId) {
      hotelMatch._id = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    if (req.query.search) {
      hotelMatch.$or = [
        { hotelName: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { address: { $regex: req.query.search, $options: "i" } },
        { countryName: { $regex: req.query.search, $options: "i" } },
        { stateName: { $regex: req.query.search, $options: "i" } },
        { cityName: { $regex: req.query.search, $options: "i" } },
        { hotel: { $regex: req.query.search, $options: "i" } },
        { amenities: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const hotels = await Hotel.aggregate([
      {
        $match: hotelMatch,
      },
    ]);

    let roomMatch = {
      isActive: true,
      isDeleted: false,
    };

    if (req.query.roomId) {
      roomMatch._id = new mongoose.Types.ObjectId(String(req.query.roomId));
    }

    if (req.query.hotelId) {
      roomMatch.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    } else if (!req.query.roomId) {
      const approvedHotels = await Hotel.aggregate([
        {
          $match: {
            status: "approved",
            isActive: true,
            isDeleted: false,
          },
        },
      ]);

      roomMatch.hotelId = { $in: approvedHotels.map((hotel) => hotel._id) };
    }

    if (req.query.search && !req.query.roomId) {
      roomMatch.$or = [
        { hotelName: { $regex: req.query.search, $options: "i" } },
        { roomNumber: { $regex: req.query.search, $options: "i" } },
        { roomType: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { amenities: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const rooms = await Rooms.aggregate([
      {
        $match: roomMatch,
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Search results fetched successfully",
      data: {
        hotels: hotels,
        rooms: rooms,
      },
    });
  } catch (error) {
    console.error("Error searching hotels and rooms:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Booked Dates for a specific Room
const getRoomBookedDates = async (req, res) => {
  const v = new Validator(req.query, {
    roomId: "required",
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
          roomId: new mongoose.Types.ObjectId(String(req.query.roomId)),
          bookingStatus: { $in: ["booked", "checkedIn"] },
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $project: {
          checkInDate: 1,
          checkOutDate: 1,
          bookingStatus: 1
        }
      }
    ]);

    return res.status(200).json({
      status: true,
      message: "Booked dates fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  getRoomsByHotelId,
  roomAvailability,
  getRoomById,
  search,
  getRoomBookedDates
};
