import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiCheckCircle,
  FiCheck,
  FiShield,
  FiCreditCard,
  FiTag,
  FiX,
  FiUsers,
  FiMapPin,
  FiLock,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { bookRoom, createRazorpayOrder, getActiveOffers } from "../../Services/booking.service";
import { formatMoney, formatDate, nightsBetween, computeDiscount, describeDiscount } from "../../Utils/bookingHelpers";

/* =========================================================
   HELPERS
========================================================= */

const dayLabel = (value) =>
  new Date(value).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

const yearLabel = (value) => new Date(value).getFullYear();

const cardClass = "rounded-2xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6";

const STEPS = ["Choose room", "Review & pay", "Confirmed"];

/* =========================================================
   STEPPER
========================================================= */

const Stepper = ({ current }) => (
  <ol className="flex items-center gap-2 text-[11px] sm:text-xs">
    {STEPS.map((label, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
              done
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                : active
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-white/15 bg-white/5 text-stone-500"
            }`}
          >
            {done ? <FiCheck className="h-3.5 w-3.5" /> : index + 1}
          </span>
          <span className={`truncate font-semibold ${active ? "text-white" : done ? "text-emerald-300/90" : "text-stone-500"}`}>{label}</span>
          {index < STEPS.length - 1 && <span className={`hidden h-px flex-1 sm:block ${done ? "bg-emerald-500/40" : "bg-white/10"}`} />}
        </li>
      );
    })}
  </ol>
);

/* =========================================================
   CHECKOUT PAGE
========================================================= */

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
  const guestPhone = user?.contact?.mobileNumber || user?.mobile;
  const hotelLocation = [hotel?.address, hotel?.cityName, hotel?.stateName].filter(Boolean).join(", ");
  const coverImage = room.image?.[0] || hotel?.image?.[0] || null;
  const occupancyText = `${adults} adult${Number(adults) === 1 ? "" : "s"}${Number(children) > 0 ? `, ${children} child${Number(children) === 1 ? "" : "ren"}` : ""}`;
  const nightsText = `${nights} night${nights === 1 ? "" : "s"}`;

  const payButtonContent = loading ? (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
  ) : (
    <>
      Pay {formatMoney(payableAmount)} <FiCreditCard className="h-4 w-4" />
    </>
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-stone-950 pb-32 text-white selection:bg-amber-500 selection:text-white lg:pb-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-24 top-0 h-[360px] w-[360px] rounded-full bg-amber-500/10 blur-[140px]" />

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold leading-tight text-white sm:text-2xl">Secure checkout</h1>
            <p className="truncate text-xs text-stone-400">
              {hotel?.hotelName} · {nightsText}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
            <FiLock className="h-3.5 w-3.5" /> Secure
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pt-5 sm:px-6 sm:pt-8">
        <Stepper current={1} />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-8 lg:grid-cols-5 lg:gap-8">
          {/* ================= DETAILS ================= */}
          <div className="space-y-4 lg:col-span-3 lg:space-y-5">
            {/* YOUR STAY */}
            <section className={cardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-white sm:text-xl">
                  <FiCheckCircle className="h-5 w-5 text-emerald-400" /> Your stay
                </h2>
                <button
                  onClick={() => navigate(`/rooms/${hotel?._id}#rooms`)}
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="flex gap-3 sm:gap-4">
                {coverImage ? (
                  <img src={coverImage} alt={hotel?.hotelName} className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-28" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-stone-900 font-serif text-3xl font-bold text-amber-300/70 sm:h-24 sm:w-28">
                    {hotel?.hotelName?.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-white sm:text-lg">{hotel?.hotelName}</h3>
                  <p className="text-sm capitalize text-stone-300">
                    {room.roomType} room · No. {room.roomNumber}
                  </p>
                  {hotelLocation && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                      <FiMapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{hotelLocation}</span>
                    </p>
                  )}
                </div>
              </div>

              {room.amenities?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.amenities.slice(0, 5).map((amenity) => (
                    <span key={amenity} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-stone-300">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 5 && <span className="px-1 py-1 text-[11px] text-stone-500">+{room.amenities.length - 5} more</span>}
                </div>
              )}

              {/* Dates */}
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Check-in</p>
                  <p className="mt-1 text-sm font-bold text-white sm:text-base">{dayLabel(checkIn)}</p>
                  <p className="text-[11px] leading-4 text-stone-500">{yearLabel(checkIn)}<span className="block sm:inline"><span className="hidden sm:inline"> · </span>from 2:00 PM</span></p>
                </div>
                <div className="flex flex-col items-center justify-center px-1 text-stone-500">
                  <FiArrowRight className="h-4 w-4" />
                  <span className="mt-1 whitespace-nowrap text-[10px] font-semibold text-amber-300">{nightsText}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Check-out</p>
                  <p className="mt-1 text-sm font-bold text-white sm:text-base">{dayLabel(checkOut)}</p>
                  <p className="text-[11px] leading-4 text-stone-500">{yearLabel(checkOut)}<span className="block sm:inline"><span className="hidden sm:inline"> · </span>by 11:00 AM</span></p>
                </div>
              </div>
            </section>

            {/* GUESTS */}
            <section className={cardClass}>
              <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-white sm:text-xl">
                <FiUsers className="h-5 w-5 text-amber-400" /> Guest details
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-bold text-white">
                  {guestName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{guestName}</p>
                  <p className="truncate text-xs text-stone-400">
                    {user?.email}
                    {guestPhone ? ` · ${guestPhone}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-white">{occupancyText}</p>
                  <p className="text-[11px] text-stone-500">
                    Room allows up to {room.maxAdults || 2} adults{room.maxChildren ? ` and ${room.maxChildren} children` : ""}
                  </p>
                </div>
                <button onClick={() => navigate(-1)} className="shrink-0 text-xs font-semibold text-amber-400 hover:underline">
                  Edit
                </button>
              </div>

              <p className="mt-3 flex items-start gap-1.5 text-[11px] text-stone-500">
                <FiShield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/80" /> Your details are shared only with the hotel for this booking.
              </p>
            </section>

            {/* OFFERS */}
            <section className={cardClass}>
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-white sm:text-xl">
                <FiTag className="h-5 w-5 text-amber-400" /> Offers & discounts
              </h2>
              <p className="mb-4 mt-1 text-xs text-stone-500">Have a promo code from {hotel?.hotelName}? The final amount is confirmed before payment.</p>

              {appliedOffer ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-emerald-300">{appliedOffer.offerCode}</p>
                    <p className="text-xs text-stone-400">
                      {appliedOffer.offer ? `${appliedOffer.offer.offerName} · ${describeDiscount(appliedOffer.offer)}` : "Will be validated at payment"}
                      {preview.error && <span className="text-red-400"> · {preview.error}</span>}
                    </p>
                  </div>
                  <button onClick={removeOffer} className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-white/10 hover:text-white" aria-label="Remove offer">
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyOfferCode(offerInput);
                      }
                    }}
                    placeholder="Enter offer code"
                    aria-label="Offer code"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm uppercase text-white placeholder:font-sans placeholder:normal-case placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={() => applyOfferCode(offerInput)}
                    disabled={!offerInput.trim()}
                    className="shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              )}

              {offers.length > 0 && !appliedOffer && (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">Available for this stay</p>
                  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                    {offers.map((offer) => {
                      const result = computeDiscount(offer, totalAmount);
                      return (
                        <button
                          key={offer._id}
                          onClick={() => applyOfferCode(offer.offerCode, offer)}
                          disabled={Boolean(result.error)}
                          title={result.error || `Save ${formatMoney(result.discountAmount)}`}
                          className="shrink-0 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2 text-left transition-colors hover:border-amber-500/60 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <p className="font-mono text-xs font-semibold text-amber-300">{offer.offerCode}</p>
                          <p className="text-[11px] text-stone-400">
                            {result.error ? result.error : `Save ${formatMoney(result.discountAmount)}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* GOOD TO KNOW */}
            <section className={`${cardClass} text-sm`}>
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <FiInfo className="h-4 w-4 text-amber-400" /> Good to know
              </h2>
              <ul className="space-y-2 text-xs leading-5 text-stone-400 sm:text-sm">
                <li className="flex gap-2"><FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Check-in from 2:00 PM, check-out by 11:00 AM.</li>
                <li className="flex gap-2"><FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> You can cancel from your dashboard any time before check-in. Refunds are processed by the hotel.</li>
                <li className="flex gap-2"><FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Your booking reference appears right after payment and in your dashboard.</li>
              </ul>
            </section>
          </div>

          {/* ================= PRICE SUMMARY ================= */}
          <aside className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-stone-900/70 p-4 shadow-[0_0_30px_rgba(245,158,11,0.05)] backdrop-blur-xl sm:p-6 lg:sticky lg:top-24">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-[40px]" />

              <h2 className="mb-4 font-serif text-lg font-bold text-white sm:text-xl">Price summary</h2>

              <div className="space-y-3 border-b border-white/10 pb-4 text-sm">
                <div className="flex justify-between gap-3 text-stone-300">
                  <span>{formatMoney(room.pricePerNight)} × {nightsText}</span>
                  <span>{formatMoney(totalAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between gap-3 text-emerald-400">
                    <span>Offer {appliedOffer.offerCode}</span>
                    <span>− {formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3 text-stone-300">
                  <span>Taxes & fees</span>
                  <span className="text-emerald-400">Included</span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-xs font-bold uppercase text-stone-400">Total</span>
                <span className="text-2xl font-bold text-amber-400 sm:text-3xl">{formatMoney(payableAmount)}</span>
              </div>
              {discountAmount > 0 && <p className="mt-1 text-right text-xs text-emerald-400">You save {formatMoney(discountAmount)}</p>}

              {/* Desktop pay button — phones use the bottom bar */}
              <button
                onClick={handleBookRoom}
                disabled={loading || nights <= 0}
                className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 font-bold text-white shadow-lg transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 lg:flex"
              >
                {payButtonContent}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-stone-500">
                <FiLock className="h-3 w-3" /> Secured by Razorpay · You agree to our terms by paying.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* ===================================================
          PHONE PAY BAR
      =================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-stone-950/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-white">{formatMoney(payableAmount)}</p>
            <p className="truncate text-[11px] text-stone-400">
              {discountAmount > 0 ? <span className="text-emerald-400">You save {formatMoney(discountAmount)} · </span> : null}
              {nightsText} · taxes included
            </p>
          </div>
          <button
            onClick={handleBookRoom}
            disabled={loading || nights <= 0}
            className="flex min-w-[9.5rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          >
            {payButtonContent}
          </button>
        </div>
      </div>

      {/* ===================================================
          BOOKING CONFIRMATION (Step 8)
      =================================================== */}

      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-stone-900 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-8">
            <Stepper current={2} />

            <div className="mb-4 mt-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <FiCheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="mb-1 text-center font-serif text-2xl font-bold text-white">Booking confirmed!</h3>
            <p className="mb-6 text-center text-sm text-stone-400">Your payment is complete. Show this reference at reception during check-in.</p>

            <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/40 text-sm">
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Booking reference</span><span className="font-mono text-amber-300">{String(confirmedBooking._id).slice(-8).toUpperCase()}</span></div>
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Hotel</span><span className="text-right text-white">{confirmedBooking.hotelName}</span></div>
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Room</span><span className="text-right capitalize text-white">{confirmedBooking.roomType} · No. {confirmedBooking.roomNumber}</span></div>
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Stay</span><span className="text-right text-white">{formatDate(confirmedBooking.checkInDate)} → {formatDate(confirmedBooking.checkOutDate)}<span className="block text-xs text-stone-500">{confirmedBooking.numberOfNights} night{confirmedBooking.numberOfNights === 1 ? "" : "s"}</span></span></div>
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Guests</span><span className="text-right text-white">{confirmedBooking.adults} adult{confirmedBooking.adults === 1 ? "" : "s"}{confirmedBooking.children ? `, ${confirmedBooking.children} child${confirmedBooking.children === 1 ? "" : "ren"}` : ""}</span></div>
              {confirmedBooking.discountAmount > 0 && <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Discount ({confirmedBooking.offerCode})</span><span className="text-emerald-400">− {formatMoney(confirmedBooking.discountAmount)}</span></div>}
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Amount paid</span><span className="font-bold text-emerald-400">{formatMoney(confirmedBooking.payableAmount)}</span></div>
              <div className="flex justify-between gap-4 px-4 py-3"><span className="text-stone-500">Status</span><span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">{confirmedBooking.bookingStatus} · {confirmedBooking.paymentStatus}</span></div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button onClick={() => navigate(`/rooms/${confirmedBooking.hotelId}`, { replace: true })} className="flex-1 rounded-xl border border-white/10 py-3 font-medium text-stone-300 transition-colors hover:bg-white/5">Back to hotel</button>
              <button onClick={() => navigate("/user/dashboard", { replace: true, state: { section: "bookings" } })} className="flex-1 rounded-xl bg-amber-600 py-3 font-bold text-white transition-colors hover:bg-amber-500">View my bookings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
