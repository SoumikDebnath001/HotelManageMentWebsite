const mongoose = require("mongoose");
const Amenity = require("../../../Models/amenityModel");
const { Validator } = require("node-input-validator");

// Create Amenity (by Admin)
const createAmenity = async (req, res) => {
  const v = new Validator(req.body, {
    amenityName: "required",
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
        message: "Only admin can create amenities",
      });
    }

    const existingAmenities = await Amenity.aggregate([
      {
        $match: {
          amenityName: { $regex: `^${req.body.amenityName}$`, $options: "i" },
          isDeleted: false,
        },
      },
    ]);

    if (existingAmenities.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Amenity already exists",
      });
    }

    let amenityData = {
      ...req.body,
      createdBy: req.user._id,
      createdOn: new Date(),
    };

    const amenityInsert = new Amenity(amenityData);
    await amenityInsert.save();

    return res.status(201).json({
      status: true,
      message: "Amenity created successfully",
      data: amenityInsert,
    });
  } catch (error) {
    console.error("Error creating amenity:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Amenities (by Admin / Manager / User) - with search & pagination
const getAmenities = async (req, res) => {
  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = { isDeleted: false };

    if (req.userType != "Admin") {
      match.isActive = true;
    }

    if (req.query.search) {
      match.amenityName = { $regex: req.query.search, $options: "i" };
    }

    const amenities = await Amenity.aggregate([
      {
        $match: match,
      },
      {
        $sort: { amenityName: 1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Amenity.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Amenities fetched successfully",
      data: amenities,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Amenity (by Admin)
const updateAmenity = async (req, res) => {
  const v = new Validator(req.body, {
    amenityId: "required",
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
        message: "Only admin can update amenities",
      });
    }

    const amenity = await Amenity.findOne({ _id: req.body.amenityId, isDeleted: false });

    if (!amenity) {
      return res.status(404).json({
        status: false,
        message: "Amenity not found",
      });
    }

    const allowedFields = ["amenityName", "description", "icon", "customFields", "isActive"];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") {
        amenity[field] = req.body[field];
      }
    });

    await amenity.save();

    return res.status(200).json({
      status: true,
      message: "Amenity updated successfully",
      data: amenity,
    });
  } catch (error) {
    console.error("Error updating amenity:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Amenity (by Admin) - soft delete
const deleteAmenity = async (req, res) => {
  const v = new Validator(req.body, {
    amenityId: "required",
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
        message: "Only admin can delete amenities",
      });
    }

    const amenity = await Amenity.findOne({ _id: req.body.amenityId, isDeleted: false });

    if (!amenity) {
      return res.status(404).json({
        status: false,
        message: "Amenity not found",
      });
    }

    amenity.isDeleted = true;
    await amenity.save();

    return res.status(200).json({
      status: true,
      message: "Amenity deleted successfully",
      data: amenity,
    });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createAmenity,
  getAmenities,
  updateAmenity,
  deleteAmenity,

};
