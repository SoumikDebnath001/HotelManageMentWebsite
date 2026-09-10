import React, { useState, useEffect } from "react";
import { FiCalendar, FiMapPin, FiCreditCard, FiClock } from "react-icons/fi";
import GlassCard from "../../../Features/Auth/Components/GlassCard";
import { fetchUserBookings } from "../../../Services/dashboard.service";
import { cancelBooking } from "../../../Services/booking.service";
import BookingCalendarModal from "./BookingCalendarModal";
import toast from "react-hot-toast";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchUserBookings();
      if (res?.data?.status && res?.data?.data) {
        setBookings(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load bookings");
    }
    setLoading(false);
  };

  const openCalendarPreview = (booking) => {
    setSelectedBooking(booking);
    setIsCalendarOpen(true);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    
    setCancellingId(bookingId);
    try {
      const res = await cancelBooking({ bookingId });
      if (res?.data?.status) {
        toast.success(res.data.message || "Reservation cancelled successfully");
        loadBookings(); // Reload to update lists
      } else {
        toast.error(res?.data?.message || "Failed to cancel reservation");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error cancelling reservation");
    }
    setCancellingId(null);
  };

  // Separate into Current (upcoming/active) and History (past/cancelled)
  const today = new Date();
  today.setHours(0,0,0,0);

  const currentBookings = bookings.filter(b => {
    const co = new Date(b.checkOutDate);
    return co >= today && b.bookingStatus !== 'cancelled';
  });

  const historyBookings = bookings.filter(b => {
    const co = new Date(b.checkOutDate);
    return co < today || b.bookingStatus === 'cancelled';
  });

  const renderBookingCard = (booking, isHistory = false) => (
    <div key={booking._id} className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-black/40 p-5 transition-all hover:bg-white/5 ${isHistory ? 'border-white/5 opacity-80' : 'border-white/15 shadow-xl'}`}>
      
      {/* Decorative top badge for status */}
      <div className={`absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
        booking.bookingStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
        booking.bookingStatus === 'cancelled' ? 'bg-red-500/20 text-red-400' :
        'bg-amber-500/20 text-amber-400'
      }`}>
        {booking.bookingStatus || "Pending"}
      </div>

      <div className="flex items-start gap-4 pt-2">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${
          isHistory ? 'border-stone-500/30 bg-stone-500/10 text-stone-400' : 'border-amber-500/40 bg-amber-500/20 text-amber-300'
        }`}>
          <FiMapPin className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-bold text-white truncate">{booking.hotelName || "Luxury Suite"}</h3>
          <p className="text-xs text-stone-400 mt-1 font-mono">ID: {booking._id}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-3 text-xs text-stone-300">
        <div>
          <span className="block text-[10px] uppercase text-stone-500 font-semibold mb-0.5">Check-in</span>
          <strong className="text-white">{new Date(booking.checkInDate).toLocaleDateString()}</strong>
        </div>
        <div>
          <span className="block text-[10px] uppercase text-stone-500 font-semibold mb-0.5">Check-out</span>
          <strong className="text-white">{new Date(booking.checkOutDate).toLocaleDateString()}</strong>
        </div>
        <div>
          <span className="block text-[10px] uppercase text-stone-500 font-semibold mb-0.5">Rooms</span>
          <strong className="text-white">{booking.numberOfRooms} Room(s)</strong>
        </div>
        <div>
          <span className="block text-[10px] uppercase text-stone-500 font-semibold mb-0.5">Total Amount</span>
          <strong className="text-emerald-400">${booking.totalAmount}</strong>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex justify-end gap-3">
        {!isHistory && booking.bookingStatus !== 'checkedIn' && (
          <button
            onClick={() => handleCancelBooking(booking._id)}
            disabled={cancellingId === booking._id}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
        <button
          onClick={() => openCalendarPreview(booking)}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          <FiCalendar className="h-3.5 w-3.5" /> Preview Calendar
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="font-serif text-3xl font-bold text-white">Booking Details</h2>
        <p className="mt-1 text-sm text-stone-400">Manage your current stays and view past history.</p>
      </div>

      <div className="space-y-10">
        {/* Current Bookings Section */}
        <section>
          <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-amber-400 mb-4">
            <FiClock /> Current & Upcoming Stays
          </h3>
          {currentBookings.length === 0 ? (
            <GlassCard className="flex h-32 flex-col items-center justify-center border-white/10 text-center">
              <p className="text-stone-400 text-sm">You have no upcoming reservations.</p>
            </GlassCard>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {currentBookings.map(b => renderBookingCard(b, false))}
            </div>
          )}
        </section>

        {/* Booking History Section */}
        <section>
          <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-stone-300 mb-4">
            <FiCreditCard /> Booking History
          </h3>
          {historyBookings.length === 0 ? (
            <GlassCard className="flex h-32 flex-col items-center justify-center border-white/10 text-center">
              <p className="text-stone-500 text-sm">No past booking history found.</p>
            </GlassCard>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {historyBookings.map(b => renderBookingCard(b, true))}
            </div>
          )}
        </section>
      </div>

      <BookingCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default UserBookings;
