const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const RoomSelection = require("../../../Models/roomSelectionModel");
const { Validator } = require("node-input-validator");

// Select Room (by User) - room selection before booking (like Airbnb reserve step)
const selectRoom = async (req, res) => {
  const v = new Validator(req.body, {
    roomId: "required",
    checkInDate: "date",
    checkOutDate: "date",
    adults: "integer",
    children: "integer",
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
        message: "Only user can select a room",
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

    const existingSelections = await RoomSelection.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(req.user._id)),
          roomId: new mongoose.Types.ObjectId(String(req.body.roomId)),
          isFinal: false,
          isActive: true,
          isDeleted: false,
        },
      },
    ]);

    if (existingSelections.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Room is already in your selection",
      });
    }

    let selectionData = {
      userId: req.user._id,
      userName: req.user.firstMiddleName
        ? `${req.user.firstMiddleName} ${req.user.lastName ? req.user.lastName : ""}`.trim()
        : req.user.email,
      hotelId: hotels[0]._id,
      hotelName: hotels[0].hotelName,
      roomId: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      checkInDate: req.body.checkInDate ? new Date(req.body.checkInDate) : null,
      checkOutDate: req.body.checkOutDate ? new Date(req.body.checkOutDate) : null,
      adults: req.body.adults ? req.body.adults : 1,
      children: req.body.children ? req.body.children : 0,
      isFinal: false,
      selectedOn: new Date(),
    };

    const selectionInsert = new RoomSelection(selectionData);
    await selectionInsert.save();

    return res.status(201).json({
      status: true,
      message: "Room selected successfully",
      data: selectionInsert,
    });
  } catch (error) {
    console.error("Error selecting room:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Selected Rooms (by User) - pending selections with room & hotel details
const getMySelectedRooms = async (req, res) => {
  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      userId: new mongoose.Types.ObjectId(String(req.user._id)),
      isActive: true,
      isDeleted: false,
    };

    if (typeof req.query.isFinal != "undefined") {
      match.isFinal = String(req.query.isFinal).toLowerCase() == "true";
    }

    const selections = await RoomSelection.aggregate([
      {
        $match: match,
      },
      {
        $sort: { selectedOn: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
    ]);

    const total = await RoomSelection.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Selected rooms fetched successfully",
      data: selections,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching selected rooms:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove Selected Room (by User) - soft remove own selection
const removeSelectedRoom = async (req, res) => {
  const v = new Validator(req.body, {
    selectionId: "required",
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
    const selection = await RoomSelection.findOne({
      _id: req.body.selectionId,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!selection) {
      return res.status(404).json({
        status: false,
        message: "Room selection not found",
      });
    }

    if (selection.isFinal) {
      return res.status(400).json({
        status: false,
        message: "Room selection is already finalized with a booking",
      });
    }

    selection.isActive = false;
    selection.isDeleted = true;
    await selection.save();

    return res.status(200).json({
      status: true,
      message: "Room selection removed successfully",
      data: selection,
    });
  } catch (error) {
    console.error("Error removing room selection:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  selectRoom,
  getMySelectedRooms,
  removeSelectedRoom,

};
