const mongoose = require("mongoose");
const Hotel = require("../../../Models/hotel");
const Rooms = require("../../../Models/roomsMoodel");
const HotelRoomBooking = require("../../../Models/hotelBookingModel");
const Review = require("../../../Models/reviewModel");
const Wishlist = require("../../../Models/wishlistModel");
const { Validator } = require("node-input-validator");

////////////////////////////////////////////////////////////////////////////////////=== Helpers

// Base match for hotels visible to the public
const publicHotelMatch = () => ({
  status: "approved",
  isActive: true,
  isDeleted: false,
});

// Escape user text before using it inside $regex
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse an optional date query param, returns null when missing / invalid
const parseDateParam = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

// Every word of the search text must match at least one of the given fields
// e.g. "kolkata west" -> city "Kolkata" AND state "West Bengal"
const buildSearchCondition = (search, fields) => {
  const words = String(search).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  return {
    $and: words.map((word) => {
      const regex = { $regex: escapeRegex(word), $options: "i" };
      return { $or: fields.map((field) => ({ [field]: regex })) };
    }),
  };
};

// Parse comma separated list or array query param
const parseListParam = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(",");
  return list.map((item) => item.trim()).filter((item) => item.length > 0);
};

// Aggregation stages that add rating / likes / price / availability info to every hotel
// checkIn & checkOut (Date) switch room availability to a date-range check against bookings
const hotelEnrichmentStages = ({ checkIn = null, checkOut = null } = {}) => {
  const hasDateRange = checkIn && checkOut && checkOut > checkIn;

  const roomsPipeline = [
    {
      $match: {
        $expr: { $eq: ["$hotelId", "$$hotelId"] },
        isActive: true,
        isDeleted: false,
      },
    },
  ];

  if (hasDateRange) {
    roomsPipeline.push(
      {
        $lookup: {
          from: HotelRoomBooking.collection.name,
          let: { roomId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$roomId", "$$roomId"] },
                    { $lt: ["$checkInDate", checkOut] },
                    { $gt: ["$checkOutDate", checkIn] },
                  ],
                },
                bookingStatus: { $in: ["booked", "checkedIn"] },
                isActive: true,
                isDeleted: false,
              },
            },
            { $limit: 1 },
          ],
          as: "overlappingBookings",
        },
      },
      {
        $addFields: {
          isAvailable: {
            $and: [
              { $ne: ["$availabilityStatus", "maintenance"] },
              { $eq: [{ $size: "$overlappingBookings" }, 0] },
            ],
          },
        },
      }
    );
  } else {
    roomsPipeline.push({
      $addFields: {
        isAvailable: { $eq: ["$availabilityStatus", "available"] },
      },
    });
  }

  roomsPipeline.push({
    $project: {
      pricePerNight: 1,
      roomType: 1,
      amenities: 1,
      isAvailable: 1,
    },
  });

  return [
    {
      $lookup: {
        from: Rooms.collection.name,
        let: { hotelId: "$_id" },
        pipeline: roomsPipeline,
        as: "roomStats",
      },
    },
    {
      $lookup: {
        from: Review.collection.name,
        let: { hotelId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$hotelId", "$$hotelId"] },
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        as: "reviewStats",
      },
    },
    {
      $lookup: {
        from: Wishlist.collection.name,
        let: { hotelId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$hotelId", "$$hotelId"] },
              isActive: true,
              isDeleted: false,
            },
          },
          { $count: "count" },
        ],
        as: "likeStats",
      },
    },
    {
      $addFields: {
        averageRating: {
          $round: [{ $ifNull: [{ $arrayElemAt: ["$reviewStats.averageRating", 0] }, 0] }, 1],
        },
        totalReviews: { $ifNull: [{ $arrayElemAt: ["$reviewStats.totalReviews", 0] }, 0] },
        likeCount: { $ifNull: [{ $arrayElemAt: ["$likeStats.count", 0] }, 0] },
        totalRooms: { $size: "$roomStats" },
        availableRooms: {
          $size: {
            $filter: {
              input: "$roomStats",
              as: "room",
              cond: "$$room.isAvailable",
            },
          },
        },
        startingPrice: { $min: "$roomStats.pricePerNight" },
        roomTypes: { $setUnion: ["$roomStats.roomType", []] },
        allAmenities: {
          $setUnion: [
            { $ifNull: ["$amenities", []] },
            {
              $reduce: {
                input: "$roomStats.amenities",
                initialValue: [],
                in: { $setUnion: ["$$value", { $ifNull: ["$$this", []] }] },
              },
            },
          ],
        },
      },
    },
    {
      // Guest rating when reviews exist, otherwise the hotel star category
      $addFields: {
        displayRating: {
          $cond: [{ $gt: ["$totalReviews", 0] }, "$averageRating", { $ifNull: ["$starRating", 0] }],
        },
      },
    },
    {
      $project: {
        roomStats: 0,
        reviewStats: 0,
        likeStats: 0,
      },
    },
  ];
};

// Sort stage for the discovery list
const hotelSortStage = (sortBy) => {
  switch (sortBy) {
    case "price_low":
      return { $sort: { startingPrice: 1, displayRating: -1, _id: 1 } };
    case "price_high":
      return { $sort: { startingPrice: -1, displayRating: -1, _id: 1 } };
    case "rating":
      return { $sort: { displayRating: -1, totalReviews: -1, likeCount: -1, _id: 1 } };
    case "likes":
      return { $sort: { likeCount: -1, displayRating: -1, _id: 1 } };
    case "newest":
      return { $sort: { createdAt: -1, _id: 1 } };
    default:
      // recommended
      return { $sort: { displayRating: -1, likeCount: -1, totalReviews: -1, _id: 1 } };
  }
};

