import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPublicHotels } from "../../Services/booking.service";
import { addToWishlist, getMyWishlist, removeFromWishlist } from "../../Services/user.service";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import { FiMapPin, FiStar, FiSearch, FiFilter, FiArrowLeft, FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";

const HotelDiscovery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const filterParam = queryParams.get("filter") || "";

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minStarRating, setMinStarRating] = useState(filterParam === "top-offers" ? 4 : 0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Wishlist States
  // likedMap: { hotelId: wishlistDocId } for quick lookup
  const [likedMap, setLikedMap] = useState({});
  const [likingInProgress, setLikingInProgress] = useState({});
  const { isAuthenticated, userType } = useSelector((state) => state.auth) || {};
  


  const commonAmenities = ["Free Wi-Fi", "Pool", "Spa", "Gym", "Parking", "Restaurant", "Bar"];

  useEffect(() => {
    fetchHotels();
    if (isAuthenticated && userType === "User") {
      fetchWishlist();
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await getMyWishlist(1, 200);
      if (res?.data?.status && res?.data?.data) {
        const map = {};
        res.data.data.forEach((item) => {
          map[String(item.hotelId)] = item._id;
        });
        setLikedMap(map);
      }
    } catch (err) {
      // silently fail
    }
  };

  const handleToggleLike = async (e, hotelId) => {
    e.stopPropagation(); // prevent card click navigation
    if (!isAuthenticated || userType !== "User") {
      toast.error("Please login to like hotels.");
      return;
    }
    if (likingInProgress[hotelId]) return;
    setLikingInProgress((prev) => ({ ...prev, [hotelId]: true }));

    try {
      if (likedMap[hotelId]) {
        // Already liked → remove
        const res = await removeFromWishlist({ wishlistId: likedMap[hotelId] });
        if (res?.data?.status) {
          setLikedMap((prev) => { const copy = { ...prev }; delete copy[hotelId]; return copy; });
          toast.success("Removed from liked hotels");
        }
      } else {
        // Not liked → add
        const res = await addToWishlist({ hotelId });
        if (res?.data?.status) {
          setLikedMap((prev) => ({ ...prev, [hotelId]: res.data.data._id }));
          toast.success("Added to liked hotels ❤️");
        } else {
          toast.error(res?.data?.message || "Failed to like hotel");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
    setLikingInProgress((prev) => ({ ...prev, [hotelId]: false }));
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await getPublicHotels();
      if (res?.data?.status) {
        setHotels(res.data.data);
      } else {
        toast.error("Failed to fetch hotels.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading hotels.");
    }
    setLoading(false);
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hotel.cityName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = !minStarRating || (hotel.starRating && parseInt(hotel.starRating) >= minStarRating);
    
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => hotel.amenities && hotel.amenities.includes(amenity));

    return matchesSearch && matchesRating && matchesAmenities;
  });

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8 relative">
      
      {/* Header and Search */}
      <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-6 mb-12 md:mt-4">
        
        {/* Left: Search and Filter */}
        <div className="w-full md:w-auto flex items-center gap-3 relative z-10">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by hotel or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-100 py-3 pl-12 pr-4 text-sm text-stone-800 placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${isFilterOpen || minStarRating > 0 || selectedAmenities.length > 0 ? 'bg-amber-100 border-amber-300 text-amber-600' : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-white shadow-sm'}`}
          >
            <FiFilter className="h-5 w-5" />
            {(minStarRating > 0 || selectedAmenities.length > 0) && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            )}
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute left-0 top-14 z-20 w-72 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-semibold text-stone-800">Filters</h4>
                <button 
                  onClick={() => { setMinStarRating(0); setSelectedAmenities([]); }}
                  className="text-xs text-amber-600 hover:text-amber-500 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Star Rating Filter */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold text-stone-500 uppercase">Minimum Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMinStarRating(minStarRating === star ? 0 : star)}
                      className={`flex h-8 flex-1 items-center justify-center rounded-lg border text-sm transition-all ${minStarRating >= star ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
                    >
                      {star} <FiStar className={`ml-1 h-3 w-3 ${minStarRating >= star ? 'fill-amber-500' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Filter */}
              <div>
                <p className="mb-2 text-xs font-semibold text-stone-500 uppercase">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {commonAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-md border px-3 py-1.5 text-xs transition-all ${selectedAmenities.includes(amenity) ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-medium' : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Title and Subtitle */}
        <div className="w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2 text-center md:text-center z-0">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            {filterParam === "top-offers" ? "Top Offers Available" : "Discover Extraordinary Stays"}
          </h1>
          <p className="text-stone-400 text-sm md:text-base">
            {filterParam === "top-offers" ? "Showing the best deals with 4+ star ratings." : "Find the perfect hotel for your next adventure."}
          </p>
        </div>

      </div>

      {/* Grid of Hotels */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-500 text-lg">No hotels found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map((hotel) => (
            <GlassCard
              key={hotel._id}
              className="group cursor-pointer overflow-hidden border-white/10 p-0 transition-all hover:scale-[1.02] hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10"
              onClick={() => navigate(`/rooms/${hotel._id}`)}
            >
              {/* Hotel Image (placeholder if none) */}
              <div className="relative h-56 w-full overflow-hidden bg-stone-900">
                {hotel.image && hotel.image.length > 0 ? (
                  <img
                    src={hotel.image[0]}
                    alt={hotel.hotelName}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-600 text-sm italic">
                    No image available
                  </div>
                )}
                {/* Rating Badge */}
                {hotel.starRating && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-sm font-bold text-amber-400">
                    <FiStar className="h-4 w-4 fill-amber-400" />
                    {hotel.starRating}
                  </div>
                )}

                {/* Wishlist Heart Icon */}
                <button
                  onClick={(e) => handleToggleLike(e, hotel._id)}
                  disabled={likingInProgress[hotel._id]}
                  className={`absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
                    likedMap[hotel._id]
                      ? "bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "bg-black/40 border-white/20 text-white/70 hover:bg-black/60 hover:text-white hover:border-white/40"
                  } ${likingInProgress[hotel._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={likedMap[hotel._id] ? "Remove from Liked Hotels" : "Add to Liked Hotels"}
                >
                  <FiHeart className={`h-5 w-5 transition-all duration-300 ${likedMap[hotel._id] ? "fill-red-500 text-red-500 scale-110" : ""}`} />
                </button>
              </div>

              {/* Hotel Details */}
              <div className="p-6">
                <h3 className="font-serif text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">
                  {hotel.hotelName}
                </h3>
                
                <div className="flex items-center gap-2 text-stone-400 text-sm mb-4">
                  <FiMapPin className="h-4 w-4 text-emerald-400" />
                  <span className="line-clamp-1">{hotel.cityName || hotel.address || "Location unavailable"}</span>
                </div>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-medium text-stone-300 uppercase tracking-wider border border-white/5">
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-medium text-stone-300 border border-white/5">
                        +{hotel.amenities.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Starting from</p>
                    {/* Just a placeholder logic since price is usually on room level */}
                    <p className="text-xl font-bold text-emerald-400">View Details</p>
                  </div>
                  <button className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:shadow-lg group-hover:shadow-amber-500/20">
                    Book Now
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelDiscovery;
