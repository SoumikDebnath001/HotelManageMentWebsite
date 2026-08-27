import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiCalendar, FiArrowLeft, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

import { logout } from "../../Store/Slices/AuthSlice";
import UserInfo from "./Components/UserInfo";
import UserBookings from "./Components/UserBookings";
import UserLikedHotels from "./Components/UserLikedHotels";
import GlassCard from "../../Features/Auth/Components/GlassCard";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, userType } = useSelector((state) => state.auth);

  const [activeSection, setActiveSection] = useState("info"); // 'info' or 'bookings'

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to access your dashboard.");
      navigate("/user/auth/login", { replace: true });
    } else if (userType !== "User") {
      toast.error("Unauthorized access.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, userType, navigate, location.pathname]);

  if (!isAuthenticated || userType !== "User") return null;

  return (
    <div className="min-h-screen bg-stone-950 text-white selection:bg-amber-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px]" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col lg:flex-row min-h-screen pt-24 pb-12 px-6 sm:px-10 gap-8">
        
        {/* SIDEBAR */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <GlassCard className="sticky top-28 border-white/10 bg-black/40 p-6">
            <h2 className="font-serif text-2xl font-bold text-white mb-6">User Portal</h2>
            
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveSection("info")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeSection === "info"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
                    : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiUser className="h-5 w-5" /> User Info
              </button>
              
              <button
                onClick={() => setActiveSection("bookings")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeSection === "bookings"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
                    : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiCalendar className="h-5 w-5" /> Booking Details
              </button>

              <button
                onClick={() => setActiveSection("liked")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeSection === "liked"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
                    : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg xmlns="http://www.w-images/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> 
                Liked Hotels
              </button>

              <div className="my-4 border-t border-white/10"></div>

              <button
                onClick={() => navigate("/")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-400 transition-all hover:bg-white/5 hover:text-white"
              >
                <FiArrowLeft className="h-5 w-5" /> Back to Home
              </button>

              <button
                onClick={() => dispatch(logout())}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 mt-2"
              >
                <FiLogOut className="h-5 w-5" /> Logout
              </button>
            </nav>
          </GlassCard>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">
          <div className="rounded-3xl p-1">
            {activeSection === "info" && <UserInfo />}
            {activeSection === "bookings" && <UserBookings />}
            {activeSection === "liked" && <UserLikedHotels />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