////////////////////////////////////////////////////////////////////////////////////=== Controllers

// Get All Hotels (by User) - only approved & active hotels
// Optional filters: search, city, state, country, minRating, amenities (csv),
// roomType, availableOnly, checkIn, checkOut, minPrice, maxPrice, sortBy
const getAllHotels = async (req, res) => {
  try {
    const match = publicHotelMatch();

    if (req.query.city) {
      match.cityName = { $regex: `^${escapeRegex(req.query.city)}$`, $options: "i" };
    }

    if (req.query.state) {
      match.stateName = { $regex: `^${escapeRegex(req.query.state)}$`, $options: "i" };
    }

    if (req.query.country) {
      match.countryName = { $regex: `^${escapeRegex(req.query.country)}$`, $options: "i" };
    }

    const checkIn = parseDateParam(req.query.checkIn);
    const checkOut = parseDateParam(req.query.checkOut);
    const hasDateRange = checkIn && checkOut && checkOut > checkIn;

    // Filters that depend on the computed fields
    const computedMatch = {};

    // Text search runs after enrichment so room amenities (allAmenities) are searchable too
    if (req.query.search) {
      const searchCondition = buildSearchCondition(req.query.search, [
        "hotelName",
        "description",
        "address",
        "cityName",
        "stateName",
        "countryName",
        "allAmenities",
      ]);
      if (searchCondition) computedMatch.$and = searchCondition.$and;
    }

    const minRating = parseFloat(req.query.minRating);
    if (!isNaN(minRating) && minRating > 0) {
      computedMatch.displayRating = { $gte: minRating };
    }

    const amenities = parseListParam(req.query.amenities);
    if (amenities.length > 0) {
      computedMatch.allAmenities = { $all: amenities };
    }

    if (req.query.roomType) {
      computedMatch.roomTypes = req.query.roomType;
    }

    if (req.query.availableOnly === "true" || hasDateRange) {
      computedMatch.availableRooms = { $gt: 0 };
    }

    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      computedMatch.startingPrice = {};
      if (!isNaN(minPrice)) computedMatch.startingPrice.$gte = minPrice;
      if (!isNaN(maxPrice)) computedMatch.startingPrice.$lte = maxPrice;
    }

    const pipeline = [
      { $match: match },
      ...hotelEnrichmentStages({
        checkIn: hasDateRange ? checkIn : null,
        checkOut: hasDateRange ? checkOut : null,
      }),
    ];

    if (Object.keys(computedMatch).length > 0) {
      pipeline.push({ $match: computedMatch });
    }

    pipeline.push(hotelSortStage(req.query.sortBy));

    const hotels = await Hotel.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      message: "Hotels fetched successfully",
      data: hotels,
      total: hotels.length,
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

// Filter options for the hotel discovery page - cities, amenities, room types, price range
const getHotelFilterOptions = async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      { $match: publicHotelMatch() },
      ...hotelEnrichmentStages(),
      {
        $project: {
          cityName: 1,
          stateName: 1,
          countryName: 1,
          allAmenities: 1,
          roomTypes: 1,
          startingPrice: 1,
        },
      },
    ]);

    const cityMap = new Map();
    const amenitySet = new Set();
    const roomTypeSet = new Set();
    let minPrice = null;
    let maxPrice = null;

    hotels.forEach((hotel) => {
      if (hotel.cityName) {
        const key = hotel.cityName.toLowerCase();
        if (!cityMap.has(key)) {
          cityMap.set(key, {
            cityName: hotel.cityName,
            stateName: hotel.stateName || "",
            countryName: hotel.countryName || "",
            hotelCount: 0,
          });
        }
        cityMap.get(key).hotelCount += 1;
      }

      (hotel.allAmenities || []).forEach((amenity) => amenitySet.add(amenity));
      (hotel.roomTypes || []).forEach((roomType) => roomTypeSet.add(roomType));

      if (typeof hotel.startingPrice === "number") {
        minPrice = minPrice === null ? hotel.startingPrice : Math.min(minPrice, hotel.startingPrice);
        maxPrice = maxPrice === null ? hotel.startingPrice : Math.max(maxPrice, hotel.startingPrice);
      }
    });

    return res.status(200).json({
      status: true,
      message: "Filter options fetched successfully",
      data: {
        cities: Array.from(cityMap.values()).sort((a, b) => a.cityName.localeCompare(b.cityName)),
        amenities: Array.from(amenitySet).sort((a, b) => a.localeCompare(b)),
        roomTypes: Array.from(roomTypeSet).sort(),
        priceRange: { min: minPrice, max: maxPrice },
        totalHotels: hotels.length,
      },
    });
  } catch (error) {
    console.error("Error fetching hotel filter options:", error);
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
      ...hotelEnrichmentStages(),
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
      const searchCondition = buildSearchCondition(req.query.search, [
        "hotelName",
        "description",
        "address",
        "countryName",
        "stateName",
        "cityName",
        "amenities",
      ]);
      if (searchCondition) hotelMatch.$and = searchCondition.$and;
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
  getHotelFilterOptions,
  getHotelById,
  getRoomsByHotelId,
  roomAvailability,
  getRoomById,
  search,
  getRoomBookedDates
};
