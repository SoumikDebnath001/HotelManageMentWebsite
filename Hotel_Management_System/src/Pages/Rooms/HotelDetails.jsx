import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicHotelById, getPublicRoomsByHotelId } from "../../Services/booking.service";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import AvailabilityCheckModal from "./AvailabilityCheckModal";
import { FiMapPin, FiStar, FiArrowLeft, FiCheck, FiInfo, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

const HotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchHotelData();
  }, [hotelId]);

  const fetchHotelData = async () => {
    setLoading(true);
    try {
      const [hotelRes, roomsRes] = await Promise.all([
        getPublicHotelById(hotelId),
        getPublicRoomsByHotelId(hotelId)
      ]);

      if (hotelRes?.data?.status) {
        setHotel(hotelRes.data.data);
      } else {
        toast.error("Failed to load hotel details.");
        navigate("/rooms");
      }

      if (roomsRes?.data?.status) {
        setRooms(roomsRes.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading data.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate("/rooms")}
        className="mb-6 flex items-center gap-2 text-stone-400 hover:text-white transition-colors font-medium text-sm"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Hotels
      </button>

      {/* Hero Section */}
      <GlassCard className="border-white/10 p-0 overflow-hidden mb-12">
        <div className="relative h-64 md:h-[400px] w-full bg-stone-900">
          {hotel.images && hotel.images.length > 0 ? (
            <img
              src={hotel.images[0]}
              alt={hotel.hotelName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-600 italic">
              No image available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                {hotel.starRating && (
                  <div className="flex gap-1 mb-3">
                    {[...Array(parseInt(hotel.starRating) || 0)].map((_, i) => (
                      <FiStar key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 shadow-black drop-shadow-md">
                  {hotel.hotelName}
                </h1>
                <div className="flex items-center gap-2 text-stone-200">
                  <FiMapPin className="h-5 w-5 text-emerald-400" />
                  <span>{hotel.address}, {hotel.cityName}, {hotel.stateName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-amber-500 mb-4">About the Hotel</h3>
              <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                {hotel.description || "No description available for this hotel."}
              </p>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-amber-500 mb-4">Facilities & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hotel.amenities && hotel.amenities.length > 0 ? (
                  hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-stone-300 text-sm">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <FiCheck className="h-3 w-3" />
                      </div>
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 italic text-sm">No specific amenities listed.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <GlassCard className="bg-black/40 border-white/5 p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <FiInfo className="text-amber-500" /> Quick Info
              </h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Contact:</span>
                  <span className="text-white">{hotel.mobileNumber || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Email:</span>
                  <span className="text-white">{hotel.email || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Check-in:</span>
                  <span className="text-white">2:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="text-white">11:00 AM</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </GlassCard>

      {/* Room Selection */}
      <h2 className="font-serif text-3xl font-bold text-white mb-6">Select a Room</h2>
      
      {rooms.length === 0 ? (
        <GlassCard className="border-white/5 text-center py-16 bg-black/40">
          <p className="text-stone-400 text-lg">No rooms are currently available for this hotel.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="relative overflow-hidden rounded-3xl border border-white/20 bg-stone-900/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-[0_12px_40px_0_rgba(139,107,67,0.25)] flex flex-col sm:flex-row group">
              <div className="w-full sm:w-2/5 h-48 sm:h-auto min-h-[200px] bg-stone-800 relative flex-shrink-0">
                 {room.image && room.image.length > 0 ? (
                  <img
                    src={room.image[0]}
                    alt={room.roomType}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-600 italic text-sm">
                    No image
                  </div>
                )}
                {room.availabilityStatus !== 'available' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-md text-xs uppercase tracking-widest">
                      {room.availabilityStatus}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 w-full sm:w-3/5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {room.roomType || `Room ${room.roomNumber}`}
                  </h3>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 uppercase font-semibold">Per Night</p>
                    <p className="text-lg font-bold text-emerald-400">${room.pricePerNight}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                   <div className="flex items-center gap-1">
                      <FiUsers /> {room.maxAdults ? room.maxAdults + (room.maxChildren || 0) : 2} Guests
                   </div>
                   {room.roomNumber && (
                     <div className="border border-white/10 px-2 py-0.5 rounded-md">
                       Room {room.roomNumber}
                     </div>
                   )}
                </div>

                <p className="text-sm text-stone-300 line-clamp-2 mb-6">
                  {room.description || "A beautiful room equipped with modern amenities for a comfortable stay."}
                </p>

                <div className="mt-auto">
                  <button 
                    onClick={() => setSelectedRoom(room)}
                    disabled={room.availabilityStatus !== 'available'}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      room.availabilityStatus === 'available' 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02]' 
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    Book this room
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Availability Check Modal */}
      {selectedRoom && (
        <AvailabilityCheckModal
          room={selectedRoom}
          hotel={hotel}
          onClose={() => setSelectedRoom(null)}
        />
      )}
      
    </div>
  );
};

export default HotelDetails;
