import React, { useEffect, useState } from "react";
import { FiPlus, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchRoomTypes, createRoomType, updateRoomType, deleteRoomType } from "../../Services/superadmin.service";

const emptyForm = {
  typeName: "",
  description: "",
  basePrice: "",
  maxAdults: "",
  maxChildren: "",
  bedCount: "",
};

const SuperAdminRoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    setLoading(true);
    try {
      const res = await fetchRoomTypes();
      if (res?.data?.status) {
        setRoomTypes(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch room types");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData({ ...emptyForm });
    setEditingType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rt) => {
    setEditingType(rt);
    setFormData({
      typeName: rt.typeName || "",
      description: rt.description || "",
      basePrice: rt.basePrice || "",
      maxAdults: rt.maxAdults || "",
      maxChildren: rt.maxChildren || "",
      bedCount: rt.bedCount || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading("submitting");
    try {
      const payload = { ...formData };
      if (payload.basePrice) payload.basePrice = Number(payload.basePrice);
      if (payload.maxAdults) payload.maxAdults = Number(payload.maxAdults);
      if (payload.maxChildren) payload.maxChildren = Number(payload.maxChildren);
      if (payload.bedCount) payload.bedCount = Number(payload.bedCount);

      let res;
      if (editingType) {
        res = await updateRoomType({ roomTypeId: editingType._id, ...payload });
      } else {
        res = await createRoomType(payload);
      }

      if (res?.data?.status) {
        toast.success(res.data.message || (editingType ? "Room type updated" : "Room type created"));
        closeModal();
        loadRoomTypes();
      } else {
        toast.error(res?.data?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving room type");
    }
    setActionLoading(null);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete room type "${name}"? This cannot be undone.`)) {
      setActionLoading(id);
      try {
        const res = await deleteRoomType({ roomTypeId: id });
        if (res?.data?.status) {
          toast.success("Room type deleted");
          loadRoomTypes();
        } else {
          toast.error(res?.data?.message || "Failed to delete");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting room type");
      }
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Room Types</h1>
          <p className="text-stone-400">Define and manage room categories for your hotels.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus />
          Add Room Type
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : roomTypes.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No room types defined yet. Click "Add Room Type" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Type Name</th>
                  <th className="py-4 px-6">Base Price</th>
                  <th className="py-4 px-6">Max Adults</th>
                  <th className="py-4 px-6">Max Children</th>
                  <th className="py-4 px-6">Beds</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {roomTypes.map((rt) => (
                  <tr key={rt._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-white capitalize">{rt.typeName}</td>
                    <td className="py-4 px-6 text-emerald-400 font-medium">{rt.basePrice ? `₹${rt.basePrice.toLocaleString()}` : "—"}</td>
                    <td className="py-4 px-6">{rt.maxAdults || "—"}</td>
                    <td className="py-4 px-6">{rt.maxChildren || "—"}</td>
                    <td className="py-4 px-6">{rt.bedCount || "—"}</td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(rt)}
                        className="px-3 py-1 bg-stone-500/20 text-stone-300 hover:bg-stone-500/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <FiEdit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        disabled={actionLoading === rt._id}
                        onClick={() => handleDelete(rt._id, rt.typeName)}
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

      {/* CREATE / EDIT ROOM TYPE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold text-white">
                {editingType ? "Edit Room Type" : "Add New Room Type"}
              </h2>
              <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Type Name <span className="text-amber-500">*</span>
                </label>
                <input 
                  required 
                  name="typeName"
                  value={formData.typeName}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Deluxe Suite" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Description <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Describe this room type..." 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Base Price (₹) <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span>
                </label>
                <input 
                  type="number"
                  min="0"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. 5000" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Max Adults <span className="text-stone-500 font-normal normal-case tracking-normal">(Opt.)</span>
                  </label>
                  <input 
                    type="number"
                    min="0"
                    name="maxAdults"
                    value={formData.maxAdults}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="2" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Max Children <span className="text-stone-500 font-normal normal-case tracking-normal">(Opt.)</span>
                  </label>
                  <input 
                    type="number"
                    min="0"
                    name="maxChildren"
                    value={formData.maxChildren}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="1" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Beds <span className="text-stone-500 font-normal normal-case tracking-normal">(Opt.)</span>
                  </label>
                  <input 
                    type="number"
                    min="0"
                    name="bedCount"
                    value={formData.bedCount}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="2" 
                  />
                </div>
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
                  {actionLoading === "submitting" ? "Saving..." : (editingType ? "Save Changes" : "Create Type")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminRoomTypes;
