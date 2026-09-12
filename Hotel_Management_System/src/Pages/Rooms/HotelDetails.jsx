import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPublicHotelById, getPublicRoomsByHotelId } from "../../Services/booking.service";
import {
  getReviewsByHotelId,
  addReview,
  updateReview,
  deleteReview,
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../../Services/user.service";
import AvailabilityCheckModal from "./AvailabilityCheckModal";
import ConfirmButton from "../../Components/Common/ConfirmButton";
import { formatMoney, formatDate } from "../../Utils/bookingHelpers";
import {
  FiMapPin,
  FiStar,
  FiArrowLeft,
  FiCheck,
  FiUsers,
  FiHeart,
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiShare2,
  FiImage,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiMail,
  FiClock,
  FiGrid,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

/* =========================================================
   CONSTANTS
========================================================= */

const REVIEWS_PAGE_SIZE = 5;
const AMENITIES_PREVIEW = 8;
const DESCRIPTION_PREVIEW = 280;

const SECTION_TABS = [
  { id: "overview", label: "Overview" },
  { id: "amenities", label: "Amenities" },
  { id: "rooms", label: "Rooms" },
  { id: "reviews", label: "Reviews" },
];

const DEFAULT_ROOM_FILTERS = { guests: "", maxPrice: "", roomType: "", availableOnly: true, sortBy: "price_low" };

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* =========================================================
   STARS
========================================================= */

const Stars = ({ value, size = "h-4 w-4", interactive = false, onChange }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange(star)}
        className={interactive ? "cursor-pointer p-0.5 transition-transform hover:scale-110" : "cursor-default"}
        aria-label={`${star} star${star === 1 ? "" : "s"}`}
      >
        <FiStar className={`${size} ${star <= value ? "fill-amber-400 text-amber-400" : "text-stone-600"}`} />
      </button>
    ))}
  </div>
);

/* =========================================================
   LOADING SKELETON
========================================================= */

const DetailsSkeleton = () => (
  <div className="animate-pulse space-y-6 pb-20">
    <div className="h-4 w-40 rounded bg-white/10" />
    <div className="h-60 rounded-3xl bg-white/5 sm:h-[440px]" />
    <div className="space-y-3">
      <div className="h-9 w-2/3 rounded bg-white/10" />
      <div className="h-4 w-1/3 rounded bg-white/10" />
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-5/6 rounded bg-white/5" />
        <div className="h-4 w-4/6 rounded bg-white/5" />
      </div>
      <div className="h-56 rounded-3xl bg-white/5" />
    </div>
  </div>
);

/* =========================================================
   PHOTO LIGHTBOX
========================================================= */

const Lightbox = ({ images, index, onClose, onChange, title }) => {
  const count = images.length;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % count);
      if (e.key === "ArrowLeft") onChange((index - 1 + count) % count);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [index, count, onClose, onChange]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <p className="text-sm text-stone-300">
          <span className="font-semibold text-white">{index + 1}</span> / {count}
        </p>
        <button onClick={onClose} aria-label="Close photos" className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white hover:bg-white/15">
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 pb-4 sm:px-16">
        <img src={images[index]} alt={`${title} photo ${index + 1}`} className="max-h-full max-w-full rounded-xl object-contain" />

        {count > 1 && (
          <>
            <button
              onClick={() => onChange((index - 1 + count) % count)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white hover:bg-black/80 sm:left-6"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onChange((index + 1) % count)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white hover:bg-black/80 sm:right-6"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-6">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => onChange(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === index ? "border-amber-500" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   GALLERY
   Phone: swipeable carousel. Desktop: photo mosaic.
========================================================= */

const Gallery = ({ images, title, onOpen }) => {
  const [slide, setSlide] = useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="relative flex h-52 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-800 via-stone-900 to-black sm:h-72">
        <span className="font-serif text-8xl font-bold text-white/5">{title?.charAt(0)}</span>
        <p className="absolute bottom-5 flex items-center gap-2 text-xs text-stone-500">
          <FiImage className="h-4 w-4" /> Photos coming soon
        </p>
      </div>
    );
  }

  // Desktop mosaic: first photo large, up to 4 on the side
  const side = images.slice(1, 5);
  const extra = count - 5;

  return (
    <>
      {/* PHONE CAROUSEL */}
      <div className="relative sm:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl [scrollbar-width:none]"
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <button key={img + i} onClick={() => onOpen(i)} className="aspect-[4/3] w-full shrink-0 snap-center" aria-label={`Open photo ${i + 1}`}>
              <img src={img} alt={`${title} photo ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {count > 1 && (
          <>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {slide + 1} / {count}
            </span>
            <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* DESKTOP MOSAIC */}
      <div className={`relative hidden h-[420px] gap-2 overflow-hidden rounded-3xl sm:grid lg:h-[460px] ${side.length === 0 ? "grid-cols-1" : "grid-cols-4 grid-rows-2"}`}>
        <button onClick={() => onOpen(0)} className={`group relative overflow-hidden ${side.length === 0 ? "" : "col-span-2 row-span-2"}`} aria-label="Open cover photo">
          <img src={images[0]} alt={`${title} cover`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        </button>

        {side.map((img, i) => {
          // Spread 1–4 side photos across the 2x2 area
          const span =
            side.length === 1 ? "col-span-2 row-span-2" :
            side.length === 2 ? "col-span-2" :
            side.length === 3 && i === 0 ? "col-span-2" : "";
          const isLast = i === side.length - 1;
          return (
            <button key={img + i} onClick={() => onOpen(i + 1)} className={`group relative overflow-hidden ${span}`} aria-label={`Open photo ${i + 2}`}>
              <img src={img} alt={`${title} photo ${i + 2}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
              {isLast && extra > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">+{extra} more</span>
              )}
            </button>
          );
        })}

        {count > 1 && (
          <button
            onClick={() => onOpen(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            <FiGrid className="h-4 w-4" /> Show all {count} photos
          </button>
        )}
      </div>
    </>
  );
};

