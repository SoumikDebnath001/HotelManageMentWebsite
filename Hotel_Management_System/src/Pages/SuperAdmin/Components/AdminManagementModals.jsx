import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiXCircle, FiHome, FiEdit2 } from "react-icons/fi";
import { createAdmin, updateAdmin, getAllHotels, toggleHotelStatus } from "../../../Services/superadmin.service";
import toast from "react-hot-toast";

const ModalBackdrop = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-black/45 p-6 shadow-2xl backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-500/10 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/10 blur-[70px]" />
      {children}
    </div>
  </div>
);

export const AddEditAdminModal = ({ isOpen, onClose, adminToEdit, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminToEdit) {
      setEmail(adminToEdit.email || "");
      setName(adminToEdit.name || "");
    } else {
      setEmail("");
      setName("");
    }
  }, [adminToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (adminToEdit) {
        // Editing admin
        const res = await updateAdmin({ adminId: adminToEdit._id, name });
        if (res?.data?.status) {
          toast.success(res.data.message || "Admin updated successfully");
          onSuccess();
        } else {
          toast.error(res?.data?.message || "Failed to update admin");
        }
      } else {
        // Creating admin
        const res = await createAdmin({ email });
        if (res?.data?.status) {
          toast.success(res.data.message || "Admin created successfully");
          onSuccess();
        } else {
          toast.error(res?.data?.message || "Failed to create admin");
        }
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
    setLoading(false);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="font-serif text-2xl font-semibold text-white">
          {adminToEdit ? "Edit Admin" : "Add New Admin"}
        </h2>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!adminToEdit}
            placeholder="admin@hotel.com"
            required
            className="w-full rounded-xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
          />
          {!adminToEdit && (
            <p className="mt-1 text-[11px] text-stone-400">
              The email will be used as their default password initially.
            </p>
          )}
        </div>

        {adminToEdit && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
              required
              className="w-full rounded-xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-medium text-white shadow-lg hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 transition-all"
          >
            {loading ? "Saving..." : "Save Admin"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};

export const AdminHotelsModal = ({ isOpen, onClose, admin }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && admin) {
      loadHotels();
    }
  }, [isOpen, admin]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await getAllHotels({ adminId: admin._id });
      if (res?.data?.status && res?.data?.data) {
        setHotels(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load hotels for this admin");
    }
    setLoading(false);
  };

  const handleToggleHotelStatus = async (hotelId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await toggleHotelStatus({ hotelId, isActive: newStatus });
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel status updated");
        loadHotels(); // Reload the list
      } else {
        toast.error(res?.data?.message || "Failed to update hotel status");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-white">
            Properties Managed
          </h2>
          <p className="mt-1 text-sm text-stone-400">Admin: {admin?.name || admin?.email}</p>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-12">
            <FiHome className="mx-auto h-12 w-12 text-stone-600 mb-3" />
            <p className="text-stone-400">No properties associated with this admin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hotels.map(hotel => (
              <div key={hotel._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                <div>
                  <h4 className="font-semibold text-white">{hotel.hotelName}</h4>
                  <p className="text-xs text-stone-400 mt-1">{hotel.hotel || "No Code"} &bull; {hotel.cityName}, {hotel.stateName}</p>
                  
                  <div className="mt-2 flex gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      hotel.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      hotel.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {hotel.status}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      hotel.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {hotel.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleHotelStatus(hotel._id, hotel.isActive)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    hotel.isActive 
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                  }`}
                >
                  {hotel.isActive ? <FiXCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
                  {hotel.isActive ? "Revoke Property" : "Activate Property"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
};
