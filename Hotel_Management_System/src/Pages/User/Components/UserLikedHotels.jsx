import React, { useState, useEffect } from "react";
import { FiHeart, FiMapPin, FiStar, FiTrash2, FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../../Features/Auth/Components/GlassCard";
import { getMyWishlist, removeFromWishlist } from "../../../Services/user.service";
import toast from "react-hot-toast";

const UserLikedHotels = () => {
  const [likedHotels, setLikedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await getMyWishlist();
      if (res?.data?.status && res?.data?.data) {
        setLikedHotels(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load liked hotels");
    }
    setLoading(false);
  };

  const handleRemove = async (wishlistId) => {
    try {
      const res = await removeFromWishlist({ wishlistId });
      if (res?.data?.status) {
        toast.success("Removed from liked hotels");
        setLikedHotels(likedHotels.filter(item => item._id !== wishlistId));
      } else {
        toast.error(res?.data?.message || "Failed to remove hotel");
      }
    } catch (error) {
      toast.error("Failed to remove hotel");
    }
  };

  const renderHotelCard = (item) => {
    const hotel = item.hotelDetails?.[0];
    if (!hotel) return null;
    
    return (
      <div key={item._id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-black/40 p-5 transition-all hover:bg-white/5 border-white/15 shadow-xl group">
        
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleRemove(item._id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            title="Remove from liked hotels"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-start gap-4 pt-2">
          <div className="flex h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 relative">
             <img src={hotel.coverImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80"} alt={hotel.hotelName} className="h-full w-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-white truncate pr-6">{hotel.hotelName}</h3>
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
              <FiMapPin className="text-amber-500 h-3 w-3" /> {hotel.address}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-400">
              <FiStar className="fill-amber-400 h-3 w-3" />
              {hotel.rating || "New"} 
              <span className="text-stone-500 font-normal ml-1">({hotel.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-stone-400 font-mono">
            Added: {new Date(item.addedOn).toLocaleDateString()}
          </div>
          <button
            onClick={() => navigate(`/rooms/${hotel._id}`)}
            className="flex items-center gap-2 rounded-lg bg-amber-500/10 text-amber-400 px-4 py-2 text-xs font-semibold transition-colors hover:bg-amber-500/20"
          >
            View Details <FiExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
          <FiHeart className="text-red-500 fill-red-500/20" /> Liked Hotels
        </h2>
        <p className="mt-1 text-sm text-stone-400">Your saved hotels for future stays.</p>
      </div>

      <div className="space-y-10">
        <section>
          {likedHotels.length === 0 ? (
            <GlassCard className="flex h-32 flex-col items-center justify-center border-white/10 text-center">
              <FiHeart className="h-8 w-8 text-stone-600 mb-2" />
              <p className="text-stone-400 text-sm">You haven't liked any hotels yet.</p>
              <button 
                onClick={() => navigate("/services")}
                className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Browse Hotels
              </button>
            </GlassCard>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {likedHotels.map(item => renderHotelCard(item))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserLikedHotels;