/* =========================================================
   ROOM CARD
========================================================= */

const statusStyles = {
  available: { label: "Available", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  booked: { label: "Occupied now", className: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  maintenance: { label: "Under maintenance", className: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
};

const RoomCard = ({ room, onSelect }) => {
  const capacity = (room.maxAdults || 2) + (room.maxChildren || 0);
  const available = room.availabilityStatus === "available";
  const status = statusStyles[room.availabilityStatus] || statusStyles.available;
  const image = room.image && room.image.length > 0 ? room.image[0] : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-stone-900/60 transition-colors hover:border-amber-500/40 sm:flex-row">
      {image ? (
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-60">
          <img src={image} alt={`${room.roomType} room`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      ) : (
        <div className="flex h-14 shrink-0 items-center gap-3 bg-gradient-to-br from-amber-500/15 via-stone-900 to-stone-900 px-5 sm:h-auto sm:w-44 sm:flex-col sm:justify-center sm:px-4">
          <span className="font-serif text-2xl font-bold capitalize text-amber-300/80 sm:text-4xl">{room.roomType?.charAt(0)}</span>
          <span className="text-[11px] uppercase tracking-wider text-stone-500">No photo yet</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-xl font-bold capitalize text-white">{room.roomType} room</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Room {room.roomNumber}
              {room.floor ? ` · Floor ${room.floor}` : ""}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-300">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
            <FiUsers className="h-3.5 w-3.5 text-amber-400" />
            Up to {capacity} guest{capacity === 1 ? "" : "s"}
          </span>
          {room.maxChildren > 0 && (
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              {room.maxAdults || 2} adults · {room.maxChildren} {room.maxChildren === 1 ? "child" : "children"}
            </span>
          )}
          {room.bedCount && (
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              {room.bedCount} bed{room.bedCount === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {room.amenities.slice(0, 5).map((amenity) => (
              <li key={amenity} className="inline-flex items-center gap-1.5 text-xs text-stone-300">
                <FiCheck className="h-3.5 w-3.5 text-emerald-400" /> {amenity}
              </li>
            ))}
            {room.amenities.length > 5 && <li className="text-xs text-stone-500">+{room.amenities.length - 5} more</li>}
          </ul>
        )}

        {room.description && <p className="mt-3 line-clamp-2 text-sm text-stone-400">{room.description}</p>}

        {/* Spacer keeps the price row at the bottom without touching short content */}
        <div className="flex-1" />

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-white">
            <span className="text-2xl font-bold">{formatMoney(room.pricePerNight)}</span>
            <span className="text-sm text-stone-400"> / night</span>
            <span className="block text-[11px] text-stone-500">Taxes included</span>
          </p>
          <button
            onClick={() => onSelect(room)}
            disabled={!available}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all sm:w-auto ${
              available
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:from-amber-400 hover:to-amber-500"
                : "cursor-not-allowed bg-stone-800 text-stone-500"
            }`}
          >
            {available ? (
              <>
                Check availability <FiArrowRight className="h-4 w-4" />
              </>
            ) : (
              "Not bookable right now"
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

/* =========================================================
   HOTEL DETAILS
========================================================= */

const HotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth) || {};
  const isCustomer = isAuthenticated && userType === "User";

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Likes
  const [wishlistId, setWishlistId] = useState(null);
  const [liking, setLiking] = useState(false);

  // Room filters (Step 4: budget, occupancy, facilities, availability)
  const [roomFilters, setRoomFilters] = useState(DEFAULT_ROOM_FILTERS);

  // Reviews (Step 12)
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, review: "" });
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  const tabsRef = useRef(null);

  /* ------------------------------------------------------
     Data
  ------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [hotelRes, roomsRes] = await Promise.all([getPublicHotelById(hotelId), getPublicRoomsByHotelId(hotelId)]);
      if (cancelled) return;

      if (hotelRes.data?.status) {
        setHotel(hotelRes.data.data);
      } else {
        toast.error(hotelRes.error || "Failed to load hotel details.");
        navigate("/rooms");
        return;
      }

      if (roomsRes.data?.status) setRooms(roomsRes.data.data || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hotelId, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReviewsLoading(true);
      const { data } = await getReviewsByHotelId(hotelId, reviewPage, REVIEWS_PAGE_SIZE);
      if (cancelled) return;
      if (data?.status) {
        const list = data.data?.reviews || [];
        setReviews((prev) => (reviewPage === 1 ? list : [...prev, ...list]));
        setReviewSummary({ averageRating: data.data?.averageRating || 0, totalReviews: data.data?.totalReviews || 0 });
        setReviewTotalPages(data.pagination?.totalPages || 0);
      }
      setReviewsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hotelId, reviewPage, reviewsKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isCustomer) {
        setWishlistId(null);
        return;
      }
      const { data } = await getMyWishlist(1, 200);
      if (cancelled || !data?.status) return;
      const match = (data.data || []).find((item) => String(item.hotelId) === String(hotelId));
      setWishlistId(match ? match._id : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [hotelId, isCustomer]);

  // Jump to a section when linked with a hash (e.g. "Write a review" from bookings)
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.slice(1);
      const timer = setTimeout(() => scrollToSection(id), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash]);

  // Highlight the tab of the section currently on screen
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveTab(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTION_TABS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // The last section can be too short to reach the middle band, so mark it at the page bottom
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActiveTab(SECTION_TABS[SECTION_TABS.length - 1].id);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  // Keep the active tab visible in the horizontally scrolling tab bar on phones
  useEffect(() => {
    const bar = tabsRef.current;
    const btn = bar?.querySelector(`[data-tab="${activeTab}"]`);
    if (bar && btn) {
      bar.scrollTo({ left: btn.offsetLeft - bar.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
    }
  }, [activeTab]);

  /* ------------------------------------------------------
     Derived
  ------------------------------------------------------ */

  const myReview = useMemo(() => (user?._id ? reviews.find((r) => String(r.userId) === String(user._id)) : null), [reviews, user]);

  const roomTypesAvailable = useMemo(() => [...new Set(rooms.map((r) => r.roomType))], [rooms]);

  const budgetOptions = useMemo(() => {
    const prices = [...new Set(rooms.map((r) => r.pricePerNight))].sort((a, b) => a - b);
    return prices.length > 1 ? prices : [];
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const guests = parseInt(roomFilters.guests) || 0;
    const maxPrice = parseFloat(roomFilters.maxPrice) || 0;
    const list = rooms.filter((room) => {
      const capacity = (room.maxAdults || 2) + (room.maxChildren || 0);
      if (guests && capacity < guests) return false;
      if (maxPrice && room.pricePerNight > maxPrice) return false;
      if (roomFilters.roomType && room.roomType !== roomFilters.roomType) return false;
      if (roomFilters.availableOnly && room.availabilityStatus !== "available") return false;
      return true;
    });
    return list.sort((a, b) => (roomFilters.sortBy === "price_high" ? b.pricePerNight - a.pricePerNight : a.pricePerNight - b.pricePerNight));
  }, [rooms, roomFilters]);

  const roomFiltersActive =
    roomFilters.guests || roomFilters.maxPrice || roomFilters.roomType || roomFilters.availableOnly !== DEFAULT_ROOM_FILTERS.availableOnly || roomFilters.sortBy !== DEFAULT_ROOM_FILTERS.sortBy;

  /* ------------------------------------------------------
     Actions
  ------------------------------------------------------ */

  const refreshReviews = () => {
    setReviewPage(1);
    setReviewsKey((k) => k + 1);
  };

  const handleToggleLike = async () => {
    if (!isCustomer) {
      toast.error("Please sign in to like hotels.");
      return;
    }
    if (liking) return;
    setLiking(true);
    if (wishlistId) {
      const { data, error } = await removeFromWishlist({ wishlistId });
      if (!error && data?.status) {
        setWishlistId(null);
        setHotel((h) => ({ ...h, likeCount: Math.max(0, (h.likeCount || 0) - 1) }));
        toast.success("Removed from liked hotels");
      } else {
        toast.error(error || data?.message || "Could not update liked hotels");
      }
    } else {
      const { data, error } = await addToWishlist({ hotelId });
      if (!error && data?.status) {
        setWishlistId(data.data?._id || null);
        setHotel((h) => ({ ...h, likeCount: (h.likeCount || 0) + 1 }));
        toast.success("Added to liked hotels");
      } else {
        toast.error(error || data?.message || "Could not like this hotel");
      }
    }
    setLiking(false);
  };

  const handleShare = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: hotel.hotelName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user dismissed the share sheet
    }
  };

  const openReviewForm = () => {
    if (!isCustomer) {
      toast.error("Please sign in as a guest to write a review.");
      navigate("/user/auth/login");
      return;
    }
    setReviewFormOpen(true);
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: review.rating, review: review.review || "" });
    setReviewFormOpen(true);
    setTimeout(() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const closeReviewForm = () => {
    setReviewFormOpen(false);
    setEditingReviewId(null);
    setReviewForm({ rating: 0, review: "" });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) {
      toast.error("Please select a star rating.");
      return;
    }
    setSavingReview(true);
    const { data, error } = editingReviewId
      ? await updateReview({ reviewId: editingReviewId, rating: reviewForm.rating, review: reviewForm.review })
      : await addReview({ hotelId, rating: reviewForm.rating, review: reviewForm.review });
    if (!error && data?.status) {
      toast.success(data.message || "Thanks for your review!");
      closeReviewForm();
      refreshReviews();
    } else {
      toast.error(error || data?.message || "Could not save your review");
    }
    setSavingReview(false);
  };

  const handleDeleteReview = async (review) => {
    const { data, error } = await deleteReview({ reviewId: review._id });
    if (!error && data?.status) {
      toast.success("Review deleted");
      if (editingReviewId === review._id) closeReviewForm();
      refreshReviews();
    } else {
      toast.error(error || data?.message || "Could not delete review");
    }
  };

  /* ------------------------------------------------------
     Render
  ------------------------------------------------------ */

  if (loading) return <DetailsSkeleton />;
  if (!hotel) return null;

  const images = hotel.image || [];
  const hasReviews = reviewSummary.totalReviews > 0;
  const rating = hasReviews ? reviewSummary.averageRating : null;
  const locationText = [hotel.address, hotel.cityName, hotel.stateName].filter(Boolean).join(", ") || "Location unavailable";
  const hotelAmenities = hotel.amenities || [];
  const roomOnlyAmenities = (hotel.allAmenities || []).filter((a) => !hotelAmenities.includes(a));
  const amenitiesToShow = showAllAmenities ? hotelAmenities : hotelAmenities.slice(0, AMENITIES_PREVIEW);
  const hasPrice = typeof hotel.startingPrice === "number";
  const description = hotel.description || "";
  const longDescription = description.length > DESCRIPTION_PREVIEW;
  const availableRooms = hotel.availableRooms ?? rooms.filter((r) => r.availabilityStatus === "available").length;
  const totalRooms = hotel.totalRooms ?? rooms.length;

  const selectClass = "rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none [&>option]:bg-stone-900";
  const sectionTitle = "font-serif text-2xl font-bold text-white sm:text-3xl";

  return (
    <div className="animate-in fade-in duration-500 pb-28 lg:pb-16">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-stone-400">
        <button onClick={() => navigate("/rooms")} className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> All hotels
        </button>
        {hotel.cityName && (
          <>
            <span className="text-stone-600">/</span>
            <button onClick={() => navigate(`/rooms?city=${encodeURIComponent(hotel.cityName)}`)} className="transition-colors hover:text-white">
              {hotel.cityName}
            </button>
          </>
        )}
        <span className="text-stone-600">/</span>
        <span className="truncate text-stone-300">{hotel.hotelName}</span>
      </nav>

      {/* GALLERY */}
      <Gallery images={images} title={hotel.hotelName} onOpen={setLightboxIndex} />

      {/* TITLE ROW */}
      <header className="mt-5 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {hotel.starRating ? (
            <div className="mb-2 flex items-center gap-2">
              <Stars value={parseInt(hotel.starRating) || 0} size="h-3.5 w-3.5" />
              <span className="text-xs text-stone-400">{hotel.starRating}-star hotel</span>
            </div>
          ) : null}
          <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{hotel.hotelName}</h1>
          <p className="mt-2 flex items-start gap-2 text-sm text-stone-300 sm:text-base">
            <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>{locationText}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <button onClick={() => scrollToSection("reviews")} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:border-amber-500/40">
              <FiStar className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{hasReviews ? rating : "New"}</span>
              <span className="text-stone-400">· {hasReviews ? `${reviewSummary.totalReviews} review${reviewSummary.totalReviews === 1 ? "" : "s"}` : "No reviews yet"}</span>
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-stone-300">
              <FiHeart className="h-4 w-4 fill-red-400 text-red-400" /> {hotel.likeCount || 0} like{hotel.likeCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleToggleLike}
            disabled={liking}
            aria-pressed={Boolean(wishlistId)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none disabled:opacity-60 ${
              wishlistId ? "border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25" : "border-white/15 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <FiHeart className={`h-4 w-4 ${wishlistId ? "fill-red-500 text-red-500" : ""}`} />
            {wishlistId ? "Liked" : "Like"}
          </button>
          <button onClick={handleShare} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 sm:flex-none">
            <FiShare2 className="h-4 w-4" /> Share
          </button>
        </div>
      </header>

      {/* SECTION TABS */}
      <div className="sticky top-0 z-30 -mx-4 mt-6 border-b border-white/10 bg-stone-950/85 px-4 backdrop-blur-xl sm:-mx-10 sm:px-10">
        <div ref={tabsRef} className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`relative shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab.id ? "text-amber-300" : "text-stone-400 hover:text-white"}`}
            >
              {tab.label}
              {tab.id === "rooms" && rooms.length > 0 && <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-stone-300">{rooms.length}</span>}
              {tab.id === "reviews" && hasReviews && <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-stone-300">{reviewSummary.totalReviews}</span>}
              <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-colors ${activeTab === tab.id ? "bg-amber-400" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* ================= MAIN COLUMN ================= */}
        <div className="min-w-0 space-y-12 lg:col-span-2">
          {/* OVERVIEW */}
          <section id="overview" className="scroll-mt-20">
            <h2 className={sectionTitle}>About this hotel</h2>
            {description ? (
              <>
                <p className={`mt-4 whitespace-pre-line text-sm leading-7 text-stone-300 sm:text-base ${longDescription && !showFullDescription ? "line-clamp-4" : ""}`}>{description}</p>
                {longDescription && (
                  <button onClick={() => setShowFullDescription((v) => !v)} className="mt-2 text-sm font-semibold text-amber-400 hover:underline">
                    {showFullDescription ? "Show less" : "Read more"}
                  </button>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-stone-500">The hotel hasn't added a description yet.</p>
            )}

            {/* Key facts */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"><FiClock className="h-3.5 w-3.5" /> Check-in</p>
                <p className="mt-1 font-semibold text-white">From 2:00 PM</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"><FiClock className="h-3.5 w-3.5" /> Check-out</p>
                <p className="mt-1 font-semibold text-white">Until 11:00 AM</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Rooms</p>
                <p className="mt-1 font-semibold text-white">{availableRooms} of {totalRooms} available</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Room types</p>
                <p className="mt-1 truncate font-semibold capitalize text-white">{roomTypesAvailable.length ? roomTypesAvailable.join(", ") : "—"}</p>
              </div>
            </div>
          </section>

          {/* AMENITIES */}
          <section id="amenities" className="scroll-mt-20">
            <h2 className={sectionTitle}>What this place offers</h2>
            {hotelAmenities.length > 0 ? (
              <>
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {amenitiesToShow.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-stone-200">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                        <FiCheck className="h-4 w-4" />
                      </span>
                      {amenity}
                    </li>
                  ))}
                </ul>
                {hotelAmenities.length > AMENITIES_PREVIEW && (
                  <button onClick={() => setShowAllAmenities((v) => !v)} className="mt-4 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
                    {showAllAmenities ? "Show fewer" : `Show all ${hotelAmenities.length} amenities`}
                  </button>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-stone-500">The hotel hasn't listed hotel-wide amenities yet.</p>
            )}

            {roomOnlyAmenities.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Available in selected rooms</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roomOnlyAmenities.map((amenity) => (
                    <span key={amenity} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-300">{amenity}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ROOMS */}
          <section id="rooms" className="scroll-mt-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className={sectionTitle}>Choose your room</h2>
                <p className="mt-1 text-sm text-stone-400">
                  {filteredRooms.length} of {rooms.length} room{rooms.length === 1 ? "" : "s"} shown
                </p>
              </div>
              {roomFiltersActive && (
                <button onClick={() => setRoomFilters(DEFAULT_ROOM_FILTERS)} className="shrink-0 text-sm font-medium text-amber-400 hover:underline">
                  Reset filters
                </button>
              )}
            </div>

            {rooms.length > 0 && (
              <div className="mt-5 space-y-3">
                {/* Type chips */}
                {roomTypesAvailable.length > 1 && (
                  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                    {["", ...roomTypesAvailable].map((type) => {
                      const active = roomFilters.roomType === type;
                      const prices = rooms.filter((r) => !type || r.roomType === type).map((r) => r.pricePerNight);
                      return (
                        <button
                          key={type || "all"}
                          onClick={() => setRoomFilters((f) => ({ ...f, roomType: type }))}
                          className={`shrink-0 rounded-xl border px-4 py-2 text-left transition-colors ${active ? "border-amber-500/60 bg-amber-500/15" : "border-white/10 bg-white/5 hover:border-white/25"}`}
                        >
                          <p className={`text-sm font-semibold capitalize ${active ? "text-amber-200" : "text-white"}`}>{type || "All rooms"}</p>
                          <p className="text-[11px] text-stone-400">from {formatMoney(Math.min(...prices))}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                  <select aria-label="Guests" value={roomFilters.guests} onChange={(e) => setRoomFilters((f) => ({ ...f, guests: e.target.value }))} className={selectClass}>
                    <option value="">Any guests</option>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n}+ guest{n === 1 ? "" : "s"}</option>
                    ))}
                  </select>
                  {budgetOptions.length > 0 && (
                    <select aria-label="Budget" value={roomFilters.maxPrice} onChange={(e) => setRoomFilters((f) => ({ ...f, maxPrice: e.target.value }))} className={selectClass}>
                      <option value="">Any budget</option>
                      {budgetOptions.map((price) => (
                        <option key={price} value={price}>Up to {formatMoney(price)}</option>
                      ))}
                    </select>
                  )}
                  <select aria-label="Sort rooms" value={roomFilters.sortBy} onChange={(e) => setRoomFilters((f) => ({ ...f, sortBy: e.target.value }))} className={selectClass}>
                    <option value="price_low">Price: low to high</option>
                    <option value="price_high">Price: high to low</option>
                  </select>
                  <label className={`${budgetOptions.length > 0 ? "col-span-1" : "col-span-2"} inline-flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-stone-300 sm:col-span-1 sm:justify-start`}>
                    <span className="whitespace-nowrap">Available only</span>
                    <input
                      type="checkbox"
                      checked={roomFilters.availableOnly}
                      onChange={(e) => setRoomFilters((f) => ({ ...f, availableOnly: e.target.checked }))}
                      className="peer sr-only"
                    />
                    <span className="relative h-5 w-9 rounded-full bg-stone-700 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-amber-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/50" />
                  </label>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-5">
              {rooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 py-14 text-center">
                  <p className="text-stone-400">This hotel hasn't listed any rooms yet.</p>
                  <button onClick={() => navigate("/rooms")} className="mt-4 text-sm font-semibold text-amber-400 hover:underline">Browse other hotels</button>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 py-14 text-center">
                  <p className="text-stone-400">No rooms match these filters.</p>
                  <button onClick={() => setRoomFilters({ ...DEFAULT_ROOM_FILTERS, availableOnly: false })} className="mt-4 text-sm font-semibold text-amber-400 hover:underline">Show all rooms</button>
                </div>
              ) : (
                filteredRooms.map((room) => <RoomCard key={room._id} room={room} onSelect={setSelectedRoom} />)
              )}
            </div>
          </section>

          {/* REVIEWS */}
          <section id="reviews" className="scroll-mt-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={`${sectionTitle} flex items-center gap-3`}><FiMessageSquare className="h-6 w-6 text-amber-400" /> Guest reviews</h2>
                <p className="mt-1 text-sm text-stone-400">From guests who completed a stay here.</p>
              </div>
              {!reviewFormOpen && !myReview && (
                <button onClick={openReviewForm} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/20">
                  <FiEdit2 className="h-4 w-4" /> {isCustomer ? "Write a review" : "Sign in to review"}
                </button>
              )}
            </div>

            {hasReviews && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-serif text-5xl font-bold text-amber-300">{rating}</p>
                <div>
                  <Stars value={Math.round(rating)} />
                  <p className="mt-1 text-sm text-stone-400">Based on {reviewSummary.totalReviews} review{reviewSummary.totalReviews === 1 ? "" : "s"}</p>
                </div>
              </div>
            )}

            {reviewFormOpen && (
              <form id="review-form" onSubmit={handleSubmitReview} className="mt-5 space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{editingReviewId ? "Update your review" : "How was your stay?"}</h3>
                    <p className="mt-0.5 text-xs text-stone-500">You can review after checking out from a stay at this hotel.</p>
                  </div>
                  <button type="button" onClick={closeReviewForm} aria-label="Close review form" className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-white">
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <Stars value={reviewForm.rating} size="h-8 w-8" interactive onChange={(value) => setReviewForm((f) => ({ ...f, rating: value }))} />
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm((f) => ({ ...f, review: e.target.value }))}
                  rows="4"
                  placeholder="Share what made your stay special..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                />
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeReviewForm} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-stone-300 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={savingReview} className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white hover:from-amber-400 hover:to-amber-500 disabled:opacity-50">
                    {savingReview ? "Saving..." : editingReviewId ? "Save changes" : "Submit review"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 space-y-4">
              {reviewsLoading && reviews.length === 0 ? (
                <div className="space-y-3">
                  {[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
                  <FiStar className="mx-auto h-8 w-8 text-stone-600" />
                  <p className="mt-3 font-semibold text-white">No reviews yet</p>
                  <p className="mt-1 text-sm text-stone-500">Stayed here? Be the first to share your experience.</p>
                </div>
              ) : (
                <>
                  {reviews.map((review) => {
                    const mine = user?._id && String(review.userId) === String(user._id);
                    return (
                      <article key={review._id} className={`rounded-2xl border p-5 ${mine ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/[0.03]"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-bold text-white">
                              {(review.userName || "G").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {review.userName || "Guest"} {mine && <span className="ml-1 text-[10px] uppercase text-amber-400">you</span>}
                              </p>
                              <p className="text-[11px] text-stone-500">{formatDate(review.reviewedOn)}{review.updatedOn ? " · edited" : ""}</p>
                            </div>
                          </div>
                          {mine && (
                            <div className="flex shrink-0 gap-1">
                              <button onClick={() => startEditReview(review)} className="rounded-lg p-2 text-stone-400 hover:bg-white/10 hover:text-white" aria-label="Edit review"><FiEdit2 className="h-4 w-4" /></button>
                              <ConfirmButton onConfirm={() => handleDeleteReview(review)} confirmLabel="Delete?" className="rounded-lg p-2 text-xs text-red-400 hover:bg-red-500/10" armedClassName="!bg-red-500 !text-white">
                                <FiTrash2 className="h-4 w-4" />
                              </ConfirmButton>
                            </div>
                          )}
                        </div>
                        <div className="mt-3"><Stars value={review.rating} size="h-3.5 w-3.5" /></div>
                        {review.review && <p className="mt-2 text-sm leading-6 text-stone-300">{review.review}</p>}
                      </article>
                    );
                  })}
                  {reviewPage < reviewTotalPages && (
                    <button onClick={() => setReviewPage((p) => p + 1)} disabled={reviewsLoading} className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-stone-300 hover:bg-white/5 disabled:opacity-50">
                      {reviewsLoading ? "Loading..." : "Show more reviews"}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* ================= DESKTOP BOOKING CARD ================= */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-sm text-stone-400">Starting from</p>
              <p className="mt-1 text-white">
                <span className="text-3xl font-bold">{hasPrice ? formatMoney(hotel.startingPrice) : "—"}</span>
                {hasPrice && <span className="text-stone-400"> / night</span>}
              </p>
              <p className="mt-1 text-xs text-stone-500">Taxes included · Offers applied at checkout</p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-stone-500">Rating</p>
                  <p className="mt-0.5 flex items-center gap-1 font-semibold text-white"><FiStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {hasReviews ? rating : "New"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-stone-500">Available</p>
                  <p className={`mt-0.5 font-semibold ${availableRooms > 0 ? "text-emerald-400" : "text-red-400"}`}>{availableRooms > 0 ? `${availableRooms} room${availableRooms === 1 ? "" : "s"}` : "Fully booked"}</p>
                </div>
              </div>

              <button
                onClick={() => scrollToSection("rooms")}
                disabled={rooms.length === 0}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                {rooms.length === 0 ? "No rooms listed" : "Select a room"} <FiArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-[11px] text-stone-500">You won't be charged until checkout</p>
            </div>

            {(hotel.mobileNumber || hotel.email) && (
              <div className="rounded-3xl border border-white/10 bg-stone-900/50 p-5 text-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Contact the hotel</p>
                {hotel.mobileNumber && (
                  <a href={`tel:${hotel.mobileNumber}`} className="flex items-center gap-3 rounded-xl px-2 py-2 text-stone-200 transition-colors hover:bg-white/5 hover:text-white">
                    <FiPhone className="h-4 w-4 text-amber-400" /> {hotel.mobileNumber}
                  </a>
                )}
                {hotel.email && (
                  <a href={`mailto:${hotel.email}`} className="flex items-center gap-3 rounded-xl px-2 py-2 text-stone-200 transition-colors hover:bg-white/5 hover:text-white">
                    <FiMail className="h-4 w-4 shrink-0 text-amber-400" /> <span className="truncate">{hotel.email}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Contact on phones (desktop shows it in the booking column) */}
      {(hotel.mobileNumber || hotel.email) && (
        <div className="mt-12 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Contact the hotel</p>
          <div className="grid grid-cols-2 gap-2">
            {hotel.mobileNumber && (
              <a href={`tel:${hotel.mobileNumber}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-2.5 font-medium text-white">
                <FiPhone className="h-4 w-4 text-amber-400" /> Call
              </a>
            )}
            {hotel.email && (
              <a href={`mailto:${hotel.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-2.5 font-medium text-white">
                <FiMail className="h-4 w-4 text-amber-400" /> Email
              </a>
            )}
          </div>
        </div>
      )}

      {/* ================= PHONE BOOKING BAR ================= */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-stone-950/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white">
              <span className="text-lg font-bold">{hasPrice ? formatMoney(hotel.startingPrice) : "—"}</span>
              {hasPrice && <span className="text-xs text-stone-400"> / night</span>}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-stone-400">
              <FiStar className="h-3 w-3 fill-amber-400 text-amber-400" /> {hasReviews ? `${rating} · ${reviewSummary.totalReviews} review${reviewSummary.totalReviews === 1 ? "" : "s"}` : "New"}
              <span className="text-stone-600">·</span>
              <span className={availableRooms > 0 ? "text-emerald-400" : "text-red-400"}>{availableRooms > 0 ? `${availableRooms} available` : "Fully booked"}</span>
            </p>
          </div>
          <button
            onClick={() => scrollToSection("rooms")}
            disabled={rooms.length === 0}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          >
            Select room
          </button>
        </div>
      </div>

      {/* PHOTO VIEWER */}
      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox images={images} index={lightboxIndex} title={hotel.hotelName} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />
      )}

      {/* AVAILABILITY CHECK MODAL */}
      {selectedRoom && <AvailabilityCheckModal room={selectedRoom} hotel={hotel} onClose={() => setSelectedRoom(null)} />}
    </div>
  );
};

export default HotelDetails;
