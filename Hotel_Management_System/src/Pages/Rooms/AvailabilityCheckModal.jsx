import React, { useState, useEffect } from "react";
import { getRoomBookedDates } from "../../Services/booking.service";
import { FiX, FiUsers } from "react-icons/fi";
import { formatMoney, nightsBetween } from "../../Utils/bookingHelpers";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AvailabilityCheckModal = ({ room, hotel, onClose }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const maxAdults = room.maxAdults || 2;
  const maxChildren = room.maxChildren || 0;
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const fetchBookedDates = async () => {
    setLoadingDates(true);
    try {
      const res = await getRoomBookedDates(room._id);
      if (res?.data?.status) {
        setBookedDates(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch booked dates");
    }
    setLoadingDates(false);
  };

  const isDateBooked = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    
    return bookedDates.some((booking) => {
      const start = new Date(booking.checkInDate);
      start.setHours(0,0,0,0);
      const end = new Date(booking.checkOutDate);
      end.setHours(0,0,0,0);
      return d >= start && d <= end;
    });
  };

  const handleProceedToBook = () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select valid dates");
      return;
    }
    if (adults < 1 || adults > maxAdults) {
      toast.error(`This room allows 1 to ${maxAdults} adults`);
      return;
    }
    if (children < 0 || children > maxChildren) {
      toast.error(maxChildren ? `This room allows up to ${maxChildren} children` : "This room does not allow children");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please sign in to complete your booking.");
      navigate("/user/auth/login");
      return;
    }
    toast.success("Proceeding to booking...");
    navigate('/user/checkout', { state: { room, hotel, checkIn, checkOut, adults, children } })
  };

  // Calendar rendering logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const formatDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleDateSelect = (day) => {
    const selected = new Date(year, month, day);
    selected.setHours(0,0,0,0);

    if (selected < todayDate) return; // Past date
    if (isDateBooked(selected)) return; // Booked date

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(formatDateString(selected));
      setCheckOut("");
    } else {
      const currentCheckIn = new Date(checkIn);
      currentCheckIn.setHours(0,0,0,0);
      
      if (selected < currentCheckIn) {
        setCheckIn(formatDateString(selected));
        setCheckOut("");
      } else {
        // Validate no booked dates in between
        let valid = true;
        for (let d = new Date(currentCheckIn); d <= selected; d.setDate(d.getDate() + 1)) {
          if (isDateBooked(d)) {
            valid = false;
            break;
          }
        }
        
        if (!valid) {
          toast.error("Your selection includes dates that are already booked.");
          setCheckIn(formatDateString(selected));
          setCheckOut("");
        } else {
          setCheckOut(formatDateString(selected));
        }
      }
    }
  };

  const getDayClass = (day) => {
    const d = new Date(year, month, day);
    d.setHours(0,0,0,0);
    
    if (d < todayDate) return "text-stone-600 cursor-not-allowed opacity-30";
    if (isDateBooked(d)) return "text-red-500 font-bold cursor-not-allowed bg-red-500/10 line-through rounded-md";
    
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;
    if (checkInDate) checkInDate.setHours(0,0,0,0);
    if (checkOutDate) checkOutDate.setHours(0,0,0,0);

    const isCheckIn = checkInDate && d.getTime() === checkInDate.getTime();
    const isCheckOut = checkOutDate && d.getTime() === checkOutDate.getTime();
    const isBetween = checkInDate && checkOutDate && d > checkInDate && d < checkOutDate;

    if (isCheckIn && isCheckOut) {
      return "bg-emerald-500 text-white font-bold rounded-xl";
    }
    if (isCheckIn) {
      return `bg-emerald-500 text-white font-bold ${checkOutDate ? "rounded-l-xl rounded-r-none" : "rounded-xl"}`;
    }
    if (isCheckOut) {
      return "bg-emerald-500 text-white font-bold rounded-r-xl rounded-l-none";
    }
    if (isBetween) {
      return "bg-emerald-500/20 text-emerald-400 font-bold rounded-none";
    }

    return "text-stone-300 font-medium hover:bg-white/10 cursor-pointer rounded-xl";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-500 hover:bg-white/5 hover:text-white transition-all z-10"
        >
          <FiX className="h-5 w-5" />
        </button>

        <h3 className="font-serif text-2xl font-bold text-white mb-2">Book Room</h3>
        <p className="text-stone-400 text-sm mb-6">
          {hotel.hotelName} • {room.roomType || `Room ${room.roomNumber}`}
        </p>

        {loadingDates ? (
          <div className="flex justify-center items-center h-48">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-2">
               <button onClick={prevMonth} className="px-3 py-1 rounded-md hover:bg-white/10 text-stone-300 text-sm">&larr; Prev</button>
               <h4 className="font-bold text-white">
                 {currentMonth.toLocaleString('default', { month: 'long' })} {year}
               </h4>
               <button onClick={nextMonth} className="px-3 py-1 rounded-md hover:bg-white/10 text-stone-300 text-sm">Next &rarr;</button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
               <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-stone-500 mb-2">
                 <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
               </div>
               <div className="grid grid-cols-7 gap-y-1 text-center">
                 {blanks.map((_, i) => (
                   <div key={`blank-${i}`} className="h-9 w-full" />
                 ))}
                 {days.map((day) => (
                   <div 
                     key={day} 
                     onClick={() => handleDateSelect(day)}
                     className={`h-9 w-full flex items-center justify-center text-sm transition-all ${getDayClass(day)}`}
                   >
                     {day}
                   </div>
                 ))}
               </div>
               
               <div className="mt-4 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                     <div className="h-3 w-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50"></div>
                     <span className="text-stone-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-3 w-3 rounded-sm bg-red-500/20 border border-red-500/50"></div>
                     <span className="text-stone-400">Booked</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-center">
                <p className="text-[10px] uppercase text-stone-500 font-bold mb-1">Check-in</p>
                <p className="text-sm text-white font-semibold">{checkIn || "Select Date"}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-center">
                <p className="text-[10px] uppercase text-stone-500 font-bold mb-1">Check-out</p>
                <p className="text-sm text-white font-semibold">{checkOut || "Select Date"}</p>
              </div>
            </div>

            {/* Guests */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] uppercase text-stone-500 font-bold mb-1 flex items-center gap-1"><FiUsers /> Adults <span className="normal-case font-normal">(max {maxAdults})</span></p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setAdults((a) => Math.max(1, a - 1))} className="h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20">−</button>
                  <span className="w-8 text-center text-sm font-semibold text-white">{adults}</span>
                  <button type="button" onClick={() => setAdults((a) => Math.min(maxAdults, a + 1))} className="h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20">+</button>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] uppercase text-stone-500 font-bold mb-1 flex items-center gap-1"><FiUsers /> Children <span className="normal-case font-normal">(max {maxChildren})</span></p>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={maxChildren === 0} onClick={() => setChildren((c) => Math.max(0, c - 1))} className="h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-40">−</button>
                  <span className="w-8 text-center text-sm font-semibold text-white">{children}</span>
                  <button type="button" disabled={maxChildren === 0} onClick={() => setChildren((c) => Math.min(maxChildren, c + 1))} className="h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-40">+</button>
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            {checkIn && checkOut && (
              <div className="rounded-xl bg-white/5 p-4 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">Total Price</p>
                  <p className="text-white text-sm">
                    {formatMoney(room.pricePerNight)} × {nightsBetween(checkIn, checkOut)} night{nightsBetween(checkIn, checkOut) === 1 ? "" : "s"}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Offers can be applied at checkout</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatMoney(room.pricePerNight * nightsBetween(checkIn, checkOut))}
                </p>
              </div>
            )}

            <button
              onClick={handleProceedToBook}
              disabled={!checkIn || !checkOut}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:bg-stone-800 disabled:text-stone-500"
            >
              Continue to checkout
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCheckModal;
