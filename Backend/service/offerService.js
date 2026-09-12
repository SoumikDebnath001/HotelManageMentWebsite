const mongoose = require("mongoose");
const Offer = require("../Models/offerModel");

// Apply Offer on booking amount - returns { offer, discountAmount } or { error }
// Shared by booking creation and Razorpay order creation so both use the same amount
const applyOffer = async (offerCode, hotelId, totalAmount) => {
  const now = new Date();

  const offers = await Offer.aggregate([
    {
      $match: {
        offerCode: String(offerCode).toUpperCase(),
        hotelId: new mongoose.Types.ObjectId(String(hotelId)),
        validFrom: { $lte: now },
        validTill: { $gte: now },
        isActive: true,
        isDeleted: false,
      },
    },
  ]);

  if (offers.length == 0) {
    return { error: "Offer not found or expired for this hotel" };
  }

  const offer = offers[0];

  if (offer.minBookingAmount && totalAmount < offer.minBookingAmount) {
    return { error: `Minimum booking amount for this offer is ${offer.minBookingAmount}` };
  }

  let discountAmount = 0;
  if (offer.discountType == "percentage") {
    discountAmount = (totalAmount * offer.discountValue) / 100;
    if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) {
      discountAmount = offer.maxDiscountAmount;
    }
  } else {
    discountAmount = offer.discountValue;
  }

  if (discountAmount > totalAmount) {
    discountAmount = totalAmount;
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return { offer: offer, discountAmount: discountAmount };
};

module.exports = { applyOffer };
