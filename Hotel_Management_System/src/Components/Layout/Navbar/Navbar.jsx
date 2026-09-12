import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMenu,
  FiSearch,
  FiX,
  FiLogOut,
  FiUser,
  FiBriefcase,
  FiChevronDown,
  FiGrid,
  FiCalendar,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";

import { logout } from "../../../Store/Slices/AuthSlice";

import UnifiedLoginModal from "../../../Features/Auth/Components/UnifiedLoginModal";

import SiteIcon from "../../../assets/Site_Icon.png";
import { searchPublicHotels } from "../../../Services/booking.service";

/* =========================================================
   NAVIGATION LINKS
========================================================= */

const getDashboardRoute = (userType) => {
  if (userType === "User") return "/user/dashboard";
  if (userType === "SuperAdmin") return "/admin/superadmin/dashboard";
  if (userType === "Admin") return "/admin/panel/dashboard";
  if (userType === "Employee") return "/employee/panel/dashboard";
  return "/";
};

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Home Stays", path: "/homestays" },
  { label: "About", path: "/about" },
];

/* =========================================================
   NAV LINK
========================================================= */

const NavLink = ({
  label,
  path,
  isActive,
  onNavigate,
  className = "",
}) => (
  <button
    type="button"
    onClick={() => onNavigate(path)}
    aria-current={isActive ? "page" : undefined}
    className={`group relative rounded-full px-5 py-2.5 text-[14.5px] font-medium text-white shadow-sm backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-lg focus:outline-none ${
      isActive
        ? "border border-amber-500/50 bg-amber-500/20 text-amber-300"
        : "border border-white/15 bg-black/40 hover:border-amber-400/50 hover:bg-black/80 hover:text-white"
    } ${className}`}
  >
    {label}
  </button>
);

/* =========================================================
   SEARCH
========================================================= */

