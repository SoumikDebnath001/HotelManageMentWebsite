import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPublicHotels, getHotelFilterOptions } from "../../Services/booking.service";
import { addToWishlist, getMyWishlist, removeFromWishlist } from "../../Services/user.service";
import { FiMapPin, FiStar, FiSearch, FiHeart, FiX, FiSliders, FiChevronDown, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";

/* =========================================================
   CONSTANTS
========================================================= */

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest Rated" },
  { value: "likes", label: "Most Liked" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
  { value: 5, label: "5" },
];

const DEFAULT_FILTERS = {
  search: "",
  city: "",
  minRating: 0,
  amenities: [],
  roomType: "",
  availableOnly: false,
  checkIn: "",
  checkOut: "",
  sortBy: "recommended",
};

const todayISO = () => new Date().toISOString().split("T")[0];

const nextDayISO = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return todayISO();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

/* =========================================================
   URL <-> FILTER HELPERS
========================================================= */

const filtersFromParams = (params) => {
  const filterParam = params.get("filter") || "";
  const minRatingParam = parseFloat(params.get("minRating"));

  return {
    search: params.get("search") || "",
    city: params.get("city") || "",
    minRating: !isNaN(minRatingParam) ? minRatingParam : filterParam === "top-offers" ? 4 : 0,
    amenities: (params.get("amenities") || "").split(",").map((a) => a.trim()).filter(Boolean),
    roomType: params.get("roomType") || "",
    availableOnly: params.get("availableOnly") === "true",
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    sortBy: params.get("sortBy") || "recommended",
  };
};

const paramsFromFilters = (filters, filterParam = "") => {
  const params = {};

  if (filterParam) params.filter = filterParam;
  if (filters.search) params.search = filters.search;
  if (filters.city) params.city = filters.city;
  // "top-offers" defaults the rating to 4, so once the user changes it we always write it explicitly
  if (filters.minRating > 0 || filterParam) params.minRating = String(filters.minRating);
  if (filters.amenities.length > 0) params.amenities = filters.amenities.join(",");
  if (filters.roomType) params.roomType = filters.roomType;
  if (filters.availableOnly) params.availableOnly = "true";
  if (filters.checkIn) params.checkIn = filters.checkIn;
  if (filters.checkOut) params.checkOut = filters.checkOut;
  if (filters.sortBy && filters.sortBy !== "recommended") params.sortBy = filters.sortBy;

  return params;
};

// Only send a date range to the API when both dates are valid and in order
const apiParamsFromFilters = (filters) => {
  const params = paramsFromFilters(filters);
  delete params.filter;

  const hasRange = filters.checkIn && filters.checkOut && filters.checkOut > filters.checkIn;
  if (!hasRange) {
    delete params.checkIn;
    delete params.checkOut;
  }

  return params;
};

const countActiveFilters = (filters) => {
  let count = 0;
  if (filters.city) count += 1;
  if (filters.minRating > 0) count += 1;
  if (filters.amenities.length > 0) count += 1;
  if (filters.roomType) count += 1;
  if (filters.availableOnly) count += 1;
  if (filters.checkIn && filters.checkOut) count += 1;
  return count;
};

/* =========================================================
   SMALL UI PIECES
========================================================= */

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 py-3 text-sm text-white placeholder:text-stone-500 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20";

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
      active
        ? "border-amber-500/60 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
        : "border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const SelectField = ({ value, onChange, children, icon: Icon = FiChevronDown, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={onChange}
      className={`${inputClass} cursor-pointer appearance-none pl-4 pr-10 [&>option]:bg-stone-900`}
    >
      {children}
    </select>
    <Icon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
  </div>
);

const SkeletonCard = () => (
  <div className="h-[270px] animate-pulse rounded-2xl border border-white/5 bg-stone-900/70" />
);

/* =========================================================
   HOTEL CARD
========================================================= */

