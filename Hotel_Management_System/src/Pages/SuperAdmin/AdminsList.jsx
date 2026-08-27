import React, { useState, useEffect } from "react";
import GlassCard from "../../Features/Auth/Components/GlassCard";
import { FiUsers, FiPlus, FiEdit2, FiCheckCircle, FiXCircle, FiHome } from "react-icons/fi";
import { getAllAdmins, updateAdmin } from "../../Services/superadmin.service";
import { AddEditAdminModal, AdminHotelsModal } from "./Components/AdminManagementModals";
import toast from "react-hot-toast";

const AdminsList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'revoked'
  
  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);
  
  const [isHotelsModalOpen, setIsHotelsModalOpen] = useState(false);
  const [selectedAdminForHotels, setSelectedAdminForHotels] = useState(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAllAdmins();
      if (res.error) {
        toast.error(res.error);
      } else if (res?.data?.status && res?.data?.data) {
        setAdmins(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load admins");
    }
    setLoading(false);
  };

  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const res = await updateAdmin({ adminId, isActive: !currentStatus });
      if (res?.data?.status) {
        toast.success(`Admin ${!currentStatus ? 'activated' : 'revoked'} successfully`);
        loadAdmins();
      } else {
        toast.error(res?.data?.message || "Failed to update admin status");
      }
    } catch (error) {
      toast.error("Error updating admin status");
    }
  };

  const openAddModal = () => {
    setAdminToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (admin) => {
    setAdminToEdit(admin);
    setIsAddEditModalOpen(true);
  };

  const openHotelsModal = (admin) => {
    setSelectedAdminForHotels(admin);
    setIsHotelsModalOpen(true);
  };

  const filteredAdmins = admins.filter(admin => {
    if (filter === "active") return admin.isActive === true;
    if (filter === "revoked") return admin.isActive === false;
    return true;
  });

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Administrators</h1>
          <p className="mt-1 text-sm text-stone-400">Manage hotel administrators and platform staff.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-amber-500 hover:to-amber-600 transition-all"
        >
          <FiPlus className="h-5 w-5" /> Add Admin
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl w-fit backdrop-blur-md">
        {["all", "active", "revoked"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
              filter === f 
                ? "bg-amber-600 text-white shadow-md" 
                : "text-stone-400 hover:text-white"
            }`}
          >
            {f} Admins
          </button>
        ))}
      </div>

      <GlassCard className="border-white/15 min-h-[50vh]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <FiUsers className="h-12 w-12 text-stone-600 mb-4" />
            <h3 className="text-lg font-semibold text-white">No Admins Found</h3>
            <p className="text-sm text-stone-400 mt-1">There are no {filter !== "all" ? filter : ""} administrators to display.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAdmins.map((admin) => (
              <div 
                key={admin._id} 
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-black/40 p-5 transition-all hover:bg-white/5 ${
                  admin.isActive ? "border-white/10" : "border-red-500/20 bg-red-950/10"
                }`}
              >
                {!admin.isActive && (
                  <div className="absolute top-0 right-0 rounded-bl-xl bg-red-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Revoked
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${
                    admin.isActive ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-stone-500/30 bg-stone-500/10 text-stone-400"
                  }`}>
                    <FiUsers className="h-6 w-6" />
                  </div>
                  <div className="flex-1 truncate pt-1">
                    <h3 className="truncate font-semibold text-white text-lg">
                      {admin.name || "No Name Set"}
                    </h3>
                    <p className="truncate text-xs text-stone-400">{admin.email}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(admin)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-stone-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  
                  <button
                    onClick={() => openHotelsModal(admin)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
                  >
                    <FiHome className="h-3.5 w-3.5" /> Properties
                  </button>

                  <button
                    onClick={() => handleToggleAdminStatus(admin._id, admin.isActive)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition-all ${
                      admin.isActive 
                        ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {admin.isActive ? <FiXCircle className="h-3.5 w-3.5" /> : <FiCheckCircle className="h-3.5 w-3.5" />}
                    {admin.isActive ? "Revoke" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <AddEditAdminModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        adminToEdit={adminToEdit}
        onSuccess={() => {
          setIsAddEditModalOpen(false);
          loadAdmins();
        }}
      />

      <AdminHotelsModal
        isOpen={isHotelsModalOpen}
        onClose={() => setIsHotelsModalOpen(false)}
        admin={selectedAdminForHotels}
      />
    </div>
  );
};

export default AdminsList;
