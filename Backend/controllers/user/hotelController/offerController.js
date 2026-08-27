const mongoose = require("mongoose");
const Offer = require("../../../Models/offerModel");

// Get Active Offers (by User) - currently valid offers, optional hotelId filter
const getActiveOffers = async (req, res) => {
  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const now = new Date();

    let match = {
      validFrom: { $lte: now },
      validTill: { $gte: now },
      isActive: true,
      isDeleted: false,
    };

    if (req.query.hotelId) {
      match.hotelId = new mongoose.Types.ObjectId(String(req.query.hotelId));
    }

    const offers = await Offer.aggregate([
      {
        $match: match,
      },
      {
        $sort: { validTill: 1 },
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
      message: "Active offers fetched successfully",
      data: offers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getActiveOffers,
};
