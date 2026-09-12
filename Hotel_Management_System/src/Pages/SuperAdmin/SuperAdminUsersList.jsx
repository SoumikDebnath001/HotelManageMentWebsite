import React, { useEffect, useState, useMemo } from "react";
import { FiSearch, FiFilter, FiUser, FiX, FiShieldOff, FiShield, FiTrash2, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchAllUsers, updateUserStatus, deleteUser } from "../../Services/superadmin.service";

const SuperAdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Active, Suspended
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers();
      if (res?.data?.status) {
        setUsers(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const handleToggleStatus = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.isActive ? 'revoke' : 'resume'} access for ${user.email}?`)) {
      setActionLoading(user._id);
      try {
        const res = await updateUserStatus({ userId: user._id, isActive: !user.isActive });
        if (res?.data?.status) {
          toast.success(res.data.message || "User status updated");
          loadUsers();
        } else {
          toast.error(res?.data?.message || "Operation failed");
        }
      } catch (error) {
        toast.error("Error updating user status");
      }
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to completely delete user ${user.email}? This action cannot be undone.`)) {
      setActionLoading(`delete-${user._id}`);
      try {
        const res = await deleteUser({ userId: user._id });
        if (res?.data?.status) {
          toast.success("User deleted successfully");
          loadUsers();
        } else {
          toast.error(res?.data?.message || "Operation failed");
        }
      } catch (error) {
        toast.error("Error deleting user");
      }
      setActionLoading(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.firstMiddleName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.lastName || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        statusFilter === "All" ||
        (statusFilter === "Active" && user.isActive) ||
        (statusFilter === "Suspended" && !user.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, statusFilter]);

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Users Directory</h1>
          <p className="text-stone-400">Manage all registered end-users on the platform.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors backdrop-blur-md"
          />
        </div>
        <div className="relative sm:min-w-[200px]">
          <FiFilter className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-amber-500 transition-colors backdrop-blur-md"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <FiUser className="h-12 w-12 text-stone-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-300">No users found</h3>
            <p className="text-stone-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 text-white font-medium capitalize">
                      {user.firstMiddleName || user.lastName ? `${user.firstMiddleName || ''} ${user.lastName || ''}`.trim() : "—"}
                    </td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">{user.contact?.mobileNumber || "—"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-2 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                        title="View Info"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        disabled={actionLoading === user._id}
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          user.isActive ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        }`}
                        title={user.isActive ? "Revoke Access" : "Resume Access"}
                      >
                        {user.isActive ? <FiShieldOff className="h-4 w-4" /> : <FiShield className="h-4 w-4" />}
                      </button>
                      <button
                        disabled={actionLoading === `delete-${user._id}`}
                        onClick={() => handleDelete(user)}
                        className="px-2 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete User"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Info Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-amber-500" />
                </div>
                User Information
              </h2>
              <button onClick={() => setSelectedUser(null)} className="text-stone-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Core Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-4">Account</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Full Name</p>
                      <p className="text-white font-medium capitalize">{selectedUser.firstMiddleName || ''} {selectedUser.lastName || ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Email</p>
                      <p className="text-white font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedUser.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {selectedUser.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-4">Personal Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Gender</p>
                      <p className="text-white font-medium">{selectedUser.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Date of Birth</p>
                      <p className="text-white font-medium">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Marital Status</p>
                      <p className="text-white font-medium">{selectedUser.maritalStatus || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-4">Location & Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Phone Number</p>
                      <p className="text-white font-medium">{selectedUser.contact?.mobileNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Nationality</p>
                      <p className="text-white font-medium">{selectedUser.nationalityName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">City / State</p>
                      <p className="text-white font-medium">
                        {selectedUser.cityName || "—"}, {selectedUser.stateName || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-4">Documents</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Passport Number</p>
                      <p className="text-white font-mono">{selectedUser.documents?.passportNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">PAN Card</p>
                      <p className="text-white font-mono">{selectedUser.documents?.panCardNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Issuing Country</p>
                      <p className="text-white font-medium">{selectedUser.documents?.issuingCountry || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsersList;
