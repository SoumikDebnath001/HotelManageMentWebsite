const mongoose = require("mongoose");
const Offer = require("../../../Models/offerModel");

// Get All Offers (by Admin) - all offers with pagination
const getAllOffers = async (req, res) => {
  try {
    if (req.userType != "Admin") {
      return res.status(403).json({
        status: false,
        message: "Only admin can view all offers",
      });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = { isDeleted: false };

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

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

module.exports = {
  getAllOffers,
};
