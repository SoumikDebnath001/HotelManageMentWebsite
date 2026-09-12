import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPublicHotelById, getPublicRoomsByHotelId } from "../../Services/booking.service";
import { getReviewsByHotelId, addReview, updateReview, deleteReview } from "../../Services/user.service";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import AvailabilityCheckModal from "./AvailabilityCheckModal";
import ConfirmButton from "../../Components/Common/ConfirmButton";
import { formatMoney, formatDate } from "../../Utils/bookingHelpers";
import { FiMapPin, FiStar, FiArrowLeft, FiCheck, FiInfo, FiUsers, FiHeart, FiSliders, FiEdit2, FiTrash2, FiMessageSquare, FiLayers } from "react-icons/fi";
import toast from "react-hot-toast";

const ROOM_TYPES = ["single", "double", "triple", "queen", "king", "suite", "deluxe"];
const REVIEWS_PAGE_SIZE = 5;

const Stars = ({ value, size = "h-4 w-4", interactive = false, onChange }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange(star)}
        className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
        aria-label={`${star} star`}
      >
        <FiStar className={`${size} ${star <= value ? "fill-amber-400 text-amber-400" : "text-stone-600"}`} />
      </button>
    ))}
  </div>
);

const HotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth) || {};
  const isCustomer = isAuthenticated && userType === "User";

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroImage, setActiveHeroImage] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Room filters (Step 4: budget, occupancy, facilities, availability)
  const [roomFilters, setRoomFilters] = useState({ guests: "", maxPrice: "", roomType: "", availableOnly: true, sortBy: "price_low" });

  // Reviews (Step 12)
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, review: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [hotelRes, roomsRes] = await Promise.all([getPublicHotelById(hotelId), getPublicRoomsByHotelId(hotelId)]);
      if (cancelled) return;

      if (hotelRes.data?.status) {
        const hotelData = hotelRes.data.data;
        setHotel(hotelData);
        setActiveHeroImage(hotelData.image && hotelData.image.length > 0 ? hotelData.image[0] : null);
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

  // Jump to reviews when linked from "Write a review"
  useEffect(() => {
    if (!loading && location.hash === "#reviews") {
      const el = document.getElementById("reviews");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, location.hash]);

  const myReview = useMemo(() => (user?._id ? reviews.find((r) => String(r.userId) === String(user._id)) : null), [reviews, user]);

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

  const refreshReviews = () => {
    setReviewPage(1);
    setReviewsKey((k) => k + 1);
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: review.rating, review: review.review || "" });
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isCustomer) {
      toast.error("Please sign in as a guest to write a review.");
      navigate("/user/auth/login");
      return;
    }
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
      setReviewForm({ rating: 0, review: "" });
      setEditingReviewId(null);
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
      if (editingReviewId === review._id) {
        setEditingReviewId(null);
        setReviewForm({ rating: 0, review: "" });
      }
      refreshReviews();
    } else {
      toast.error(error || data?.message || "Could not delete review");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hotel) return null;

  const coverImage = hotel.image && hotel.image.length > 0 ? hotel.image[0] : null;
  const allImages = hotel.image || [];
  const hasReviews = (hotel.totalReviews || reviewSummary.totalReviews) > 0;
  const displayRating = reviewSummary.totalReviews > 0 ? reviewSummary.averageRating : hotel.averageRating;
  const locationText = [hotel.address, hotel.cityName, hotel.stateName].filter(Boolean).join(", ") || "Location unavailable";
  const roomTypesAvailable = [...new Set(rooms.map((r) => r.roomType))];
  const filterInput = "bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none [&>option]:bg-stone-900";

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
      {/* Back Button */}
      <button onClick={() => navigate("/rooms")} className="mb-6 flex items-center gap-2 text-stone-400 hover:text-white transition-colors font-medium text-sm">
        <FiArrowLeft className="h-4 w-4" /> Back to Hotels
      </button>

      {/* Hero Section */}
      <GlassCard className="border-white/10 p-0 overflow-hidden mb-12">
        <div className="relative h-64 md:h-[400px] w-full bg-stone-900">
          {activeHeroImage || coverImage ? (
            <img src={activeHeroImage || coverImage} alt={hotel.hotelName} className="h-full w-full object-cover transition-all duration-500" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-600 italic">No image available</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                {hotel.starRating && (
                  <div className="flex items-center gap-2 mb-3">
                    <Stars value={parseInt(hotel.starRating) || 0} size="h-5 w-5" />
                    <span className="text-xs text-stone-300">{hotel.starRating}-star hotel</span>
                  </div>
                )}
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 shadow-black drop-shadow-md">{hotel.hotelName}</h1>
                <div className="flex items-center gap-2 text-stone-200">
                  <FiMapPin className="h-5 w-5 text-emerald-400" />
                  <span>{locationText}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a href="#reviews" className="rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-center backdrop-blur-md hover:border-amber-500/40 transition-colors">
                  <p className="flex items-center justify-center gap-1 text-xl font-bold text-amber-300"><FiStar className="h-4 w-4 fill-amber-400" /> {hasReviews ? displayRating : "New"}</p>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">{hasReviews ? `${reviewSummary.totalReviews || hotel.totalReviews} review${(reviewSummary.totalReviews || hotel.totalReviews) === 1 ? "" : "s"}` : "No reviews yet"}</p>
                </a>
                <div className="rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-center backdrop-blur-md">
                  <p className="flex items-center justify-center gap-1 text-xl font-bold text-red-300"><FiHeart className="h-4 w-4 fill-red-400 text-red-400" /> {hotel.likeCount || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Likes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails Strip */}
        {allImages.length > 1 && (
          <div className="p-3 bg-black/60 border-t border-white/10">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHeroImage(imgUrl)}
                  className={`flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${activeHeroImage === imgUrl ? "border-amber-500 ring-1 ring-amber-500/40 scale-105" : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"}`}
                >
                  <img src={imgUrl} alt={idx === 0 ? "Cover" : `Gallery ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                {activeHeroImage === allImages[0] ? "Cover Image" : "Gallery View"} &nbsp;·&nbsp; {allImages.length} {allImages.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-amber-500 mb-4">About the Hotel</h3>
              <p className="text-stone-300 leading-relaxed text-sm md:text-base">{hotel.description || "No description available for this hotel."}</p>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-amber-500 mb-4">Facilities & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hotel.amenities && hotel.amenities.length > 0 ? (
                  hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-stone-300 text-sm">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"><FiCheck className="h-3 w-3" /></div>
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 italic text-sm">No hotel-level amenities listed. See individual rooms for in-room facilities.</p>
                )}
              </div>
            </div>

            {roomTypesAvailable.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-amber-500 mb-4 flex items-center gap-2"><FiLayers className="h-5 w-5" /> Room Types & Pricing</h3>
                <div className="flex flex-wrap gap-2">
                  {roomTypesAvailable.map((type) => {
                    const prices = rooms.filter((r) => r.roomType === type).map((r) => r.pricePerNight);
                    return (
                      <button key={type} onClick={() => setRoomFilters((f) => ({ ...f, roomType: f.roomType === type ? "" : type }))} className={`rounded-xl border px-4 py-2 text-left transition-colors ${roomFilters.roomType === type ? "border-amber-500/60 bg-amber-500/15" : "border-white/10 bg-white/5 hover:border-white/25"}`}>
                        <p className="text-sm font-semibold text-white capitalize">{type}</p>
                        <p className="text-xs text-stone-400">from {formatMoney(Math.min(...prices))} / night · {prices.length} room{prices.length === 1 ? "" : "s"}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <GlassCard className="bg-black/40 border-white/5 p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2"><FiInfo className="text-amber-500" /> Quick Info</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Contact:</span><span className="text-white">{hotel.mobileNumber || "N/A"}</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Email:</span><span className="text-white truncate ml-4">{hotel.email || "N/A"}</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Rooms:</span><span className="text-white">{hotel.availableRooms ?? 0} of {hotel.totalRooms ?? rooms.length} available</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Starting from:</span><span className="text-emerald-400 font-semibold">{typeof hotel.startingPrice === "number" ? `${formatMoney(hotel.startingPrice)} / night` : "N/A"}</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Check-in:</span><span className="text-white">2:00 PM</span></li>
                <li className="flex justify-between"><span>Check-out:</span><span className="text-white">11:00 AM</span></li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </GlassCard>

      {/* Room Selection */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Select a Room</h2>
          <p className="text-sm text-stone-400 mt-1">Filter by budget, guests, room type and availability.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FiSliders className="h-4 w-4 text-amber-400" />
          <input type="number" min="1" placeholder="Guests" value={roomFilters.guests} onChange={(e) => setRoomFilters((f) => ({ ...f, guests: e.target.value }))} className={`${filterInput} w-24`} />
          <input type="number" min="0" step="100" placeholder="Max ₹/night" value={roomFilters.maxPrice} onChange={(e) => setRoomFilters((f) => ({ ...f, maxPrice: e.target.value }))} className={`${filterInput} w-32`} />
          <select value={roomFilters.roomType} onChange={(e) => setRoomFilters((f) => ({ ...f, roomType: e.target.value }))} className={filterInput}>
            <option value="">All types</option>
            {ROOM_TYPES.filter((t) => roomTypesAvailable.includes(t)).map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select value={roomFilters.sortBy} onChange={(e) => setRoomFilters((f) => ({ ...f, sortBy: e.target.value }))} className={filterInput}>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
          </select>
          <label className="inline-flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
            <input type="checkbox" checked={roomFilters.availableOnly} onChange={(e) => setRoomFilters((f) => ({ ...f, availableOnly: e.target.checked }))} className="h-4 w-4 accent-amber-500" />
            Available only
          </label>
        </div>
      </div>

      {rooms.length === 0 ? (
        <GlassCard className="border-white/5 text-center py-16 bg-black/40"><p className="text-stone-400 text-lg">No rooms are currently listed for this hotel.</p></GlassCard>
      ) : filteredRooms.length === 0 ? (
        <GlassCard className="border-white/5 text-center py-16 bg-black/40">
          <p className="text-stone-400 text-lg">No rooms match your filters.</p>
          <button onClick={() => setRoomFilters({ guests: "", maxPrice: "", roomType: "", availableOnly: false, sortBy: "price_low" })} className="mt-4 text-sm text-amber-400 hover:underline">Clear filters</button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRooms.map((room) => {
            const capacity = (room.maxAdults || 2) + (room.maxChildren || 0);
            const available = room.availabilityStatus === "available";
            return (
              <div key={room._id} className="relative overflow-hidden rounded-3xl border border-white/20 bg-stone-900/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-[0_12px_40px_0_rgba(139,107,67,0.25)] flex flex-col sm:flex-row group">
                <div className="w-full sm:w-2/5 h-48 sm:h-auto min-h-[200px] bg-stone-800 relative flex-shrink-0">
                  {room.image && room.image.length > 0 ? (
                    <img src={room.image[0]} alt={room.roomType} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-600 italic text-sm">No image</div>
                  )}
                  {!available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-md text-xs uppercase tracking-widest">{room.availabilityStatus}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 w-full sm:w-3/5 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors capitalize">{room.roomType || `Room ${room.roomNumber}`}</h3>
                    <div className="text-right">
                      <p className="text-xs text-stone-500 uppercase font-semibold">Per Night</p>
                      <p className="text-lg font-bold text-emerald-400">{formatMoney(room.pricePerNight)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-3">
                    <div className="flex items-center gap-1"><FiUsers /> Up to {capacity} guest{capacity === 1 ? "" : "s"}{room.maxChildren ? ` (${room.maxAdults || 2} adults, ${room.maxChildren} children)` : ""}</div>
                    {room.bedCount && <div className="border border-white/10 px-2 py-0.5 rounded-md">{room.bedCount} bed{room.bedCount === 1 ? "" : "s"}</div>}
                    {room.roomNumber && <div className="border border-white/10 px-2 py-0.5 rounded-md">Room {room.roomNumber}</div>}
                    {room.floor && <div className="border border-white/10 px-2 py-0.5 rounded-md">Floor {room.floor}</div>}
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {room.amenities.slice(0, 5).map((amenity) => (
                        <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300"><FiCheck className="h-2.5 w-2.5" />{amenity}</span>
                      ))}
                      {room.amenities.length > 5 && <span className="text-[10px] text-stone-500">+{room.amenities.length - 5} more</span>}
                    </div>
                  )}

                  <p className="text-sm text-stone-300 line-clamp-2 mb-6">{room.description || "A beautiful room equipped with modern amenities for a comfortable stay."}</p>

                  <div className="mt-auto">
                    <button
                      onClick={() => setSelectedRoom(room)}
                      disabled={!available}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${available ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02]" : "bg-stone-800 text-stone-500 cursor-not-allowed"}`}
                    >
                      {available ? "Check availability & book" : "Not available"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews */}
      <section id="reviews" className="mt-16 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3"><FiMessageSquare className="text-amber-400" /> Guest Reviews</h2>
            <p className="text-sm text-stone-400 mt-1">Ratings from guests who completed a stay at {hotel.hotelName}.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-3">
            <p className="text-3xl font-bold text-amber-300">{reviewSummary.totalReviews > 0 ? reviewSummary.averageRating : "—"}</p>
            <div>
              <Stars value={Math.round(reviewSummary.averageRating)} />
              <p className="text-xs text-stone-400 mt-1">{reviewSummary.totalReviews} review{reviewSummary.totalReviews === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review form */}
          <GlassCard id="review-form" className="border-white/10 p-6 lg:col-span-1 h-fit">
            <h3 className="font-bold text-white mb-1">{editingReviewId ? "Update your review" : "Write a review"}</h3>
            <p className="text-xs text-stone-500 mb-4">Reviews can be submitted after you have checked out from a stay at this hotel.</p>
            {!isCustomer ? (
              <button onClick={() => navigate("/user/auth/login")} className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors">Sign in to review</button>
            ) : myReview && !editingReviewId ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-stone-300">
                <p className="mb-2">You already reviewed this hotel.</p>
                <button onClick={() => startEditReview(myReview)} className="text-amber-400 hover:underline text-sm">Edit my review</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Your rating</p>
                  <Stars value={reviewForm.rating} size="h-7 w-7" interactive onChange={(rating) => setReviewForm((f) => ({ ...f, rating }))} />
                </div>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm((f) => ({ ...f, review: e.target.value }))}
                  rows="4"
                  placeholder="Share what made your stay special..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  {editingReviewId && (
                    <button type="button" onClick={() => { setEditingReviewId(null); setReviewForm({ rating: 0, review: "" }); }} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-stone-300 hover:bg-white/5">Cancel</button>
                  )}
                  <button type="submit" disabled={savingReview} className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-2.5 text-sm font-bold text-white hover:from-amber-500 hover:to-amber-600 disabled:opacity-50">
                    {savingReview ? "Saving..." : editingReviewId ? "Save changes" : "Submit review"}
                  </button>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Review list */}
          <div className="lg:col-span-2 space-y-4">
            {reviewsLoading && reviews.length === 0 ? (
              <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div></div>
            ) : reviews.length === 0 ? (
              <GlassCard className="border-white/5 bg-black/40 text-center py-12"><p className="text-stone-400">No reviews yet. Be the first to share your experience.</p></GlassCard>
            ) : (
              <>
                {reviews.map((review) => {
                  const mine = user?._id && String(review.userId) === String(user._id);
                  return (
                    <div key={review._id} className={`rounded-2xl border p-5 ${mine ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-black/40"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-bold text-white">{(review.userName || "G").charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-semibold text-white">{review.userName || "Guest"} {mine && <span className="ml-1 text-[10px] uppercase text-amber-400">you</span>}</p>
                            <p className="text-[11px] text-stone-500">{formatDate(review.reviewedOn)}{review.updatedOn ? " · edited" : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Stars value={review.rating} />
                          {mine && (
                            <div className="flex gap-1">
                              <button onClick={() => startEditReview(review)} className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-white" title="Edit"><FiEdit2 className="h-3.5 w-3.5" /></button>
                              <ConfirmButton onConfirm={() => handleDeleteReview(review)} confirmLabel="Delete?" className="rounded-lg p-1.5 text-xs text-red-400 hover:bg-red-500/10" armedClassName="!bg-red-500 !text-white" ><FiTrash2 className="h-3.5 w-3.5" /></ConfirmButton>
                            </div>
                          )}
                        </div>
                      </div>
                      {review.review && <p className="mt-3 text-sm text-stone-300 leading-relaxed">{review.review}</p>}
                    </div>
                  );
                })}
                {reviewPage < reviewTotalPages && (
                  <button onClick={() => setReviewPage((p) => p + 1)} disabled={reviewsLoading} className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-stone-300 hover:bg-white/5 disabled:opacity-50">
                    {reviewsLoading ? "Loading..." : "Load more reviews"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Availability Check Modal */}
      {selectedRoom && <AvailabilityCheckModal room={selectedRoom} hotel={hotel} onClose={() => setSelectedRoom(null)} />}
    </div>
  );
};

export default HotelDetails;
