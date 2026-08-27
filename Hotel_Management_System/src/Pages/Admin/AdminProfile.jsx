import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiCheck } from "react-icons/fi";
import { fetchMyProfile, sendPasswordOtp, changePasswordWithOtp } from "../../Services/admin.service";
import { useDispatch } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchMyProfile();
      if (res?.data?.status) {
        setProfile(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch profile");
    }
    setLoading(false);
  };

  const handlePasswordDataChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setSubmitting(true);
    try {
      const res = await sendPasswordOtp();
      if (res?.data?.status) {
        toast.success(res.data.message || "OTP sent successfully");
        setIsOtpSent(true);
      } else {
        toast.error(res?.data?.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
    setSubmitting(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.otp) {
      return toast.error("Please enter the OTP");
    }

    setSubmitting(true);
    try {
      const res = await changePasswordWithOtp({
        newPassword: passwordData.newPassword,
        otp: passwordData.otp
      });

      if (res?.data?.status) {
        toast.success(res.data.message || "Password changed successfully");
        // Log out user
        dispatch(logout());
        navigate("/");
      } else {
        toast.error(res?.data?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in duration-500 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">My Profile</h1>
        <p className="text-stone-400">View your personal information and update your password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Info Card */}
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-8 h-fit">
          <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">Full Name</label>
              <div className="flex items-center gap-3 text-stone-300 bg-white/5 p-4 rounded-xl border border-white/5">
                <FiUser className="text-amber-500" />
                <span className="font-medium">{profile?.name}</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">Email Address</label>
              <div className="flex items-center gap-3 text-stone-300 bg-white/5 p-4 rounded-xl border border-white/5">
                <FiMail className="text-amber-500" />
                <span className="font-medium">{profile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FiLock className="text-amber-500" />
            Change Password
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordDataChange}
                disabled={isOtpSent}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordDataChange}
                disabled={isOtpSent}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                placeholder="Confirm new password"
              />
            </div>

            {!isOtpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={submitting || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
              >
                {submitting ? "Sending OTP..." : "Send OTP to Email"}
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-5 animate-in slide-in-from-top-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-200/80 mb-3 flex items-center gap-2">
                    <FiCheck className="text-amber-400" />
                    An OTP has been sent to your email address.
                  </p>
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-500/80 mb-1 block">Enter OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={passwordData.otp}
                    onChange={handlePasswordDataChange}
                    className="w-full bg-black/50 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 123456"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
                >
                  {submitting ? "Verifying..." : "Verify & Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="w-full py-2 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
