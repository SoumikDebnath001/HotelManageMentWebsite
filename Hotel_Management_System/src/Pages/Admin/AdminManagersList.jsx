import React, { useEffect, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchMyManagers, createManager, fetchMyHotels, updateManager } from "../../Services/admin.service";

const AdminManagersList = () => {
  const [managers, setManagers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hotelId: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [managersRes, hotelsRes] = await Promise.all([
        fetchMyManagers(),
        fetchMyHotels()
      ]);
      
      if (managersRes?.data?.status) {
        setManagers(managersRes.data.data || []);
      }
      if (hotelsRes?.data?.status) {
        setHotels(hotelsRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
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
      const res = await createManager(formData);
      if (res?.data?.status) {
        toast.success(res.data.message || "Manager created successfully");
        setIsModalOpen(false);
        setFormData({ name: "", email: "", hotelId: "" });
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to create manager");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating manager");
    }
    setCreating(false);
  };

  const handleUpdateStatus = async (managerId, updates) => {
    setActionLoading(managerId);
    try {
      const res = await updateManager({ managerId, ...updates });
      if (res?.data?.status) {
        toast.success(res.data.message || "Manager status updated");
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to update manager status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating manager status");
    }
    setActionLoading(null);
  };

  // Helper to find hotel name by ID
  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => h._id === hotelId);
    return hotel ? hotel.hotelName : "Unknown Hotel";
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Managers</h1>
          <p className="text-stone-400">View and manage your hotel managers.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus />
          Add Manager
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : managers.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No managers found. Add a manager to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Assigned Hotel</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {managers.map((manager) => (
                  <tr key={manager._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{manager.name}</td>
                    <td className="py-4 px-6">{manager.email}</td>
                    <td className="py-4 px-6">{getHotelName(manager.hotelId)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        manager.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {manager.isActive ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {manager.isActive ? (
                        <button
                          disabled={actionLoading === manager._id}
                          onClick={() => handleUpdateStatus(manager._id, { isActive: false })}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading === manager._id}
                          onClick={() => handleUpdateStatus(manager._id, { isActive: true })}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                        >
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MANAGER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-white">Create New Manager</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Manager Name</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. John Doe" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Email Address *</label>
                <input 
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="manager@example.com" 
                />
                <p className="mt-1 text-[10px] text-stone-500">This will be used as their default password initially.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Assign to Hotel *</label>
                <select 
                  required
                  name="hotelId"
                  value={formData.hotelId}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="" disabled>Select a hotel...</option>
                  {hotels.map(hotel => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.hotelName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
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
                  {creating ? "Creating..." : "Create Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagersList;
