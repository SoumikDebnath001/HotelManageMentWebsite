const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const Wishlist = require("../../../Models/wishlistModel");
const { Validator } = require("node-input-validator");

// Add To Wishlist (by User) - hotel or a specific room of the hotel
const addToWishlist = async (req, res) => {
  const v = new Validator(req.body, {
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
    if (req.userType != "User") {
      return res.status(403).json({
        status: false,
        message: "Only user can add to wishlist",
      });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.body.hotelId)),
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

    let room = null;
    if (req.body.roomId) {
      const rooms = await Rooms.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(String(req.body.roomId)),
            hotelId: new mongoose.Types.ObjectId(String(req.body.hotelId)),
            isActive: true,
            isDeleted: false,
          },
        },
      ]);

      if (rooms.length == 0) {
        return res.status(404).json({
          status: false,
          message: "Room not found in this hotel",
        });
      }
      room = rooms[0];
    }

    let existingMatch = {
      userId: new mongoose.Types.ObjectId(String(req.user._id)),
      hotelId: new mongoose.Types.ObjectId(String(req.body.hotelId)),
      isActive: true,
      isDeleted: false,
    };

    if (req.body.roomId) {
      existingMatch.roomId = new mongoose.Types.ObjectId(String(req.body.roomId));
    } else {
      existingMatch.roomId = { $exists: false };
    }

    const existingWishlist = await Wishlist.aggregate([
      {
        $match: existingMatch,
      },
    ]);

    if (existingWishlist.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Already added to wishlist",
      });
    }

    let wishlistData = {
      userId: req.user._id,
      userName: req.user.firstMiddleName
        ? `${req.user.firstMiddleName} ${req.user.lastName ? req.user.lastName : ""}`.trim()
        : req.user.email,
      hotelId: hotels[0]._id,
      hotelName: hotels[0].hotelName,
      addedOn: new Date(),
    };

    if (room) {
      wishlistData.roomId = room._id;
      wishlistData.roomNumber = room.roomNumber;
      wishlistData.roomType = room.roomType;
    }

    const wishlistInsert = new Wishlist(wishlistData);
    await wishlistInsert.save();

    return res.status(201).json({
      status: true,
      message: "Added to wishlist successfully",
      data: wishlistInsert,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Wishlist (by User) - with hotel & room details, pagination
const getMyWishlist = async (req, res) => {
  try {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let match = {
      userId: new mongoose.Types.ObjectId(String(req.user._id)),
      isActive: true,
      isDeleted: false,
    };

    const wishlist = await Wishlist.aggregate([
      {
        $match: match,
      },
      {
        $sort: { addedOn: -1 },
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

    const total = await Wishlist.countDocuments(match);

    return res.status(200).json({
      status: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove From Wishlist (by User) - soft remove own wishlist item
const removeFromWishlist = async (req, res) => {
  const v = new Validator(req.body, {
    wishlistId: "required",
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
    const wishlist = await Wishlist.findOne({
      _id: req.body.wishlistId,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!wishlist) {
      return res.status(404).json({
        status: false,
        message: "Wishlist item not found",
      });
    }

    wishlist.isActive = false;
    wishlist.isDeleted = true;
    await wishlist.save();

    return res.status(200).json({
      status: true,
      message: "Removed from wishlist successfully",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,

};
