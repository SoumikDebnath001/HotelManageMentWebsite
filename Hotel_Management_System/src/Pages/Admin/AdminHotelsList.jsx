import React, { useEffect, useState } from "react";
import { FiPlus, FiX, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchMyHotels, createHotel, updateHotel } from "../../Services/admin.service";

const AdminHotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotelInfo, setSelectedHotelInfo] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    hotelName: "",
    description: "",
    email: "",
    mobileNumber: "",
    address: "",
    starRating: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await fetchMyHotels();
      if (res?.data?.status) {
        setHotels(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch hotels");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...formData };
      if (payload.starRating) {
        payload.starRating = Number(payload.starRating);
      }
      const res = await createHotel(payload);
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel created successfully");
        setIsModalOpen(false);
        setFormData({ hotelName: "", description: "", email: "", mobileNumber: "", address: "", starRating: "" });
        loadHotels();
      } else {
        toast.error(res?.data?.message || "Failed to create hotel");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating hotel");
    }
    setCreating(false);
  };

  const handleUpdateStatus = async (hotelId, updates) => {
    setActionLoading(hotelId);
    try {
      const res = await updateHotel({ hotelId, ...updates });
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel updated successfully");
        loadHotels();
      } else {
        toast.error(res?.data?.message || "Failed to update hotel");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating hotel");
    }
    setActionLoading(null);
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">My Hotels</h1>
          <p className="text-stone-400">View and manage the hotels under your administration.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus />
          Add Hotel
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No hotels assigned yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {hotels.map((hotel) => (
                  <tr key={hotel._id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setSelectedHotelInfo(hotel)}>
                    <td className="py-4 px-6 font-medium text-white">
                      {hotel.hotelName}
                      {!hotel.isActive && hotel.status === 'approved' && <span className="ml-2 text-xs text-red-500">(Revoked)</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-amber-400/80">
                      {hotel.hotelCode || <span className="text-stone-500 italic">Pending...</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        hotel.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                        hotel.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {hotel.status === "approved" && (
                        <>
                          {hotel.isActive ? (
                            <button
                              disabled={actionLoading === hotel._id}
                              onClick={() => handleUpdateStatus(hotel._id, { isActive: false })}
                              className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading === hotel._id}
                              onClick={() => handleUpdateStatus(hotel._id, { isActive: true })}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              Resume
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HOTEL INFO MODAL */}
      {selectedHotelInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <FiInfo className="text-amber-500" />
                Hotel Information
              </h2>
              <button 
                onClick={() => setSelectedHotelInfo(null)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-stone-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Hotel Name</label>
                  <p className="font-medium text-white">{selectedHotelInfo.hotelName}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Hotel Code</label>
                  <p className="font-mono font-medium text-amber-400">{selectedHotelInfo.hotelCode || "Pending Approval"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Email</label>
                  <p>{selectedHotelInfo.email || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Mobile Number</label>
                  <p>{selectedHotelInfo.mobileNumber || "—"}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Address</label>
                <p>{selectedHotelInfo.address || "—"}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Description</label>
                <p className="whitespace-pre-wrap">{selectedHotelInfo.description || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Star Rating</label>
                  <p>{selectedHotelInfo.starRating ? `${selectedHotelInfo.starRating} Stars` : "—"}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Status</label>
                  <p className="capitalize">{selectedHotelInfo.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE HOTEL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold text-white">Create New Hotel</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Hotel Name <span className="text-amber-500">*</span></label>
                <input 
                  required 
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Grand Plaza" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Description <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Tell us about the hotel..." 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Email Address <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="hotel@example.com" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Mobile Number <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                  <input 
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="+1 234 567 890" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Star Rating <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Address <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="123 Main St" 
                />
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotelsList;
