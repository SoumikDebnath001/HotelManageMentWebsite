// Shared presentation helpers for bookings, payments and offers

export const bookingStatusClass = {
  booked: "bg-amber-500/20 text-amber-400",
  checkedIn: "bg-blue-500/20 text-blue-400",
  checkedOut: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export const bookingStatusLabel = {
  booked: "Booked",
  checkedIn: "Checked in",
  checkedOut: "Completed",
  cancelled: "Cancelled",
};

export const paymentStatusClass = {
  pending: "bg-stone-500/20 text-stone-300",
  paid: "bg-emerald-500/20 text-emerald-400",
  refunded: "bg-purple-500/20 text-purple-300",
};

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const offerIsLive = (offer) => {
  const now = new Date();
  return offer.isActive && new Date(offer.validFrom) <= now && new Date(offer.validTill) >= now;
};

export const describeDiscount = (offer) =>
  offer.discountType === "percentage"
    ? `${offer.discountValue}% off${offer.maxDiscountAmount ? ` (max ${formatMoney(offer.maxDiscountAmount)})` : ""}`
    : `${formatMoney(offer.discountValue)} off`;

// Mirrors Backend/service/offerService.js so the checkout preview matches the server
export const computeDiscount = (offer, totalAmount) => {
  if (!offer) return { discountAmount: 0 };
  if (!offerIsLive(offer)) return { error: "This offer is not active right now" };
  if (offer.minBookingAmount && totalAmount < offer.minBookingAmount) {
    return { error: `Minimum booking amount for this offer is ${formatMoney(offer.minBookingAmount)}` };
  }
  let discountAmount;
  if (offer.discountType === "percentage") {
    discountAmount = (totalAmount * offer.discountValue) / 100;
    if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) discountAmount = offer.maxDiscountAmount;
  } else {
    discountAmount = offer.discountValue;
  }
  if (discountAmount > totalAmount) discountAmount = totalAmount;
  return { discountAmount: Math.round(discountAmount * 100) / 100 };
};

export const nightsBetween = (checkIn, checkOut) =>
  Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
