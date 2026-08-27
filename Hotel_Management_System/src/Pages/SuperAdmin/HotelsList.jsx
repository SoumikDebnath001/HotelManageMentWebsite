import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX, FiCheckCircle, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getAllHotels, toggleHotelStatus, approveHotel, getAllCountryStates, updateHotel, deleteHotel } from "../../Services/superadmin.service";

const HotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]); // from getAllCountryStates
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Approval Modal State
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [approvalData, setApprovalData] = useState({
    countryId: "",
    stateName: "",
    cityName: "",
  });

  // Dependent dropdowns data
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Edit Modal State
  const [editingHotel, setEditingHotel] = useState(null);
  const [editFormData, setEditFormData] = useState({
    hotelName: "",
    description: "",
    email: "",
    mobileNumber: "",
    address: "",
    starRating: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, locationsRes] = await Promise.all([
        getAllHotels(),
        getAllCountryStates()
      ]);

      if (hotelsRes?.data?.status) {
        setHotels(hotelsRes.data.data || []);
      }
      if (locationsRes?.data?.status) {
        setLocations(locationsRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch hotels data");
    }
    setLoading(false);
  };

  // Handle Country Selection
  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    const country = locations.find(c => c._id === countryId);

    setApprovalData({ countryId, stateName: "", cityName: "" });
    setAvailableStates(country ? country.State : []);
    setAvailableCities([]);
  };

  // Handle State Selection
  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const state = availableStates.find(s => s.stateName === stateName);

    setApprovalData(prev => ({ ...prev, stateName, cityName: "" }));
    setAvailableCities(state ? state.city : []);
  };

  // Handle City Selection
  const handleCityChange = (e) => {
    setApprovalData(prev => ({ ...prev, cityName: e.target.value }));
  };

  const submitApproval = async (e) => {
    e.preventDefault();
    if (!approvalData.countryId || !approvalData.stateName || !approvalData.cityName) {
      return toast.error("Please select Country, State, and City");
    }

    setActionLoading("approving");
    try {
      const res = await approveHotel({
        hotelId: selectedHotel._id,
        status: "approved",
        ...approvalData
      });

      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel approved successfully");
        setSelectedHotel(null);
        setApprovalData({ countryId: "", stateName: "", cityName: "" });
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to approve hotel");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error approving hotel");
    }
    setActionLoading(null);
  };

  const handleUpdateStatus = async (hotelId, isActive) => {
    setActionLoading(hotelId);
    try {
      const res = await toggleHotelStatus({ hotelId, isActive });
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel status updated");
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to update hotel status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating hotel status");
    }
    setActionLoading(null);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    setEditFormData({
      hotelName: hotel.hotelName || "",
      description: hotel.description || "",
      email: hotel.email || "",
      mobileNumber: hotel.mobileNumber || "",
      address: hotel.address || "",
      starRating: hotel.starRating || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading("editing");
    try {
      const payload = { hotelId: editingHotel._id, ...editFormData };
      if (payload.starRating) {
        payload.starRating = Number(payload.starRating);
      }

      const res = await updateHotel(payload);
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel details updated successfully");
        setEditingHotel(null);
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to update hotel details");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating hotel details");
    }
    setActionLoading(null);
  };

  const handleDeleteHotel = async (hotelId, hotelName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${hotelName}? This action cannot be undone.`)) {
      setActionLoading(hotelId);
      try {
        const res = await deleteHotel({ hotelId });
        if (res?.data?.status) {
          toast.success("Hotel deleted successfully");
          loadData();
        } else {
          toast.error(res?.data?.message || "Failed to delete hotel");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting hotel");
      }
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Hotels Overview</h1>
          <p className="text-stone-400">View and manage all registered properties across the system.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No hotels found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Hotel Code</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Admin Contact</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {hotels.map((hotel) => (
                  <tr key={hotel._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-amber-400/90">{hotel.hotelCode || "—"}</td>
                    <td className="py-4 px-6 font-medium text-white">
                      {hotel.hotelName}
                      {!hotel.isActive && hotel.status === "approved" && (
                        <span className="ml-2 text-xs text-red-500">(Revoked)</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span>{hotel.email || "N/A"}</span>
                        <span className="text-xs text-stone-500">{hotel.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {hotel.cityName ? `${hotel.cityName}, ${hotel.stateName}` : "—"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${hotel.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                          hotel.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                            "bg-red-500/20 text-red-400"
                        }`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(hotel)}
                        className="px-3 py-1 bg-stone-500/20 text-stone-300 hover:bg-stone-500/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <FiEdit2 className="h-3 w-3" /> Edit
                      </button>

                      <button
                        disabled={actionLoading === hotel._id}
                        onClick={() => handleDeleteHotel(hotel._id, hotel.hotelName)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        <FiTrash2 className="h-3 w-3" /> Delete
                      </button>

                      {hotel.status === "pending" && (
                        <button
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setApprovalData({ countryId: "", stateName: "", cityName: "" });
                            setAvailableStates([]);
                            setAvailableCities([]);
                          }}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors text-xs font-medium"
                        >
                          Approve
                        </button>
                      )}

                      {hotel.status === "approved" && (
                        <>
                          {hotel.isActive ? (
                            <button
                              disabled={actionLoading === hotel._id}
                              onClick={() => handleUpdateStatus(hotel._id, false)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading === hotel._id}
                              onClick={() => handleUpdateStatus(hotel._id, true)}
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

      {/* APPROVAL MODAL */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-emerald-500/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" />
                Approve Hotel
              </h2>
              <button
                onClick={() => setSelectedHotel(null)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitApproval} className="p-6 space-y-4">
              <div className="mb-4">
                <p className="text-sm text-stone-400">
                  You are approving <strong className="text-white">{selectedHotel.hotelName}</strong>.
                  Please select its geographic location to generate the unique Hotel Code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Country *</label>
                <select
                  required
                  value={approvalData.countryId}
                  onChange={handleCountryChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="" disabled>Select Country...</option>
                  {locations.map(country => (
                    <option key={country._id} value={country._id}>
                      {country.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">State *</label>
                <select
                  required
                  disabled={!approvalData.countryId || availableStates.length === 0}
                  value={approvalData.stateName}
                  onChange={handleStateChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="" disabled>Select State...</option>
                  {availableStates.map((state, idx) => (
                    <option key={idx} value={state.stateName}>
                      {state.stateName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">City *</label>
                <select
                  required
                  disabled={!approvalData.stateName || availableCities.length === 0}
                  value={approvalData.cityName}
                  onChange={handleCityChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="" disabled>Select City...</option>
                  {availableCities.map((city, idx) => (
                    <option key={idx} value={city.cityName}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedHotel(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "approving"}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
                >
                  {actionLoading === "approving" ? "Approving..." : "Confirm Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOTEL MODAL */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <FiEdit2 className="text-amber-500" />
                Edit Hotel
              </h2>
              <button
                onClick={() => setEditingHotel(null)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Hotel Name <span className="text-amber-500">*</span></label>
                <input
                  required
                  name="hotelName"
                  value={editFormData.hotelName}
                  onChange={handleEditInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Grand Plaza"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Tell us about the hotel..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="hotel@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleEditInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Star Rating</label>
                  <select
                    name="starRating"
                    value={editFormData.starRating}
                    onChange={handleEditInputChange}
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="123 Main St"
                />
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "editing"}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {actionLoading === "editing" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsList;
