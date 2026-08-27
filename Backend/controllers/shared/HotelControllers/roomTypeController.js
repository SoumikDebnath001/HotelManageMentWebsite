const mongoose = require("mongoose");
const RoomType = require("../../../Models/roomTypeModel");
const { Validator } = require("node-input-validator");

// Create Room Type (by Admin)
const createRoomType = async (req, res) => {
  const v = new Validator(req.body, {
    typeName: "required",
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
        message: "Only admin can create room types",
      });
    }

    const existingRoomTypes = await RoomType.aggregate([
      {
        $match: {
          typeName: { $regex: `^${req.body.typeName}$`, $options: "i" },
          isDeleted: false,
        },
      },
    ]);

    if (existingRoomTypes.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Room type already exists",
      });
    }

    let roomTypeData = {
      ...req.body,
      createdBy: req.user._id,
      createdOn: new Date(),
    };

    const roomTypeInsert = new RoomType(roomTypeData);
    await roomTypeInsert.save();

    return res.status(201).json({
      status: true,
      message: "Room type created successfully",
      data: roomTypeInsert,
    });
  } catch (error) {
    console.error("Error creating room type:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Room Types (by Admin / Manager / User) - with search & pagination
const getRoomTypes = async (req, res) => {
  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = { isDeleted: false };

    if (req.userType != "Admin") {
      match.isActive = true;
    }

    if (req.query.search) {
      match.typeName = { $regex: req.query.search, $options: "i" };
    }

    const roomTypes = await RoomType.aggregate([
      {
        $match: match,
      },
      {
        $sort: { typeName: 1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await RoomType.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Room types fetched successfully",
      data: roomTypes,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching room types:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Room Type (by Admin)
const updateRoomType = async (req, res) => {
  const v = new Validator(req.body, {
    roomTypeId: "required",
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
        message: "Only admin can update room types",
      });
    }

    const roomType = await RoomType.findOne({ _id: req.body.roomTypeId, isDeleted: false });

    if (!roomType) {
      return res.status(404).json({
        status: false,
        message: "Room type not found",
      });
    }

    const allowedFields = [
      "typeName",
      "description",
      "basePrice",
      "maxAdults",
      "maxChildren",
      "bedCount",
      "customFields",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") {
        roomType[field] = req.body[field];
      }
    });

    await roomType.save();

    return res.status(200).json({
      status: true,
      message: "Room type updated successfully",
      data: roomType,
    });
  } catch (error) {
    console.error("Error updating room type:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Room Type (by Admin) - soft delete
const deleteRoomType = async (req, res) => {
  const v = new Validator(req.body, {
    roomTypeId: "required",
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
        message: "Only admin can delete room types",
      });
    }

    const roomType = await RoomType.findOne({ _id: req.body.roomTypeId, isDeleted: false });

    if (!roomType) {
      return res.status(404).json({
        status: false,
        message: "Room type not found",
      });
    }

    roomType.isDeleted = true;
    await roomType.save();

    return res.status(200).json({
      status: true,
      message: "Room type deleted successfully",
      data: roomType,
    });
  } catch (error) {
    console.error("Error deleting room type:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createRoomType,
  getRoomTypes,
  updateRoomType,
  deleteRoomType,

};
