import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { FiChevronLeft, FiCheckCircle, FiShield, FiCreditCard } from "react-icons/fi";
import { useSelector } from "react-redux";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import toast from "react-hot-toast";
import { bookRoom, makePayment, createRazorpayOrder } from "../../Services/booking.service";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { room, hotel, checkIn, checkOut, adults } = location.state || {};
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // If accessed directly without state, redirect back
  if (!room || !checkIn || !checkOut) {
    return <Navigate to="/rooms" replace />;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalAmount = room.pricePerNight * nights;

  const handleBookRoom = async () => {
    setLoading(true);
    try {
      // 1. Initiate booking
      const payload = {
        roomId: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: adults || 1
      };
      
      // 1. Create Razorpay Order securely from backend
      const orderRes = await createRazorpayOrder(payload);
      
      if (!orderRes?.data?.status || !orderRes?.data?.data?.orderId) {
        toast.error(orderRes?.data?.message || "Failed to initialize payment gateway");
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "ComfyStay",
        description: `Booking for ${hotel?.hotelName}`,
        order_id: orderId,
        handler: async function (response) {
          // On Success
          try {
            setLoading(true);
            const bookingPayload = {
              ...payload,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            };
            // 3. Finalize Booking in Database
            const payRes = await bookRoom(bookingPayload);
            if (payRes?.data?.status) {
              toast.success("Payment successful! Booking confirmed.");
              setShowSuccessModal(true);
            } else {
              toast.error(payRes?.error || payRes?.data?.message || "Payment verification failed");
            }
          } catch (error) {
            toast.error(error?.response?.data?.message || "Error finalizing booking");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.firstMiddleName ? `${user.firstMiddleName} ${user.lastName || ""}` : "Guest",
          email: user?.email || "",
          contact: user?.contact?.mobileNumber || user?.mobile || ""
        },
        theme: {
          color: "#d97706" // amber-600
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(response.error.description || "Payment failed");
      });
      rzp.open();

    } catch (error) {
      toast.error(error?.response?.data?.message || "Error processing booking");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-12 px-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 mb-6 transition-colors text-sm font-semibold"
        >
          <FiChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="font-serif text-3xl font-bold text-white mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 border-white/10">
              <h2 className="text-xl font-bold text-white font-serif mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" /> Booking Details
              </h2>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5 mb-6">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt="Room" className="w-24 h-24 rounded-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-stone-800 flex items-center justify-center">
                    <span className="text-xs text-stone-500">No Image</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-amber-400">{hotel?.hotelName}</h3>
                  <p className="text-stone-300 font-medium">{room.roomType || `Room ${room.roomNumber}`}</p>
                  <p className="text-stone-500 text-sm mt-1">{hotel?.address?.street}, {hotel?.address?.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1">Check-in</p>
                  <p className="text-white font-semibold">{checkIn}</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-stone-500 font-bold uppercase mb-1">Check-out</p>
                  <p className="text-white font-semibold">{checkOut}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/10">
              <h2 className="text-xl font-bold text-white font-serif mb-4">Guest Details</h2>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <p className="text-stone-300 text-sm">Number of Adults: <strong className="text-white">{adults || 1}</strong></p>
                <p className="text-xs text-amber-500/80 mt-2 flex items-center gap-1">
                  <FiShield /> Your personal details are securely managed.
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Price Summary */}
          <div className="space-y-6">
            <GlassCard className="p-6 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-[40px]" />
              
              <h2 className="text-xl font-bold text-white font-serif mb-4">Price Summary</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10 text-sm">
                <div className="flex justify-between text-stone-300">
                  <span>${room.pricePerNight} x {nights} night(s)</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Taxes & Fees</span>
                  <span className="text-emerald-400">Included</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-stone-400 font-bold uppercase text-xs">Total Amount</span>
                <span className="text-3xl font-bold text-amber-400">${totalAmount}</span>
              </div>

              <button
                onClick={handleBookRoom}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-lg hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>Proceed to Payment <FiCreditCard /></>
                )}
              </button>
              
              <p className="text-[10px] text-center text-stone-500 mt-4">
                By proceeding, you agree to our terms and conditions.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Razorpay handles its own modal, no need for the mock one */}

        {/* Success Confirmation Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-stone-900 border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white text-center mb-4">
                Booking Successful!
              </h3>
              <p className="text-stone-300 text-center mb-8">
                Your payment is completed and your booking is confirmed.
                <br />
                <br />
                <strong>Booking info and the info you can see your bookings from dashboard.</strong>
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/user/dashboard", { replace: true });
                }}
                className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
