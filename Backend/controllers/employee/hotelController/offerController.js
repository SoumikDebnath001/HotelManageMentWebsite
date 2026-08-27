const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Offer = require("../../../Models/offerModel");
const { Validator } = require("node-input-validator");

// Create Offer (by Manager) - only for own approved hotel
const createOffer = async (req, res) => {
  const v = new Validator(req.body, {
    hotelId: "required",
    offerName: "required",
    offerCode: "required",
    discountType: "required|in:percentage,flat",
    discountValue: "required|numeric",
    validFrom: "required|date",
    validTill: "required|date",
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
        message: "Only manager can create offers",
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

    if (new Date(req.body.validTill) <= new Date(req.body.validFrom)) {
      return res.status(400).json({
        status: false,
        message: "validTill must be after validFrom",
      });
    }

    const offerCode = String(req.body.offerCode).toUpperCase();

    const existingOffers = await Offer.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(String(req.body.hotelId)),
          offerCode: offerCode,
          isDeleted: false,
        },
      },
    ]);

    if (existingOffers.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Offer code already exists for this hotel",
      });
    }

    let offerData = {
      ...req.body,
      offerCode: offerCode,
      hotelId: hotels[0]._id,
      hotelName: hotels[0].hotelName,
      createdBy: req.user._id,
      createdOn: new Date(),
    };

    const offerInsert = new Offer(offerData);
    await offerInsert.save();

    return res.status(201).json({
      status: true,
      message: "Offer created successfully",
      data: offerInsert,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Offers (by Manager) - offers of own hotels with pagination
const getMyOffers = async (req, res) => {
  try {
    if (req.userType != "Employee" || req.user.role != "manager") {
      return res.status(403).json({
        status: false,
        message: "Only manager can view own offers",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      hotelId: new mongoose.Types.ObjectId(String(req.user.hotelId)),
      isDeleted: false,
    };

    const offers = await Offer.aggregate([
      {
        $match: match,
      },
      {
        $sort: { createdOn: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const total = await Offer.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Offers fetched successfully",
      data: offers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Offer (by Manager) - only offer of own hotel
const updateOffer = async (req, res) => {
  const v = new Validator(req.body, {
    offerId: "required",
    discountType: "in:percentage,flat",
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
        message: "Only manager can update offers",
      });
    }

    const offer = await Offer.findOne({ _id: req.body.offerId, isDeleted: false });

    if (!offer) {
      return res.status(404).json({
        status: false,
        message: "Offer not found",
      });
    }

    if (String(offer.hotelId) != String(req.user.hotelId)) {
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

    const allowedFields = [
      "offerName",
      "description",
      "discountType",
      "discountValue",
      "maxDiscountAmount",
      "minBookingAmount",
      "validFrom",
      "validTill",
      "customFields",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") {
        offer[field] = req.body[field];
      }
    });

    if (new Date(offer.validTill) <= new Date(offer.validFrom)) {
      return res.status(400).json({
        status: false,
        message: "validTill must be after validFrom",
      });
    }

    await offer.save();

    return res.status(200).json({
      status: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Offer (by Manager) - soft delete, only offer of own hotel
const deleteOffer = async (req, res) => {
  const v = new Validator(req.body, {
    offerId: "required",
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
        message: "Only manager can delete offers",
      });
    }

    const offer = await Offer.findOne({ _id: req.body.offerId, isDeleted: false });

    if (!offer) {
      return res.status(404).json({
        status: false,
        message: "Offer not found",
      });
    }

    if (String(offer.hotelId) != String(req.user.hotelId)) {
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

    offer.isDeleted = true;
    await offer.save();

    return res.status(200).json({
      status: true,
      message: "Offer deleted successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createOffer,
  getMyOffers,
  updateOffer,
  deleteOffer,
};
