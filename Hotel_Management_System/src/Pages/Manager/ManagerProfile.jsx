import React, { useEffect, useState } from "react";
import { FiUser, FiHome, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchMyProfile, fetchMyHotel, changePassword } from "../../Services/manager.service";

const ManagerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [hotel, setHotel] = useState(null);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, hotelRes] = await Promise.all([
        fetchMyProfile(),
        fetchMyHotel(),
      ]);

      if (profileRes?.data?.status) {
        setProfile(profileRes.data.data);
      }
      const hotels = hotelRes?.data?.data || [];
      if (hotels.length > 0) {
        setHotel(hotels[0]);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    setChangingPassword(true);
    try {
      const res = await changePassword(passwordForm);
      if (res?.data?.status) {
        toast.success(res.data.message || "Password changed successfully");
        setPasswordForm({ oldPassword: "", newPassword: "" });
        setShowPasswordSection(false);
      } else {
        toast.error(res?.data?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password");
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in duration-500 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">My Profile</h1>
        <p className="text-stone-400">Your personal information and hotel assignment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FiUser className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Name</label>
              <p className="text-white font-medium">{profile?.name || "—"}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Email</label>
              <p className="text-stone-300">{profile?.email || "—"}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Role</label>
              <p className="text-amber-400 capitalize font-medium">{profile?.role || "—"}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                profile?.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {profile?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FiHome className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Hotel Information</h2>
          </div>

          {hotel ? (
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Hotel Name</label>
                <p className="text-white font-medium">{hotel.hotelName}</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Hotel Code</label>
                <p className="font-mono text-amber-400">{hotel.hotelCode || "Pending Approval"}</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Address</label>
                <p className="text-stone-300">{hotel.address || "—"}</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Hotel Email</label>
                <p className="text-stone-300">{hotel.email || "—"}</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  hotel.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                  hotel.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {hotel.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-stone-400 text-sm">No hotel assigned yet.</p>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FiLock className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            {showPasswordSection ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Current Password</label>
              <input
                required
                type={showOldPass ? "text" : "password"}
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none pr-12"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-10 text-stone-400 hover:text-white">
                {showOldPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">New Password</label>
              <input
                required
                type={showNewPass ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none pr-12"
                placeholder="Enter new password (min 6 chars)"
              />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-10 text-stone-400 hover:text-white">
                {showNewPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManagerProfile;