const HotelCard = ({ hotel, rank, liked, liking, onToggleLike, onOpen }) => {
  const cover = hotel.image && hotel.image.length > 0 ? hotel.image[0] : null;
  const hasReviews = hotel.totalReviews > 0;
  const rating = hasReviews ? hotel.averageRating : hotel.starRating;
  const hasPrice = typeof hotel.startingPrice === "number";

  const location =
    [hotel.cityName, hotel.stateName || hotel.countryName].filter(Boolean).join(", ") ||
    hotel.address ||
    "Location unavailable";

  return (
    <article
      onClick={onOpen}
      className="group relative h-[270px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-stone-900 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-[0_18px_50px_rgba(245,158,11,0.12)]"
    >
      {/* Cover */}
      {cover ? (
        <img
          src={cover}
          alt={hotel.hotelName}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 via-stone-900 to-black">
          <span className="font-serif text-7xl font-bold text-white/10">{hotel.hotelName?.charAt(0)}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />

      {/* Rank */}
      <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-lg">
        {rank}
      </div>

      {/* Like + count */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike();
        }}
        disabled={liking}
        title={liked ? "Remove from Liked Hotels" : "Add to Liked Hotels"}
        className={`absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 ${
          liked
            ? "border-red-500/40 bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "border-white/20 bg-black/45 text-white/85 hover:border-white/40 hover:bg-black/65 hover:text-white"
        } ${liking ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <FiHeart className={`h-4 w-4 transition-transform ${liked ? "scale-110 fill-red-500 text-red-500" : ""}`} />
        {hotel.likeCount ?? 0}
      </button>

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="truncate text-xl font-bold text-white drop-shadow-md transition-colors group-hover:text-amber-200">
          {hotel.hotelName}
        </h3>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-stone-300">
            <FiMapPin className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="truncate">{location}</span>
          </p>

          <span
            className={`shrink-0 text-[11px] font-medium ${
              hotel.availableRooms > 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {hotel.availableRooms > 0
              ? `${hotel.availableRooms} room${hotel.availableRooms > 1 ? "s" : ""} available`
              : "Fully booked"}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <p className="flex items-baseline gap-1.5 text-white">
            {hasPrice ? (
              <>
                <span className="text-2xl font-bold">₹{Number(hotel.startingPrice).toLocaleString("en-IN")}</span>
                <span className="text-sm text-stone-400">/ night</span>
              </>
            ) : (
              <span className="text-sm font-medium text-stone-400">Rates on request</span>
            )}
          </p>

          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
              <FiStar className="h-4 w-4 fill-amber-400 text-amber-400" />
              {rating || "New"}
            </span>
            <span className="text-[10px] text-stone-400">
              {hasReviews ? `${hotel.totalReviews} review${hotel.totalReviews > 1 ? "s" : ""}` : hotel.starRating ? `${hotel.starRating}-star hotel` : "No reviews yet"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* =========================================================
   HOTEL DISCOVERY
========================================================= */

const HotelDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") || "";

  /*
    The URL query string is the single source of truth for filters,
    so links are shareable and back / forward navigation just works.
  */

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  // flushSync keeps the controlled inputs in step with the URL so fast typing never drops characters
  const setFilters = useCallback(
    (updater) => {
      setSearchParams(
        (prev) => {
          const current = filtersFromParams(prev);
          const next = typeof updater === "function" ? updater(current) : updater;
          return paramsFromFilters(next, prev.get("filter") || "");
        },
        { replace: true, flushSync: true }
      );
    },
    [setSearchParams]
  );

  /*
    The search box keeps its own text so typing is never throttled by
    router updates. "pushed" is the last value written to the URL, which
    lets us tell an external URL change (back / reset) from our own push.
  */

  const [searchState, setSearchState] = useState({ text: filters.search, pushed: filters.search });

  if (filters.search !== searchState.pushed) {
    setSearchState({ text: filters.search, pushed: filters.search });
  }

  useEffect(() => {
    if (searchState.text === searchState.pushed) return;

    const timer = setTimeout(() => {
      setSearchState((prev) => ({ ...prev, pushed: prev.text }));
      setFilters((prev) => ({ ...prev, search: searchState.text }));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchState, setFilters]);

  const [filterOptions, setFilterOptions] = useState({ cities: [], amenities: [], roomTypes: [] });
  const [isFilterOpen, setIsFilterOpen] = useState(() => countActiveFilters(filtersFromParams(searchParams)) > 0);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wishlist: { hotelId: wishlistDocId }
  const [likedMap, setLikedMap] = useState({});
  const [likingInProgress, setLikingInProgress] = useState({});
  const { isAuthenticated, userType } = useSelector((state) => state.auth) || {};

  const requestIdRef = useRef(0);

  /* ------------------------------------------------------
     Filter options (once)
  ------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await getHotelFilterOptions();
      if (cancelled) return;

      if (data?.status && data?.data) {
        setFilterOptions({
          cities: data.data.cities || [],
          amenities: data.data.amenities || [],
          roomTypes: data.data.roomTypes || [],
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------
     Wishlist (re-fetched when the user logs in / out)
  ------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isAuthenticated || userType !== "User") {
        setLikedMap({});
        return;
      }

      const { data } = await getMyWishlist(1, 200);
      if (cancelled) return;

      if (data?.status && Array.isArray(data?.data)) {
        const map = {};
        data.data.forEach((item) => {
          map[String(item.hotelId)] = item._id;
        });
        setLikedMap(map);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userType]);

  /* ------------------------------------------------------
     Hotels (debounced, ignores stale responses)
  ------------------------------------------------------ */

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      setLoading(true);

      const { data, error } = await getPublicHotels(apiParamsFromFilters(filters));

      if (requestId !== requestIdRef.current) return;

      if (error) {
        toast.error(error);
        setHotels([]);
      } else if (data?.status) {
        setHotels(data.data || []);
      } else {
        toast.error(data?.message || "Failed to fetch hotels.");
        setHotels([]);
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  /* ------------------------------------------------------
     Filter handlers
  ------------------------------------------------------ */

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleCheckInChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      checkIn: value,
      checkOut: prev.checkOut && value && prev.checkOut <= value ? nextDayISO(value) : prev.checkOut,
    }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, search: prev.search, sortBy: prev.sortBy }));
  };

  const clearAll = () => {
    setSearchParams({}, { replace: true, flushSync: true });
  };

  /* ------------------------------------------------------
     Wishlist toggle (optimistic like count)
  ------------------------------------------------------ */

  const bumpLikeCount = (hotelId, delta) => {
    setHotels((prev) =>
      prev.map((hotel) =>
        hotel._id === hotelId ? { ...hotel, likeCount: Math.max(0, (hotel.likeCount || 0) + delta) } : hotel
      )
    );
  };

  const handleToggleLike = async (hotelId) => {
    if (!isAuthenticated || userType !== "User") {
      toast.error("Please login to like hotels.");
      return;
    }
    if (likingInProgress[hotelId]) return;

    setLikingInProgress((prev) => ({ ...prev, [hotelId]: true }));

    if (likedMap[hotelId]) {
      const { data, error } = await removeFromWishlist({ wishlistId: likedMap[hotelId] });
      if (!error && data?.status) {
        setLikedMap((prev) => {
          const copy = { ...prev };
          delete copy[hotelId];
          return copy;
        });
        bumpLikeCount(hotelId, -1);
        toast.success("Removed from liked hotels");
      } else {
        toast.error(error || data?.message || "Failed to update liked hotels");
      }
    } else {
      const { data, error } = await addToWishlist({ hotelId });
      if (!error && data?.status) {
        setLikedMap((prev) => ({ ...prev, [hotelId]: data.data._id }));
        bumpLikeCount(hotelId, 1);
        toast.success("Added to liked hotels ❤️");
      } else {
        toast.error(error || data?.message || "Failed to like hotel");
      }
    }

    setLikingInProgress((prev) => ({ ...prev, [hotelId]: false }));
  };

  /* ------------------------------------------------------
     Derived
  ------------------------------------------------------ */

  const activeFilterCount = countActiveFilters(filters);
  const hasDateRange = filters.checkIn && filters.checkOut && filters.checkOut > filters.checkIn;
  const isTopOffers = filterParam === "top-offers";

  const activeChips = [];
  if (filters.city) activeChips.push({ key: "city", label: filters.city, clear: () => updateFilter("city", "") });
  if (filters.minRating > 0) activeChips.push({ key: "rating", label: `${filters.minRating}+ rating`, clear: () => updateFilter("minRating", 0) });
  filters.amenities.forEach((amenity) =>
    activeChips.push({ key: `amenity-${amenity}`, label: amenity, clear: () => toggleAmenity(amenity) })
  );
  if (filters.roomType) activeChips.push({ key: "roomType", label: `${filters.roomType} room`, clear: () => updateFilter("roomType", "") });
  if (hasDateRange) activeChips.push({ key: "dates", label: `${filters.checkIn} → ${filters.checkOut}`, clear: () => setFilters((prev) => ({ ...prev, checkIn: "", checkOut: "" })) });
  else if (filters.availableOnly) activeChips.push({ key: "available", label: "Available rooms only", clear: () => updateFilter("availableOnly", false) });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 relative space-y-8">

      {/* Title */}
      <div className="text-center md:mt-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400">
          {isTopOffers ? "Exclusive deals" : "Hotel discovery"}
        </p>
        <h1 className="mb-2 font-serif text-3xl font-bold text-white md:text-4xl">
          {isTopOffers ? "Top Offers Available" : "Discover Extraordinary Stays"}
        </h1>
        <p className="text-sm text-stone-400 md:text-base">
          {isTopOffers
            ? "Showing the best deals with 4+ ratings."
            : "Browse by city, rating, amenities and room availability."}
        </p>
      </div>

      {/* Filter bar */}
      <div className="relative z-20 rounded-2xl border border-white/10 bg-stone-900/70 p-4 shadow-2xl backdrop-blur-xl sm:p-5">

        {/* Row 1: search / city / sort / toggle */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchState.text}
              onChange={(e) => setSearchState((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Search by hotel, city, address or amenity..."
              className={`${inputClass} pl-12 pr-10`}
            />
            {searchState.text && (
              <button
                type="button"
                onClick={() => setSearchState((prev) => ({ ...prev, text: "" }))}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-500 hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          <SelectField
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
            icon={FiMapPin}
            className="lg:w-56"
          >
            <option value="">All cities</option>
            {filterOptions.cities.map((city) => (
              <option key={city.cityName} value={city.cityName}>
                {city.cityName}
                {city.stateName ? `, ${city.stateName}` : ""} ({city.hotelCount})
              </option>
            ))}
          </SelectField>

          <SelectField
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="lg:w-52"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`relative flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-all ${
              isFilterOpen || activeFilterCount > 0
                ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                : "border-white/10 bg-black/40 text-stone-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FiSliders className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: expandable filters */}
        {isFilterOpen && (
          <div className="mt-5 grid gap-6 border-t border-white/10 pt-5 lg:grid-cols-2">

            {/* Rating */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Minimum rating</p>
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    active={filters.minRating === option.value}
                    onClick={() => updateFilter("minRating", option.value)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {option.value > 0 && <FiStar className="h-3 w-3 fill-current" />}
                      {option.label}
                    </span>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Room availability</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="date"
                    value={filters.checkIn}
                    min={todayISO()}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    aria-label="Check-in date"
                    className={`${inputClass} pl-10 pr-3 [color-scheme:dark]`}
                  />
                </div>
                <div className="relative flex-1">
                  <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="date"
                    value={filters.checkOut}
                    min={filters.checkIn ? nextDayISO(filters.checkIn) : nextDayISO(todayISO())}
                    onChange={(e) => updateFilter("checkOut", e.target.value)}
                    aria-label="Check-out date"
                    className={`${inputClass} pl-10 pr-3 [color-scheme:dark]`}
                  />
                </div>
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 text-sm text-stone-300">
                <input
                  type="checkbox"
                  checked={filters.availableOnly || Boolean(hasDateRange)}
                  disabled={Boolean(hasDateRange)}
                  onChange={(e) => updateFilter("availableOnly", e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-black/40 accent-amber-500"
                />
                Only show hotels with available rooms
                {hasDateRange && <span className="text-xs text-stone-500">(for selected dates)</span>}
              </label>
            </div>

            {/* Amenities */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Amenities</p>
              {filterOptions.amenities.length === 0 ? (
                <p className="text-xs text-stone-500">No amenities listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filterOptions.amenities.map((amenity) => (
                    <Chip key={amenity} active={filters.amenities.includes(amenity)} onClick={() => toggleAmenity(amenity)}>
                      {amenity}
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            {/* Room type */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Room type</p>
              {filterOptions.roomTypes.length === 0 ? (
                <p className="text-xs text-stone-500">No room types listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Chip active={filters.roomType === ""} onClick={() => updateFilter("roomType", "")}>
                    Any
                  </Chip>
                  {filterOptions.roomTypes.map((roomType) => (
                    <Chip key={roomType} active={filters.roomType === roomType} onClick={() => updateFilter("roomType", roomType)}>
                      <span className="capitalize">{roomType}</span>
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Result summary + active chips */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm text-stone-400">
          {loading ? "Searching..." : `${hotels.length} hotel${hotels.length === 1 ? "" : "s"} found`}
          {filters.search && !loading && (
            <>
              {" "}for <span className="font-semibold text-white">"{filters.search}"</span>
            </>
          )}
        </p>

        {activeChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.clear}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            {chip.label}
            <FiX className="h-3 w-3" />
          </button>
        ))}

        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-white hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <p className="text-lg text-stone-400">No hotels found matching your criteria.</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            Reset search & filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel, index) => (
            <HotelCard
              key={hotel._id}
              hotel={hotel}
              rank={index + 1}
              liked={Boolean(likedMap[hotel._id])}
              liking={Boolean(likingInProgress[hotel._id])}
              onToggleLike={() => handleToggleLike(hotel._id)}
              onOpen={() => navigate(`/rooms/${hotel._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelDiscovery;
