import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FiUser, FiCalendar, FiArrowLeft, FiLogOut, FiHeart, FiMenu, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import { logout } from "../../Store/Slices/AuthSlice";
import UserInfo from "./Components/UserInfo";
import UserBookings from "./Components/UserBookings";
import UserLikedHotels from "./Components/UserLikedHotels";
import GlassCard from "../../Features/Auth/Components/GlassCard";

/* =========================================================
   SECTIONS — shared by the desktop sidebar and phone drawer
========================================================= */

const SECTIONS = [
  { key: "info", label: "User Info", icon: FiUser },
  { key: "bookings", label: "Booking Details", icon: FiCalendar },
  { key: "liked", label: "Liked Hotels", icon: FiHeart },
];

/* =========================================================
   NAV OPTIONS
========================================================= */

const NavOptions = ({ activeSection, onSelect, onHome, onLogout }) => (
  <nav className="flex flex-col gap-2">
    {SECTIONS.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => onSelect(key)}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
          activeSection === key
            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
            : "text-stone-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="h-5 w-5" /> {label}
      </button>
    ))}

    <div className="my-4 border-t border-white/10"></div>

    <button
      onClick={onHome}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-300 transition-all hover:bg-white/10 hover:text-white"
    >
      <FiArrowLeft className="h-5 w-5" /> Back to Home
    </button>

    <button
      onClick={onLogout}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 mt-2"
    >
      <FiLogOut className="h-5 w-5" /> Logout
    </button>
  </nav>
);

/* =========================================================
   USER DASHBOARD
========================================================= */

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);

  // Checkout sends { section: "bookings" } so the guest lands on their reservations
  const [activeSection, setActiveSection] = useState(location.state?.section || "info"); // 'info' | 'bookings' | 'liked'
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to access your dashboard.");
      navigate("/user/auth/login", { replace: true });
    } else if (userType !== "User") {
      toast.error("Unauthorized access.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, userType, navigate, location.pathname]);

  /* =======================================================
     PHONE DRAWER — Escape to close, lock page scroll
  ======================================================= */

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!isAuthenticated || userType !== "User") return null;

  const selectSection = (key) => {
    setActiveSection(key);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setMenuOpen(false);
    navigate("/");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
  };

  const activeLabel = SECTIONS.find((s) => s.key === activeSection)?.label || "User Portal";
  const displayName = user?.firstMiddleName
    ? `${user.firstMiddleName} ${user.lastName || ""}`.trim()
    : user?.email;
  const avatar = Array.isArray(user?.image) ? user.image[0] : user?.image;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-stone-950 text-white selection:bg-amber-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px]" />

      {/* ===================================================
          PHONE TOP BAR
      =================================================== */}

      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">User Portal</p>
          <p className="truncate font-serif text-lg font-bold leading-tight text-white">{activeLabel}</p>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open dashboard menu"
          aria-expanded={menuOpen}
          aria-controls="user-dashboard-menu"
          className="shrink-0 rounded-full border border-white/15 bg-black/40 p-2.5 text-white transition-all hover:border-amber-400/50 hover:bg-black/80"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </div>

      {/* ===================================================
          PHONE SIDEBAR DRAWER
      =================================================== */}

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              id="user-dashboard-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard navigation"
              className="fixed inset-y-0 right-0 z-50 flex h-full w-[82%] max-w-xs flex-col border-l border-white/15 bg-black/40 p-6 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <h2 className="font-serif text-2xl font-bold text-white">User Portal</h2>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close dashboard menu"
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 hover:text-amber-400"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="my-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-800">
                    <FiUser className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Guest</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <NavOptions activeSection={activeSection} onSelect={selectSection} onHome={goHome} onLogout={handleLogout} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative mx-auto flex max-w-[1400px] flex-col lg:flex-row min-h-screen px-4 pt-6 pb-12 sm:px-10 lg:pt-24 gap-8">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden w-72 flex-shrink-0 lg:block">
          <GlassCard className="sticky top-28 border-white/10 bg-black/40 p-6">
            <h2 className="font-serif text-2xl font-bold text-white mb-6">User Portal</h2>
            <NavOptions activeSection={activeSection} onSelect={selectSection} onHome={goHome} onLogout={handleLogout} />
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
