import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { FiChevronLeft, FiCheckCircle, FiShield, FiCreditCard, FiTag, FiX, FiUsers, FiCalendar } from "react-icons/fi";
import { useSelector } from "react-redux";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import toast from "react-hot-toast";
import { bookRoom, createRazorpayOrder, getActiveOffers } from "../../Services/booking.service";
import { formatMoney, formatDate, nightsBetween, computeDiscount, describeDiscount } from "../../Utils/bookingHelpers";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { room, hotel, checkIn, checkOut, adults = 1, children = 0 } = location.state || {};
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Offers (Step 6: apply a promo code before payment)
  const [offers, setOffers] = useState([]);
  const [offerInput, setOfferInput] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null); // { offerCode, offer? }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!hotel?._id) return;
    let cancelled = false;
    (async () => {
      const { data } = await getActiveOffers(hotel._id);
      if (!cancelled && data?.status) setOffers(data.data || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [hotel?._id]);

  const nights = useMemo(() => (checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0), [checkIn, checkOut]);
  const totalAmount = room ? room.pricePerNight * nights : 0;

  const preview = useMemo(() => {
    if (!appliedOffer) return { discountAmount: 0 };
    if (appliedOffer.offer) return computeDiscount(appliedOffer.offer, totalAmount);
    return { discountAmount: 0, unknown: true };
  }, [appliedOffer, totalAmount]);

  const discountAmount = preview.error ? 0 : preview.discountAmount || 0;
  const payableAmount = totalAmount - discountAmount;

  // If accessed directly without state, redirect back
  if (!room || !checkIn || !checkOut) {
    return <Navigate to="/rooms" replace />;
  }

  const applyOfferCode = (code, offer = null) => {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) {
      toast.error("Enter an offer code first.");
      return;
    }
    const known = offer || offers.find((o) => o.offerCode === normalized) || null;
    if (known) {
      const result = computeDiscount(known, totalAmount);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${known.offerName} applied · you save ${formatMoney(result.discountAmount)}`);
    } else {
      toast("Code will be validated at payment.", { icon: "ℹ️" });
    }
    setAppliedOffer({ offerCode: normalized, offer: known });
    setOfferInput(normalized);
  };

  const removeOffer = () => {
    setAppliedOffer(null);
    setOfferInput("");
  };

  const handleBookRoom = async () => {
    setLoading(true);
    try {
      const payload = {
        roomId: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: Number(adults) || 1,
        children: Number(children) || 0,
      };
      if (appliedOffer?.offerCode) payload.offerCode = appliedOffer.offerCode;

      // 1. Create Razorpay order from the backend (server recomputes the price + offer)
      const orderRes = await createRazorpayOrder(payload);

      if (!orderRes?.data?.status || !orderRes?.data?.data?.orderId) {
        toast.error(orderRes?.error || orderRes?.data?.message || "Failed to initialize payment gateway");
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId, breakdown } = orderRes.data.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "ComfyStay",
        description: `${hotel?.hotelName} · Room ${room.roomNumber} · ${breakdown?.numberOfNights || nights} night(s)`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            const bookingPayload = {
              ...payload,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };
            // 3. Verify payment & create the booking
            const payRes = await bookRoom(bookingPayload);
            if (payRes?.data?.status) {
              toast.success("Payment successful! Booking confirmed.");
              setConfirmedBooking(payRes.data.data);
            } else {
              toast.error(payRes?.error || payRes?.data?.message || "Payment verification failed");
            }
          } catch (error) {
            toast.error(error?.response?.data?.message || "Error finalizing booking");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {
          name: user?.firstMiddleName ? `${user.firstMiddleName} ${user.lastName || ""}`.trim() : "Guest",
          email: user?.email || "",
          contact: user?.contact?.mobileNumber || user?.mobile || "",
        },
        theme: { color: "#d97706" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(response.error.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error processing booking");
      setLoading(false);
    }
  };

  const guestName = user?.firstMiddleName ? `${user.firstMiddleName} ${user.lastName || ""}`.trim() : user?.email || "Guest";
  const hotelLocation = [hotel?.address, hotel?.cityName, hotel?.stateName].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-12 px-6">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-amber-400 mb-6 transition-colors text-sm font-semibold">
          <FiChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="font-serif text-3xl font-bold text-white mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 border-white/10">
              <h2 className="text-xl font-bold text-white font-serif mb-4 flex items-center gap-2"><FiCheckCircle className="text-emerald-500" /> Booking Details</h2>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5 mb-6">
                {room.image && room.image.length > 0 ? (
                  <img src={room.image[0]} alt="Room" className="w-24 h-24 rounded-lg object-cover" />
                ) : hotel?.image?.[0] ? (
                  <img src={hotel.image[0]} alt="Hotel" className="w-24 h-24 rounded-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-stone-800 flex items-center justify-center"><span className="text-xs text-stone-500">No Image</span></div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-amber-400">{hotel?.hotelName}</h3>
                  <p className="text-stone-300 font-medium capitalize">{room.roomType} room · No. {room.roomNumber}</p>
                  {hotelLocation && <p className="text-stone-500 text-sm mt-1">{hotelLocation}</p>}
                  {room.amenities?.length > 0 && <p className="text-xs text-stone-500 mt-1">{room.amenities.slice(0, 4).join(" · ")}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1 flex items-center gap-1"><FiCalendar /> Check-in</p>
                  <p className="text-white font-semibold">{formatDate(checkIn)}</p>
                  <p className="text-[11px] text-stone-500">from 2:00 PM</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1 flex items-center gap-1"><FiCalendar /> Check-out</p>
                  <p className="text-white font-semibold">{formatDate(checkOut)}</p>
                  <p className="text-[11px] text-stone-500">by 11:00 AM</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 col-span-2 sm:col-span-1">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1">Duration</p>
                  <p className="text-white font-semibold">{nights} night{nights === 1 ? "" : "s"}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/10">
              <h2 className="text-xl font-bold text-white font-serif mb-4 flex items-center gap-2"><FiUsers className="text-amber-500" /> Guest Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1">Primary guest</p>
                  <p className="text-white font-semibold">{guestName}</p>
                  <p className="text-xs text-stone-400">{user?.email}</p>
                  {(user?.contact?.mobileNumber || user?.mobile) && <p className="text-xs text-stone-400">{user?.contact?.mobileNumber || user?.mobile}</p>}
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1">Occupancy</p>
                  <p className="text-white font-semibold">{adults} adult{Number(adults) === 1 ? "" : "s"}{Number(children) > 0 ? `, ${children} child${Number(children) === 1 ? "" : "ren"}` : ""}</p>
                  <p className="text-xs text-stone-400">Room allows up to {(room.maxAdults || 2)} adults{room.maxChildren ? ` and ${room.maxChildren} children` : ""}</p>
                </div>
              </div>
              <p className="text-xs text-amber-500/80 mt-4 flex items-center gap-1"><FiShield /> Your personal details are securely managed and shared only with the hotel.</p>
            </GlassCard>

            {/* Offers */}
            <GlassCard className="p-6 border-white/10">
              <h2 className="text-xl font-bold text-white font-serif mb-1 flex items-center gap-2"><FiTag className="text-amber-500" /> Offers & Discounts</h2>
              <p className="text-xs text-stone-500 mb-4">Apply a promo code from {hotel?.hotelName}. The final amount is confirmed by the server before payment.</p>

              {appliedOffer ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-300 font-mono">{appliedOffer.offerCode}</p>
                    <p className="text-xs text-stone-400">
                      {appliedOffer.offer ? `${appliedOffer.offer.offerName} · ${describeDiscount(appliedOffer.offer)}` : "Will be validated at payment"}
                      {preview.error && <span className="text-red-400"> · {preview.error}</span>}
                    </p>
                  </div>
                  <button onClick={removeOffer} className="rounded-lg p-2 text-stone-400 hover:bg-white/10 hover:text-white" aria-label="Remove offer"><FiX className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyOfferCode(offerInput); } }}
                    placeholder="Enter offer code"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-stone-500 placeholder:font-sans focus:border-amber-500 focus:outline-none"
                  />
                  <button onClick={() => applyOfferCode(offerInput)} className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20">Apply</button>
                </div>
              )}

              {offers.length > 0 && !appliedOffer && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">Available offers</p>
                  <div className="flex flex-wrap gap-2">
                    {offers.map((offer) => {
                      const result = computeDiscount(offer, totalAmount);
                      return (
                        <button
                          key={offer._id}
                          onClick={() => applyOfferCode(offer.offerCode, offer)}
                          disabled={Boolean(result.error)}
                          title={result.error || `Save ${formatMoney(result.discountAmount)}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <p className="text-xs font-mono font-semibold text-amber-300">{offer.offerCode}</p>
                          <p className="text-[11px] text-stone-400">{describeDiscount(offer)}{offer.minBookingAmount ? ` · min ${formatMoney(offer.minBookingAmount)}` : ""}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Price Summary */}
          <div className="space-y-6">
            <GlassCard className="p-6 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-[40px]" />

              <h2 className="text-xl font-bold text-white font-serif mb-4">Price Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-white/10 text-sm">
                <div className="flex justify-between text-stone-300">
                  <span>{formatMoney(room.pricePerNight)} × {nights} night{nights === 1 ? "" : "s"}</span>
                  <span>{formatMoney(totalAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Offer {appliedOffer.offerCode}</span>
                    <span>− {formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-300">
                  <span>Taxes & Fees</span>
                  <span className="text-emerald-400">Included</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-stone-400 font-bold uppercase text-xs">Total Amount</span>
                <span className="text-3xl font-bold text-amber-400">{formatMoney(payableAmount)}</span>
              </div>

              <button
                onClick={handleBookRoom}
                disabled={loading || nights <= 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-lg hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <>Proceed to Payment <FiCreditCard /></>}
              </button>

              <p className="text-[10px] text-center text-stone-500 mt-4">Secured by Razorpay · By proceeding, you agree to our terms and conditions.</p>
            </GlassCard>
          </div>
        </div>

        {/* Booking Confirmation (Step 8) */}
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-stone-900 border border-white/10 p-8 rounded-2xl max-w-lg w-full shadow-2xl">
              <div className="flex justify-center mb-5">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center"><FiCheckCircle className="h-8 w-8 text-emerald-500" /></div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white text-center mb-1">Booking Confirmed!</h3>
              <p className="text-stone-400 text-center text-sm mb-6">Your payment is complete. Show this reference at the reception during check-in.</p>

              <div className="rounded-xl border border-white/10 bg-black/40 divide-y divide-white/5 text-sm">
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Booking reference</span><span className="font-mono text-amber-300">{String(confirmedBooking._id).slice(-8).toUpperCase()}</span></div>
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Hotel</span><span className="text-white text-right">{confirmedBooking.hotelName}</span></div>
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Room</span><span className="text-white capitalize">{confirmedBooking.roomType} · No. {confirmedBooking.roomNumber}</span></div>
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Stay</span><span className="text-white">{formatDate(confirmedBooking.checkInDate)} → {formatDate(confirmedBooking.checkOutDate)} ({confirmedBooking.numberOfNights} night{confirmedBooking.numberOfNights === 1 ? "" : "s"})</span></div>
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Guests</span><span className="text-white">{confirmedBooking.adults} adult{confirmedBooking.adults === 1 ? "" : "s"}{confirmedBooking.children ? `, ${confirmedBooking.children} child${confirmedBooking.children === 1 ? "" : "ren"}` : ""}</span></div>
                {confirmedBooking.discountAmount > 0 && <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Discount ({confirmedBooking.offerCode})</span><span className="text-emerald-400">− {formatMoney(confirmedBooking.discountAmount)}</span></div>}
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Amount paid</span><span className="text-emerald-400 font-bold">{formatMoney(confirmedBooking.payableAmount)}</span></div>
                <div className="flex justify-between px-4 py-3"><span className="text-stone-500">Status</span><span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">{confirmedBooking.bookingStatus} · {confirmedBooking.paymentStatus}</span></div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => navigate(`/rooms/${confirmedBooking.hotelId}`, { replace: true })} className="flex-1 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-colors">Back to hotel</button>
                <button onClick={() => navigate("/user/dashboard", { replace: true, state: { section: "bookings" } })} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 transition-colors">View my bookings</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
