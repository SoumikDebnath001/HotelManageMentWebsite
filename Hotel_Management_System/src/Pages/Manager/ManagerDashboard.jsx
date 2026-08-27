import React, { useEffect, useState } from "react";
import { FiGrid, FiCheckCircle, FiCalendar, FiTool } from "react-icons/fi";
import { fetchHotelRooms, fetchMyHotel } from "../../Services/manager.service";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    bookedRooms: 0,
    maintenanceRooms: 0,
    hotelName: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [roomsRes, hotelRes] = await Promise.all([
        fetchHotelRooms(),
        fetchMyHotel(),
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
    <div className="animate-in fade-in zoom-in duration-500 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Manager Dashboard</h1>
        <p className="text-stone-400">Welcome back! Here's an overview of <strong className="text-amber-400">{stats.hotelName}</strong>.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-amber-500/10">
            <FiGrid className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rooms</span>
            <FiGrid className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-white relative z-10">{stats.totalRooms}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-emerald-500/10">
            <FiCheckCircle className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
            <FiCheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-emerald-400 relative z-10">{stats.availableRooms}</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-blue-500/10">
            <FiCalendar className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Booked</span>
            <FiCalendar className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-blue-400 relative z-10">{stats.bookedRooms}</p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-orange-500/10">
            <FiTool className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Maintenance</span>
            <FiTool className="h-5 w-5 text-orange-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-orange-400 relative z-10">{stats.maintenanceRooms}</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
