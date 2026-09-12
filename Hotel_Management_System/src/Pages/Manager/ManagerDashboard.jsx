import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiGrid, FiCheckCircle, FiCalendar, FiTool, FiLogIn, FiUsers, FiCheckSquare, FiTag, FiArrowRight } from "react-icons/fi";
import { fetchHotelRooms, fetchMyHotel, fetchHotelBookings } from "../../Services/manager.service";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    bookedRooms: 0,
    maintenanceRooms: 0,
    hotelName: "",
    hotelAmenities: [],
    hotelStatus: "",
    upcomingArrivals: 0,
    checkedIn: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [roomsRes, hotelRes, bookedRes, checkedInRes, allRes] = await Promise.all([
        fetchHotelRooms(),
        fetchMyHotel(),
        fetchHotelBookings({ bookingStatus: "booked", limit: 1 }),
        fetchHotelBookings({ bookingStatus: "checkedIn", limit: 1 }),
        fetchHotelBookings({ limit: 1 }),
      ]);

      const rooms = roomsRes?.data?.data || [];
      const hotels = hotelRes?.data?.data || [];
      const hotel = hotels[0] || {};

      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.availabilityStatus === "available").length,
        bookedRooms: rooms.filter(r => r.availabilityStatus === "booked").length,
        maintenanceRooms: rooms.filter(r => r.availabilityStatus === "maintenance").length,
        hotelName: hotel.hotelName || "Your Hotel",
        hotelAmenities: hotel.amenities || [],
        hotelStatus: hotel.status || "",
        upcomingArrivals: bookedRes?.data?.pagination?.total || 0,
        checkedIn: checkedInRes?.data?.pagination?.total || 0,
        totalBookings: allRes?.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in duration-500 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">Manager Dashboard</h1>
        <p className="text-stone-400">Welcome back! Here's an overview of <strong className="text-amber-400">{stats.hotelName}</strong>.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 sm:p-6 text-amber-500/10">
            <FiGrid className="h-14 w-14 sm:h-24 sm:w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Rooms</span>
            <FiGrid className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-white relative z-10">{stats.totalRooms}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-black/40 backdrop-blur-md p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 sm:p-6 text-emerald-500/10">
            <FiCheckCircle className="h-14 w-14 sm:h-24 sm:w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Available</span>
            <FiCheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-emerald-400 relative z-10">{stats.availableRooms}</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-black/40 backdrop-blur-md p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 sm:p-6 text-blue-500/10">
            <FiCalendar className="h-14 w-14 sm:h-24 sm:w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Booked</span>
            <FiCalendar className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-blue-400 relative z-10">{stats.bookedRooms}</p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-black/40 backdrop-blur-md p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 sm:p-6 text-orange-500/10">
            <FiTool className="h-14 w-14 sm:h-24 sm:w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Maintenance</span>
            <FiTool className="h-5 w-5 text-orange-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-orange-400 relative z-10">{stats.maintenanceRooms}</p>
        </div>
      </div>

      {/* BOOKINGS OVERVIEW */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
        <Link to="/employee/panel/bookings?status=booked" className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Upcoming arrivals</span>
            <FiLogIn className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-white">{stats.upcomingArrivals}</p>
          <p className="mt-1 text-[11px] text-stone-500">Paid bookings waiting for check-in</p>
        </Link>
        <Link to="/employee/panel/bookings?status=checkedIn" className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Guests in house</span>
            <FiUsers className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-white">{stats.checkedIn}</p>
          <p className="mt-1 text-[11px] text-stone-500">Currently checked in</p>
        </Link>
        <Link to="/employee/panel/bookings" className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total bookings</span>
            <FiCalendar className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-white">{stats.totalBookings}</p>
          <p className="mt-1 text-[11px] text-stone-500">All time, including cancelled</p>
        </Link>
      </div>

      {/* HOTEL AMENITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-semibold text-white flex items-center gap-2"><FiCheckSquare className="text-amber-400" /> Hotel Amenities</h3>
            <span className="text-xs text-stone-500">{stats.hotelAmenities.length} listed</span>
          </div>
          {stats.hotelAmenities.length === 0 ? (
            <p className="text-sm text-stone-500 italic">No hotel amenities added yet. Your hotel admin can add them from the hotel edit form.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.hotelAmenities.map((amenity) => (
                <span key={amenity} className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200">
                  <FiCheckCircle className="h-3 w-3" /> {amenity}
                </span>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-stone-500">Hotel-level amenities are managed by your hotel admin. Room-level amenities are set per room in the Rooms section.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6 space-y-3">
          <h3 className="font-serif text-xl font-semibold text-white mb-2">Quick actions</h3>
          <Link to="/employee/panel/rooms" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200 hover:border-amber-500/40 hover:text-white transition-colors">
            <span className="flex items-center gap-2"><FiGrid className="text-amber-400" /> Manage rooms & amenities</span><FiArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/employee/panel/bookings" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200 hover:border-amber-500/40 hover:text-white transition-colors">
            <span className="flex items-center gap-2"><FiCalendar className="text-amber-400" /> Check-in / check-out guests</span><FiArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/employee/panel/offers" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200 hover:border-amber-500/40 hover:text-white transition-colors">
            <span className="flex items-center gap-2"><FiTag className="text-amber-400" /> Create discount offers</span><FiArrowRight className="h-4 w-4" />
          </Link>
          {stats.hotelStatus && stats.hotelStatus !== "approved" && (
            <p className="text-xs text-amber-400/80 pt-2">Hotel status: {stats.hotelStatus}. Rooms and offers can be created once the hotel is approved.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
