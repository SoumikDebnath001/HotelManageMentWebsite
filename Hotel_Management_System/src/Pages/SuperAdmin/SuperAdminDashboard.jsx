import React, { useEffect, useState } from "react";
import { FiHome, FiGrid, FiCalendar, FiDollarSign, FiUsers, FiBriefcase } from "react-icons/fi";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import { fetchAdminDashboard } from "../../Services/dashboard.service";

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalHotels: 0,
    pendingHotels: 0,
    totalRooms: 0,
    totalCustomers: 0,
    totalBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalAdmins: 0,
    totalManagers: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboard();
      if (res?.data?.status && res?.data?.data) {
        setAdminStats(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-stone-400">Overview of system operations and statistics.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-500/20 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Total Admins</span>
            <FiUsers className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl text-white">{adminStats.totalAdmins || 0}</p>
          <p className="mt-1 text-[11px] text-stone-400">Platform Administrators</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Total Managers</span>
            <FiBriefcase className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl text-white">{adminStats.totalManagers || 0}</p>
          <p className="mt-1 text-[11px] text-stone-400">Property Managers</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Total Hotels</span>
            <FiHome className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl text-white">{adminStats.totalHotels}</p>
          <p className="mt-1 text-[11px] text-amber-400">{adminStats.pendingHotels} Pending Approval</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Total Rooms</span>
            <FiGrid className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl text-white">{adminStats.totalRooms}</p>
          <p className="mt-1 text-[11px] text-emerald-400">
            {adminStats.availableRooms} Available / {adminStats.occupiedRooms} Booked
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Total Bookings</span>
            <FiCalendar className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-amber-400" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl text-white">{adminStats.totalBookings}</p>
          <p className="mt-1 text-[11px] text-red-400">{adminStats.cancelledBookings} Cancelled</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-stone-900/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Total Revenue</span>
            <FiDollarSign className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl text-emerald-400">
            ₹{Number(adminStats.totalRevenue || 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">Paid Transactions</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <GlassCard className="border-white/15 !p-5 sm:!p-8">
          <h3 className="font-serif text-xl font-semibold text-white">System Status</h3>
          <p className="mt-1 text-xs text-stone-400">Real-time operational summary.</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <div>
                <p className="text-sm font-semibold text-white">Database Synchronization</p>
                <p className="text-xs text-stone-400">All MongoDB collections connected</p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <div>
                <p className="text-sm font-semibold text-white">Security & Auth Protocols</p>
                <p className="text-xs text-stone-400">2FA OTP & Role Middleware Active</p>
              </div>
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                Secured
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
