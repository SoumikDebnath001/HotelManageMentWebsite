import React, { useEffect, useState } from "react";
import { FiHome, FiUsers, FiGrid, FiCalendar, FiDollarSign } from "react-icons/fi";
import { fetchMyHotels, fetchMyManagers, fetchDashboardStats } from "../../Services/admin.service";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalManagers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentHotels: [],
    recentManagers: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, managersRes, statsRes] = await Promise.all([
        fetchMyHotels(),
        fetchMyManagers(),
        fetchDashboardStats(),
      ]);

      const hotels = hotelsRes?.data?.data || [];
      const managers = managersRes?.data?.data || [];
      const dashboardStats = statsRes?.data?.data || { totalBookings: 0, totalRevenue: 0 };

      setStats({
        totalHotels: hotels.length,
        totalManagers: managers.length,
        totalBookings: dashboardStats.totalBookings,
        totalRevenue: dashboardStats.totalRevenue,
        recentHotels: hotels.slice(0, 5),
        recentManagers: managers.slice(0, 5),
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
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Hotel Admin Dashboard</h1>
        <p className="text-stone-400">Welcome to your management portal. Here is an overview of your properties and staff.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-amber-500/10">
            <FiHome className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Hotels</span>
            <FiHome className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-white relative z-10">{stats.totalHotels}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-amber-500/10">
            <FiUsers className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Managers</span>
            <FiUsers className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-white relative z-10">{stats.totalManagers}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-amber-500/10">
            <FiCalendar className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <FiCalendar className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-white relative z-10">{stats.totalBookings}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-emerald-500/10">
            <FiDollarSign className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <FiDollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-serif text-4xl font-bold text-emerald-400 relative z-10">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Hotels</h2>
          {stats.recentHotels.length === 0 ? (
            <p className="text-stone-400 text-sm">No hotels found.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {stats.recentHotels.map((hotel) => (
                <li key={hotel._id} className="py-3 flex justify-between items-center">
                  <span className="text-sm text-stone-200">{hotel.hotelName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    hotel.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                    hotel.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {hotel.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Managers</h2>
          {stats.recentManagers.length === 0 ? (
            <p className="text-stone-400 text-sm">No managers found.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {stats.recentManagers.map((manager) => (
                <li key={manager._id} className="py-3 flex justify-between items-center">
                  <span className="text-sm text-stone-200">{manager.name}</span>
                  <span className="text-xs text-stone-400">{manager.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
