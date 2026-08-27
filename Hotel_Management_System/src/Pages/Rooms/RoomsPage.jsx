import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";
import { AuthActions } from "../../Components/Layout/Navbar/Navbar";
import UnifiedLoginModal from "../../Features/Auth/Components/UnifiedLoginModal";
import HotelDiscovery from "./HotelDiscovery";
import HotelDetails from "./HotelDetails";

const RoomsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-stone-950 text-white selection:bg-amber-500 selection:text-white pt-8 pb-12">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 left-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px]" />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10">
        
        {/* Top Navigation Bar for Rooms Flow */}
        <div className="mb-8 flex justify-between items-center relative z-50">
          <div>
            <button 
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-sm font-semibold text-stone-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
            >
              <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </button>
          </div>
          
          <AuthActions
            isAuthenticated={isAuthenticated}
            user={user}
            userType={userType}
            onNavigate={navigate}
            onOpenLoginModal={() => setLoginModalOpen(true)}
            onLogout={handleLogout}
            hideBookNow={true}
            className="flex"
          />
        </div>

        <Routes>
          <Route path="" element={<HotelDiscovery />} />
          <Route path=":hotelId" element={<HotelDetails />} />
        </Routes>
      </div>

      {loginModalOpen && (
        <UnifiedLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RoomsPage;
