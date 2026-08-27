const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const { Validator } = require("node-input-validator");

// Create Hotel Room (by Manager) - only for own approved hotel
const createHotelRoom = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
    roomNumber: "required",
    roomType: "required|in:single,double,triple,queen,king,suite,deluxe",
    pricePerNight: "required|numeric",
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
        message: "Only manager can add rooms",
      });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user.hotelId)),
          status: "approved",
          isDeleted: false,
        },
      },
    ]);

    if (hotels.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Hotel not found, not approved yet or you are not the manager of this hotel",
      });
    }

    const existingRooms = await Rooms.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(String(req.body.hotelId)),
          roomNumber: req.body.roomNumber,
          isDeleted: false,
        },
      },
    ]);

    if (existingRooms.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Room number already exists in this hotel",
      });
    }

    let roomData = {
      ...req.body,
      hotelId: hotels[0]._id,
      hotelName: hotels[0].hotelName,
    };

    const roomInsert = new Rooms(roomData);
    await roomInsert.save();

    return res.status(201).json({
      status: true,
      message: "Room created successfully",
      data: roomInsert,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Hotel Rooms (by Manager) - rooms of own hotel
const getHotelRooms = async (req, res) => {
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
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can view own hotel rooms",
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

    const rooms = await Rooms.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(String(req.query.hotelId)),
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

// Update Hotel Room (by Manager) - only room of own hotel
const updateHotelRoom = async (req, res) => {
  const v = new Validator(req.body, {
    roomId: "required",
    roomType: "in:single,double,triple,queen,king,suite,deluxe",
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
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can update rooms",
      });
    }

    const room = await Rooms.findOne({ _id: req.body.roomId, isDeleted: false });

    if (!room) {
      return res.status(404).json({
        status: false,
        message: "Room not found",
      });
    }

    if (String(room.hotelId) != String(req.user.hotelId)) {
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

    if (req.body.roomNumber && req.body.roomNumber != room.roomNumber) {
      const existingRooms = await Rooms.aggregate([
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(String(room.hotelId)),
            roomNumber: req.body.roomNumber,
            isDeleted: false,
          },
        },
      ]);

      if (existingRooms.length > 0) {
        return res.status(400).json({
          status: false,
          message: "Room number already exists in this hotel",
        });
      }
    }

    const allowedFields = [
      "roomNumber",
      "roomType",
      "floor",
      "description",
      "pricePerNight",
      "maxAdults",
      "maxChildren",
      "bedCount",
      "amenities",
      "image",
      "availabilityStatus",
      "customFields",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") {
        room[field] = req.body[field];
      }
    });

    await room.save();

    return res.status(200).json({
      status: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Hotel Room (by Manager) - soft delete, only room of own hotel
const deleteHotelRooms = async (req, res) => {
  const v = new Validator(req.body, {
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
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can delete rooms",
      });
    }

    const room = await Rooms.findOne({ _id: req.body.roomId, isDeleted: false });

    if (!room) {
      return res.status(404).json({
        status: false,
        message: "Room not found",
      });
    }

    if (String(room.hotelId) != String(req.user.hotelId)) {
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

    room.isDeleted = true;
    await room.save();

    return res.status(200).json({
      status: true,
      message: "Room deleted successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createHotelRoom,
  getHotelRooms,
  updateHotelRoom,
  deleteHotelRooms,

};
