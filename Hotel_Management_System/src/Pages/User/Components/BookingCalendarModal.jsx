import React from "react";
import { FiX, FiCalendar, FiClock } from "react-icons/fi";

const BookingCalendarModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  // Simple date parsers since we are avoiding bloated libraries
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);

  // Month data
  const monthName = checkIn.toLocaleString('default', { month: 'long' });
  const year = checkIn.getFullYear();
  
  // Get days in month and start day
  const daysInMonth = new Date(year, checkIn.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, checkIn.getMonth(), 1).getDay();
  
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isBookedDay = (day) => {
    const current = new Date(year, checkIn.getMonth(), day);
    // Strip time for accurate day comparison
    current.setHours(0,0,0,0);
    const ci = new Date(checkIn); ci.setHours(0,0,0,0);
    const co = new Date(checkOut); co.setHours(0,0,0,0);
    
    return current >= ci && current <= co;
  };

  const isCheckIn = (day) => day === checkIn.getDate();
  const isCheckOut = (day) => day === checkOut.getDate() && checkOut.getMonth() === checkIn.getMonth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-stone-950 p-6 shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-500/20 blur-[70px]" />
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <FiCalendar className="text-amber-500" /> Booking Dates
            </h2>
            <p className="mt-1 text-xs text-stone-400">Preview your stay visually</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white text-lg">{monthName} {year}</h3>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-stone-500 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="h-10 w-full" />
            ))}
            {days.map((day) => {
              const booked = isBookedDay(day);
              const ci = isCheckIn(day);
              const co = isCheckOut(day);
              
              let classes = "flex h-10 w-full items-center justify-center rounded-lg text-sm transition-all ";
              
              if (ci) classes += "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 ";
              else if (co) classes += "bg-red-500 text-white font-bold shadow-lg shadow-red-500/30 ";
              else if (booked) classes += "bg-amber-500/20 text-amber-300 font-semibold ";
              else classes += "text-stone-400 hover:bg-white/5 ";

              return (
                <div key={day} className={classes}>
                  {day}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-stone-300">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span>Check-in: <strong className="text-white">{checkIn.toLocaleDateString()}</strong> (From 2:00 PM)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <span>Check-out: <strong className="text-white">{checkOut.toLocaleDateString()}</strong> (Before 11:00 AM)</span>
            </div>
            <div className="mt-2 border-t border-white/5 pt-2 flex items-center gap-2 text-stone-400">
              <FiClock className="h-3.5 w-3.5" /> 
              <span>Status: <strong className="text-white uppercase">{booking.bookingStatus}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-white/10 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
};

export default BookingCalendarModal;