const ExpandingSearchField = ({
  onSearch,
  onSelectHotel,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen) {
      setQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

  /*
    Close the search when clicking outside of it.
  */

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  /*
    Debounced suggestions from the public search API.
    A request id guards against out-of-order responses.
  */

  const handleQueryChange = (value) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  useEffect(() => {
    const term = query.trim();

    if (term.length < 2) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      const { data, error } = await searchPublicHotels(term);

      if (cancelled) return;

      if (!error && data?.status && Array.isArray(data?.data?.hotels)) {
        setSuggestions(data.data.hotels.slice(0, 6));
      } else {
        setSuggestions([]);
      }

      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (hotel) => {
    if (onSelectHotel) {
      onSelectHotel(hotel);
    } else {
      onSearch(hotel.hotelName);
    }

    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center ${className}`}
    >
      <motion.form
        initial={false}
        animate={{
          width: isOpen ? "220px" : "0px",
          opacity: isOpen ? 1 : 0,
          marginLeft: isOpen ? "8px" : "0px",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        onSubmit={handleSubmit}
        className="relative flex items-center overflow-hidden"
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search hotels, cities..."
          className="
            w-[220px]
            rounded-full
            border
            border-amber-400/50
            bg-black/80
            py-2.5
            pr-4
            pl-10
            text-[13.5px]
            text-white
            shadow-xl
            backdrop-blur-xl
            placeholder:text-white/60
            focus:outline-none
            focus:ring-2
            focus:ring-amber-500/20
          "
        />

        <FiSearch className="pointer-events-none absolute left-3.5 h-4 w-4 text-amber-400" />
      </motion.form>

      <AnimatePresence>
        {isOpen && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-[calc(100%+8px)] left-2 w-[220px] rounded-xl border border-white/20 bg-stone-950/95 backdrop-blur-xl p-2 shadow-2xl z-[100] max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-3 text-center text-xs text-white/60">Searching...</div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-1">
                {suggestions.map((hotel) => (
                  <li key={hotel._id}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(hotel)}
                      className="w-full text-left px-3 py-2 text-sm text-stone-200 hover:bg-white/10 hover:text-amber-400 rounded-lg transition-colors truncate"
                    >
                      {hotel.hotelName}
                      {hotel.cityName && (
                        <span className="block text-[10px] text-white/50 truncate mt-0.5">
                          {hotel.cityName}{hotel.countryName ? `, ${hotel.countryName}` : ''}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-center text-xs text-white/60">No hotels found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle search"
        className="
          shrink-0
          rounded-full
          border
          border-white/15
          bg-black/40
          p-2.5
          text-white
          shadow-sm
          backdrop-blur-xl
          backdrop-saturate-150
          transition-all
          duration-300
          hover:border-amber-400/50
          hover:bg-black/80
          hover:text-amber-400
          focus:outline-none
        "
      >
        {isOpen ? (
          <FiX className="h-4 w-4" />
        ) : (
          <FiSearch className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

/* =========================================================
   AUTH ACTIONS
========================================================= */

export const AuthActions = ({
  isAuthenticated,
  user,
  userType,
  onNavigate,
  onOpenLoginModal,
  onLogout,
  hideBookNow = false,
  className = "",
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] =
    useState(false);
  const [imgError, setImgError] = useState(false);

  /* =======================================================
     AUTHENTICATED
  ======================================================= */

  if (isAuthenticated) {
    const roleBadge =
      userType === "SuperAdmin"
        ? "Super Admin"
        : userType === "Admin"
          ? "Hotel Admin"
          : userType === "Employee"
            ? "Hotel Manager"
            : "Guest";

    const imageSrc = Array.isArray(user?.image) ? user.image[0] : user?.image;
    const hasValidImage = imageSrc && !imgError;

    return (
      <div
        className={`flex items-center gap-4 ${className}`}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setProfileDropdownOpen(
                (prev) => !prev
              )
            }
            className="
              flex
              cursor-pointer
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-black/40
              p-1.5
              text-white
              shadow-sm
              backdrop-blur-xl
              backdrop-saturate-150
              transition-all
              duration-300
              ease-out
              hover:-translate-y-[2px]
              hover:border-amber-400/50
              hover:bg-black/80
              hover:text-white
              hover:shadow-lg
            "
          >
            {hasValidImage ? (
              <img
                src={imageSrc}
                alt="User Profile"
                onError={() => setImgError(true)}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-stone-800
                  text-white
                  shadow-inner
                "
              >
                <FiUser className="h-4 w-4" />
              </div>
            )}

            <FiChevronDown className="mr-1.5 h-4 w-4" />
          </button>

          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                }}
                className="
                  absolute
                  right-0
                  mt-3
                  w-56
                  rounded-2xl
                  border
                  border-white/20
                  bg-stone-950
                  p-2
                  shadow-[0_20px_50px_rgba(0,0,0,0.7)]
                  z-50
                "
              >
                <div className="border-b border-white/10 px-3 py-3">
                  <p className="text-xs font-semibold text-white">
                    {user?.firstMiddleName
                      ? `${user.firstMiddleName} ${
                          user.lastName || ""
                        }`
                      : user?.email}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-amber-400
                    "
                  >
                    {roleBadge}
                  </p>
                </div>

                <div className="mt-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);

                      onNavigate(getDashboardRoute(userType));
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-2.5
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-stone-200
                      transition-colors
                      hover:bg-black/40
                      hover:text-amber-400
                    "
                  >
                    <FiGrid className="h-4 w-4 text-amber-400" />
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-2.5
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-red-400
                      transition-colors
                      hover:bg-red-500/20
                      hover:text-red-300
                    "
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!hideBookNow && (
          <button
            type="button"
            onClick={() => onNavigate("/rooms")}
            className="
              cursor-pointer
              rounded-full
              bg-gradient-to-r
              from-amber-500
              to-amber-600
              px-6
              py-2.5
              text-[14.5px]
              font-semibold
              text-white
              shadow-[0_0_15px_rgba(245,158,11,0.3)]
              transition-all
              duration-300
              hover:-translate-y-[2px]
              hover:scale-[1.02]
              hover:from-amber-400
              hover:to-amber-500
            "
          >
            Book Now
          </button>
        )}
      </div>
    );
  }

  /* =======================================================
     NOT AUTHENTICATED
  ======================================================= */

  return (
    <div
      className={`flex items-center gap-4 ${className}`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenLoginModal()}
          className="
            inline-flex
            cursor-pointer
            items-center
            gap-1.5
            rounded-full
            border
            border-white/15
            bg-black/40
            px-6
            py-2.5
            text-[14.5px]
            font-medium
            text-white
            shadow-sm
            backdrop-blur-xl
            backdrop-saturate-150
            transition-all
            duration-300
            hover:-translate-y-[2px]
            hover:border-amber-400/50
            hover:bg-black/80
            hover:shadow-lg
          "
        >
          Login
        </button>
      </div>

      {/* SIGN UP */}

      <button
        type="button"
        onClick={() =>
          onNavigate("/user/auth/register")
        }
        className="
          cursor-pointer
          rounded-full
          bg-gradient-to-r
          from-amber-500
          to-amber-600
          px-7
          py-2.5
          text-[14.5px]
          font-semibold
          text-white
          shadow-[0_0_15px_rgba(245,158,11,0.3)]
          transition-all
          duration-300
          hover:-translate-y-[2px]
          hover:scale-[1.02]
          hover:from-amber-400
          hover:to-amber-500
        "
      >
        Sign Up
      </button>
    </div>
  );
};

/* =========================================================
   NAVBAR
========================================================= */

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    userType,
    user,
  } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loginModalOpen, setLoginModalOpen] =
    useState(false);

  /* =======================================================
     MOBILE MENU
  ======================================================= */

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    dispatch(logout());
    goTo("/");
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = (query) => {
    if (!query.trim()) return;

    navigate(
      `/rooms?search=${encodeURIComponent(
        query.trim()
      )}`
    );

    setMenuOpen(false);
  };

  const handleSelectHotel = (hotel) => {
    navigate(`/rooms/${hotel._id}`);

    setMenuOpen(false);
  };

  /* =======================================================
     LOGIN MODAL
  ======================================================= */

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  return (
    <>
      {/* ===================================================
          NAVBAR
      =================================================== */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          w-full
          bg-transparent
          py-4
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[70px]
            max-w-[1400px]
            items-center
            justify-between
            px-6
            sm:px-10
            lg:px-12
          "
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <button
            type="button"
            onClick={() => goTo("/")}
            className="
              flex
              items-center
              gap-2.5
              font-serif
              text-2xl
              font-bold
              tracking-tight
              text-white
              drop-shadow-md
              transition-colors
              duration-300
              hover:text-amber-400
            "
          >
            <img
              src={SiteIcon}
              alt="ComfyStay Logo"
              className="h-8 w-8 object-contain"
            />

            ComfyStay
          </button>

          {/* =================================================
              DESKTOP NAV
          ================================================= */}

          <nav
            aria-label="Primary"
            className="
              hidden
              md:flex
              md:items-center
              md:gap-4
              lg:gap-6
            "
          >
            <ul
              className="
                flex
                items-center
                gap-3
                lg:gap-4
              "
            >
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <NavLink
                    label={link.label}
                    path={link.path}
                    isActive={
                      location.pathname ===
                      link.path
                    }
                    onNavigate={goTo}
                  />
                </li>
              ))}
            </ul>

            <ExpandingSearchField
              onSearch={handleSearch}
              onSelectHotel={handleSelectHotel}
              className="ml-2"
            />
          </nav>

          {/* =================================================
              DESKTOP AUTH
          ================================================= */}

          <div className="flex items-center gap-4">
            <AuthActions
              isAuthenticated={isAuthenticated}
              user={user}
              userType={userType}
              onNavigate={goTo}
              onOpenLoginModal={openLoginModal}
              onLogout={handleLogout}
              className="hidden md:flex"
            />

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="
                rounded-full
                border
                border-white/15
                bg-black/40
                p-2.5
                text-white
                shadow-sm
                backdrop-blur-xl
                transition-all
                hover:border-amber-400/50
                hover:bg-black/80
                md:hidden
              "
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* =================================================
            MOBILE DRAWER
        ================================================= */}

        <AnimatePresence>
          {menuOpen && (
            <>
              {/* BACKDROP */}

              <motion.div
                className="
                  fixed
                  inset-0
                  z-50
                  bg-black/20
                  md:hidden
                "
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              {/* DRAWER */}

              <motion.div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                className="
                  fixed
                  inset-y-0
                  right-0
                  z-50
                  flex
                  h-full
                  w-full
                  max-w-sm
                  flex-col
                  border-l
                  border-white/15
                  bg-black/40
                  p-6
                  shadow-2xl
                  backdrop-blur-2xl
                  backdrop-saturate-150
                  md:hidden
                "
                initial={{
                  x: "100%",
                }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: "100%",
                }}
                transition={{
                  type: "tween",
                  duration: 0.35,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
              >
                {/* MOBILE HEADER */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/10
                    pb-4
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      gap-2
                      font-serif
                      text-2xl
                      font-bold
                      text-white
                    "
                  >
                    <img
                      src={SiteIcon}
                      alt="ComfyStay Logo"
                      className="h-7 w-7 object-contain"
                    />

                    ComfyStay
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="
                      rounded-full
                      border
                      border-white/15
                      bg-white/5
                      p-2
                      text-white
                      hover:bg-white/10
                      hover:text-amber-400
                    "
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* MOBILE NAV */}

                <nav
                  aria-label="Mobile primary"
                  className="
                    mt-4
                    flex-1
                    overflow-y-auto
                  "
                >
                  <ul className="flex flex-col space-y-2.5">
                    {NAV_LINKS.map(
                      (link) => (
                        <li key={link.path}>
                          <button
                            type="button"
                            onClick={() =>
                              goTo(
                                link.path
                              )
                            }
                            className={`
                              w-full
                              rounded-2xl
                              px-5
                              py-3
                              text-left
                              text-[15px]
                              font-medium
                              transition-all
                              ${
                                location.pathname ===
                                link.path
                                  ? "border border-amber-500/50 bg-amber-500/20 text-amber-300"
                                  : "border border-white/10 bg-white/5 text-white hover:border-amber-400/50 hover:bg-white/10"
                              }
                            `}
                          >
                            {link.label}
                          </button>
                        </li>
                      )
                    )}

                    {/* BOOK ROOMS — same destination as the Book Now button */}

                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          goTo("/rooms")
                        }
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-2xl
                          px-5
                          py-3
                          text-left
                          text-[15px]
                          font-semibold
                          transition-all
                          ${
                            location.pathname.startsWith("/rooms")
                              ? "border border-amber-400/70 bg-amber-500/30 text-amber-200"
                              : "border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                          }
                        `}
                      >
                        Book Rooms

                        <FiCalendar className="h-5 w-5" />
                      </button>
                    </li>
                  </ul>
                </nav>

                {/* =================================================
                    MOBILE AUTH
                ================================================= */}

                <div
                  className="
                    space-y-3
                    border-t
                    border-white/10
                    pt-4
                  "
                >
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          border
                          border-white/15
                          bg-white/5
                          p-4
                          text-white
                        "
                      >
                        <div>
                          <p className="font-bold">
                            {user?.firstMiddleName ||
                              user?.email}
                          </p>

                          <p
                            className="
                              text-[11px]
                              font-semibold
                              uppercase
                              tracking-wide
                              text-amber-400
                            "
                          >
                            {userType}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            goTo("/rooms")
                          }
                          className="
                            rounded-full
                            bg-gradient-to-r
                            from-amber-500
                            to-amber-600
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-white
                          "
                        >
                          Book Now
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          goTo(getDashboardRoute(userType))
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-2xl
                          border
                          border-white/15
                          bg-white/10
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          hover:bg-white/20
                          hover:text-amber-400
                        "
                      >
                        <FiGrid className="h-4 w-4" />
                        Dashboard
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-2xl
                          bg-red-600/80
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          hover:bg-red-500
                        "
                      >
                        <FiLogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">

                      {/* LOGIN */}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          openLoginModal();
                        }}
                        className="
                          rounded-2xl
                          border
                          border-white/15
                          bg-white/5
                          py-3.5
                          text-sm
                          font-medium
                          text-white
                          transition-colors
                          hover:border-amber-400/50
                          hover:bg-white/10
                          hover:text-amber-400
                        "
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FiUser className="h-4 w-4" />
                          Login
                        </span>
                      </button>

                      {/* SIGN UP */}

                      <button
                        type="button"
                        onClick={() =>
                          goTo(
                            "/user/auth/register"
                          )
                        }
                        className="
                          rounded-2xl
                          bg-gradient-to-r
                          from-amber-500
                          to-amber-600
                          py-3.5
                          text-[15px]
                          font-semibold
                          text-white
                          shadow-lg
                        "
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* =====================================================
          UNIFIED LOGIN MODAL
      ===================================================== */}

      <UnifiedLoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
      />
    </>
  );
};

export default Navbar;