import React, { useEffect, useState } from "react";
import { FiPlus, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchHotelRooms, fetchMyHotel, createRoom, updateRoom, deleteRoom, fetchAmenities } from "../../Services/manager.service";
import AmenityPicker from "../../Components/Common/AmenityPicker";

const ROOM_TYPES = ["single", "double", "triple", "queen", "king", "suite", "deluxe"];
const AVAILABILITY_STATUSES = ["available", "booked", "maintenance"];

const emptyForm = {
  roomNumber: "",
  roomType: "single",
  pricePerNight: "",
  floor: "",
  description: "",
  maxAdults: "",
  maxChildren: "",
  bedCount: "",
  availabilityStatus: "available",
  amenities: [],
};

const ManagerRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const hotelRes = await fetchMyHotel();
      const hotels = hotelRes?.data?.data || [];
      if (hotels.length > 0) {
        setHotelId(hotels[0]._id);
      }

      const roomsRes = await fetchHotelRooms();
      if (roomsRes?.data?.status) {
        setRooms(roomsRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load rooms");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData({ ...emptyForm });
    setEditingRoom(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "single",
      pricePerNight: room.pricePerNight || "",
      floor: room.floor || "",
      description: room.description || "",
      maxAdults: room.maxAdults || "",
      maxChildren: room.maxChildren || "",
      bedCount: room.bedCount || "",
      availabilityStatus: room.availabilityStatus || "available",
      amenities: room.amenities || [],
    });
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingRoom(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading("submitting");

    try {
      const payload = { ...formData };
      if (payload.pricePerNight) payload.pricePerNight = Number(payload.pricePerNight);
      if (payload.floor) payload.floor = Number(payload.floor);
      if (payload.maxAdults) payload.maxAdults = Number(payload.maxAdults);
      if (payload.maxChildren) payload.maxChildren = Number(payload.maxChildren);
      if (payload.bedCount) payload.bedCount = Number(payload.bedCount);

      let res;
      if (editingRoom) {
        res = await updateRoom({ roomId: editingRoom._id, ...payload });
      } else {
        res = await createRoom({ hotelId, ...payload });
      }

      if (res?.data?.status) {
        toast.success(res.data.message || (editingRoom ? "Room updated" : "Room created"));
        closeModal();
        loadData();
      } else {
        toast.error(res?.data?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving room");
    }
    setActionLoading(null);
  };

  const handleDelete = async (roomId, roomNumber) => {
    if (window.confirm(`Delete room ${roomNumber}? This cannot be undone.`)) {
      setActionLoading(roomId);
      try {
        const res = await deleteRoom({ roomId });
        if (res?.data?.status) {
          toast.success("Room deleted");
          loadData();
        } else {
          toast.error(res?.data?.message || "Failed to delete");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting room");
      }
      setActionLoading(null);
    }
  };

  const statusColors = {
    available: "bg-emerald-500/20 text-emerald-400",
    booked: "bg-blue-500/20 text-blue-400",
    maintenance: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Rooms</h1>
          <p className="text-stone-400">Manage rooms for your hotel property.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus />
          Add Room
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No rooms found. Click "Add Room" to create your first room.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Room #</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Floor</th>
                  <th className="py-4 px-6">Price/Night</th>
                  <th className="py-4 px-6">Amenities</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-white">{room.roomNumber}</td>
                    <td className="py-4 px-6 capitalize">{room.roomType}</td>
                    <td className="py-4 px-6">{room.floor || "—"}</td>
                    <td className="py-4 px-6 text-emerald-400 font-medium">₹{room.pricePerNight?.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {room.amenities && room.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {room.amenities.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-300">{amenity}</span>
                          ))}
                          {room.amenities.length > 3 && <span className="text-[10px] text-stone-500">+{room.amenities.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[room.availabilityStatus] || ""}`}>
                        {room.availabilityStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="px-3 py-1 bg-stone-500/20 text-stone-300 hover:bg-stone-500/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <FiEdit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        disabled={actionLoading === room._id}
                        onClick={() => handleDelete(room._id, room.roomNumber)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        <FiTrash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ROOM MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold text-white">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h2>
              <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Required Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Room Number <span className="text-amber-500">*</span>
                  </label>
                  <input 
                    required 
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 101" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Room Type <span className="text-amber-500">*</span>
                  </label>
                  <select
                    required
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {ROOM_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Price Per Night (₹) <span className="text-amber-500">*</span>
                </label>
                <input 
                  required 
                  type="number"
                  min="0"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. 2500" 
                />
              </div>

              {/* Optional Fields */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-4">Optional Fields</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Floor</label>
                  <input 
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 3" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Bed Count</label>
                  <input 
                    type="number"
                    min="0"
                    name="bedCount"
                    value={formData.bedCount}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 2" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Max Adults</label>
                  <input 
                    type="number"
                    min="0"
                    name="maxAdults"
                    value={formData.maxAdults}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 2" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Max Children</label>
                  <input 
                    type="number"
                    min="0"
                    name="maxChildren"
                    value={formData.maxChildren}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 1" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Availability Status</label>
                <select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  {AVAILABILITY_STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-white/10 pt-4">
                <AmenityPicker
                  value={formData.amenities}
                  onChange={(amenities) => setFormData({ ...formData, amenities })}
                  fetchAmenities={fetchAmenities}
                  label="Room Amenities"
                  hint="In-room facilities from the master list. Guests can search by these."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Room description..." 
                />
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "submitting"}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {actionLoading === "submitting" ? "Saving..." : (editingRoom ? "Save Changes" : "Create Room")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRooms;
